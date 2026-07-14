/**
 * Unit Tests: AuthService
 *
 * Uses Jest manual mocks to isolate the service from real DB and Redis.
 * No actual connections are made — everything is faked via jest.fn().
 */

const bcrypt = require('bcryptjs');
const AuthService = require('../../src/modules/auth/auth.service');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Creates a fresh mock repository for each test.
 */
function createMockRepository(overrides = {}) {
  return {
    findUserByEmail: jest.fn(),
    findUserById: jest.fn(),
    createResidentUser: jest.fn(),
    updateLastLogin: jest.fn(),
    ...overrides,
  };
}

/**
 * Creates a fresh mock Redis client for each test.
 */
function createMockRedis() {
  return {
    set: jest.fn().mockResolvedValue('OK'),
    get: jest.fn().mockResolvedValue('valid'),
    del: jest.fn().mockResolvedValue(1),
  };
}

/**
 * Returns a realistic user object as Prisma would return it.
 */
function makeUser(overrides = {}) {
  return {
    id: 'user-uuid-1234',
    email: 'test@society.com',
    passwordHash: bcrypt.hashSync('Password@123', 12),
    role: 'resident',
    status: 'active',
    phone: null,
    residentProfile: {
      id: 'profile-uuid-1234',
      fullName: 'Test Resident',
      flatId: 'flat-uuid-1234',
    },
    ...overrides,
  };
}

// ─── register() ───────────────────────────────────────────────────────────────

describe('AuthService.register()', () => {
  let service;
  let repo;
  let redis;

  beforeEach(() => {
    repo = createMockRepository();
    redis = createMockRedis();
    service = new AuthService(repo, redis);
  });

  it('registers a new user and returns accessToken + refreshToken', async () => {
    repo.findUserByEmail.mockResolvedValue(null); // No existing user
    const createdUser = makeUser();
    repo.createResidentUser.mockResolvedValue(createdUser);

    const result = await service.register({
      email: 'test@society.com',
      password: 'Password@123',
      fullName: 'Test Resident',
      flatId: 'flat-uuid-1234',
    });

    expect(result.tokens.accessToken).toBeDefined();
    expect(result.tokens.refreshToken).toBeDefined();
    expect(result.user.email).toBe('test@society.com');
    expect(result.user.role).toBe('resident');
    // Password must not be exposed in the response
    expect(result.user.passwordHash).toBeUndefined();
  });

  it('throws ConflictError when email already exists', async () => {
    repo.findUserByEmail.mockResolvedValue(makeUser()); // User exists

    await expect(
      service.register({
        email: 'test@society.com',
        password: 'Password@123',
        fullName: 'Test Resident',
        flatId: 'flat-uuid-1234',
      })
    ).rejects.toThrow('User with this email already exists.');
  });

  it('stores refresh token in Redis on successful registration', async () => {
    repo.findUserByEmail.mockResolvedValue(null);
    repo.createResidentUser.mockResolvedValue(makeUser());

    await service.register({
      email: 'test@society.com',
      password: 'Password@123',
      fullName: 'Test Resident',
      flatId: 'flat-uuid-1234',
    });

    expect(redis.set).toHaveBeenCalledWith(
      expect.stringMatching(/^refresh:/),
      'valid',
      'EX',
      604800
    );
  });

  it('hashes the password before storing (never stores plain text)', async () => {
    repo.findUserByEmail.mockResolvedValue(null);

    let capturedData;
    repo.createResidentUser.mockImplementation(async (data) => {
      capturedData = data;
      return makeUser();
    });

    await service.register({
      email: 'test@society.com',
      password: 'Password@123',
      fullName: 'Test Resident',
      flatId: 'flat-uuid-1234',
    });

    // passwordHash must not equal the plain text password
    expect(capturedData.passwordHash).not.toBe('Password@123');
    // But must be a valid bcrypt hash
    const isValidHash = await bcrypt.compare('Password@123', capturedData.passwordHash);
    expect(isValidHash).toBe(true);
  });
});

// ─── login() ──────────────────────────────────────────────────────────────────

describe('AuthService.login()', () => {
  let service;
  let repo;
  let redis;

  beforeEach(() => {
    repo = createMockRepository();
    redis = createMockRedis();
    service = new AuthService(repo, redis);
  });

  it('returns tokens on valid credentials', async () => {
    const user = makeUser();
    repo.findUserByEmail.mockResolvedValue(user);
    repo.updateLastLogin.mockResolvedValue(user);

    const result = await service.login({
      email: 'test@society.com',
      password: 'Password@123',
    });

    expect(result.tokens.accessToken).toBeDefined();
    expect(result.tokens.refreshToken).toBeDefined();
    expect(result.user.email).toBe('test@society.com');
  });

  it('throws UnauthorizedError for non-existent user', async () => {
    repo.findUserByEmail.mockResolvedValue(null);

    await expect(
      service.login({ email: 'nobody@society.com', password: 'Password@123' })
    ).rejects.toThrow('Invalid credentials or inactive account.');
  });

  it('throws UnauthorizedError for wrong password', async () => {
    repo.findUserByEmail.mockResolvedValue(makeUser());

    await expect(
      service.login({ email: 'test@society.com', password: 'WrongPassword' })
    ).rejects.toThrow('Invalid credentials.');
  });

  it('throws UnauthorizedError for suspended account', async () => {
    repo.findUserByEmail.mockResolvedValue(makeUser({ status: 'suspended' }));

    await expect(
      service.login({ email: 'test@society.com', password: 'Password@123' })
    ).rejects.toThrow('Invalid credentials or inactive account.');
  });

  it('throws UnauthorizedError for inactive account', async () => {
    repo.findUserByEmail.mockResolvedValue(makeUser({ status: 'inactive' }));

    await expect(
      service.login({ email: 'test@society.com', password: 'Password@123' })
    ).rejects.toThrow('Invalid credentials or inactive account.');
  });

  it('calls updateLastLogin on successful login', async () => {
    const user = makeUser();
    repo.findUserByEmail.mockResolvedValue(user);
    repo.updateLastLogin.mockResolvedValue(user);

    await service.login({ email: 'test@society.com', password: 'Password@123' });

    expect(repo.updateLastLogin).toHaveBeenCalledWith('user-uuid-1234');
  });
});

// ─── refreshToken() ───────────────────────────────────────────────────────────

describe('AuthService.refreshToken()', () => {
  let service;
  let repo;
  let redis;

  beforeEach(() => {
    repo = createMockRepository();
    redis = createMockRedis();
    service = new AuthService(repo, redis);
  });

  it('throws UnauthorizedError for invalid refresh token', async () => {
    await expect(
      service.refreshToken('invalid-token-string')
    ).rejects.toThrow('Invalid or expired refresh token.');
  });

  it('throws UnauthorizedError when token is revoked in Redis', async () => {
    // First get a real token
    repo.findUserByEmail.mockResolvedValue(null);
    repo.createResidentUser.mockResolvedValue(makeUser());

    const loginResult = await service.register({
      email: 'test@society.com',
      password: 'Password@123',
      fullName: 'Test',
      flatId: 'flat-id',
    });

    // Simulate Redis returning null (token revoked)
    redis.get.mockResolvedValue(null);

    await expect(
      service.refreshToken(loginResult.tokens.refreshToken)
    ).rejects.toThrow('Invalid or expired refresh token.');
  });
});

// ─── logout() ─────────────────────────────────────────────────────────────────

describe('AuthService.logout()', () => {
  it('calls Redis DEL with the correct key', async () => {
    const repo = createMockRepository();
    const redis = createMockRedis();
    const service = new AuthService(repo, redis);

    await service.logout('user-123', 'jti-456');

    expect(redis.del).toHaveBeenCalledWith('refresh:user-123:jti-456');
  });

  it('does not throw if no jti is provided', async () => {
    const repo = createMockRepository();
    const redis = createMockRedis();
    const service = new AuthService(repo, redis);

    await expect(service.logout('user-123', null)).resolves.toBeUndefined();
    expect(redis.del).not.toHaveBeenCalled();
  });
});
