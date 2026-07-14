/**
 * Integration Tests: Auth Routes
 * 
 * Tests the full HTTP layer (routes → controller → service → repository → DB).
 * Uses a real test database (configured via TEST_DATABASE_URL) and supertest
 * to fire actual HTTP requests against the Express app.
 *
 * Run: npm test
 */

const request = require('supertest');
const app = require('../../src/app');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL } },
});

// ─── Test data ────────────────────────────────────────────────────────────────

const TEST_EMAIL = `integration_test_${Date.now()}@society.com`;
const TEST_PASSWORD = 'TestPass@123';
let TEST_FLAT_ID; // Set after creating a block + flat in beforeAll

// ─── Setup / Teardown ─────────────────────────────────────────────────────────

beforeAll(async () => {
  // Create a test block and flat so registration has a valid flatId
  const block = await prisma.block.upsert({
    where: { name: '__TEST_BLOCK__' },
    create: { name: '__TEST_BLOCK__', floorCount: 1 },
    update: {},
  });

  const flat = await prisma.flat.upsert({
    where: { blockId_flatNumber: { blockId: block.id, flatNumber: '__T-001__' } },
    create: { blockId: block.id, flatNumber: '__T-001__', type: '2BHK' },
    update: {},
  });

  TEST_FLAT_ID = flat.id;
});

afterAll(async () => {
  // Clean up test data to keep DB tidy
  await prisma.user.deleteMany({
    where: { email: { contains: 'integration_test_' } },
  });
  await prisma.$disconnect();
});

// ─── POST /auth/register ──────────────────────────────────────────────────────

describe('POST /api/v1/auth/register', () => {
  it('201 — registers a new resident user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        fullName: 'Integration Tester',
        flatId: TEST_FLAT_ID,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(TEST_EMAIL);
    expect(res.body.data.user.role).toBe('resident');
    expect(res.body.data.accessToken).toBeDefined();
    // Password hash must never appear in the response
    expect(res.body.data.user.passwordHash).toBeUndefined();
    // refreshToken goes in httpOnly cookie, not in body
    expect(res.body.data.refreshToken).toBeUndefined();
  });

  it('409 — duplicate email returns Conflict', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: TEST_EMAIL, // Already registered above
        password: TEST_PASSWORD,
        fullName: 'Integration Tester',
        flatId: TEST_FLAT_ID,
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('422 — missing required fields returns validation error', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'missing-fields@test.com' }); // No password, fullName, flatId

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
    expect(Array.isArray(res.body.errors)).toBe(true);
  });

  it('422 — weak password fails validation', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: `weak_pass_${Date.now()}@test.com`,
        password: '123',  // Too short
        fullName: 'Test',
        flatId: TEST_FLAT_ID,
      });

    expect(res.status).toBe(422);
  });
});

// ─── POST /auth/login ─────────────────────────────────────────────────────────

describe('POST /api/v1/auth/login', () => {
  it('200 — valid credentials return accessToken', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.email).toBe(TEST_EMAIL);
    // httpOnly cookie should be set
    expect(res.headers['set-cookie']).toBeDefined();
    expect(res.headers['set-cookie'].some(c => c.includes('refreshToken'))).toBe(true);
  });

  it('401 — wrong password returns Unauthorized', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: TEST_EMAIL, password: 'WrongPassword999' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('401 — non-existent email returns Unauthorized', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nobody@nowhere.com', password: TEST_PASSWORD });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('422 — missing email field returns validation error', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ password: TEST_PASSWORD });

    expect(res.status).toBe(422);
  });
});

// ─── POST /auth/refresh ───────────────────────────────────────────────────────

describe('POST /api/v1/auth/refresh', () => {
  it('200 — valid refreshToken cookie returns new accessToken', async () => {
    // Login to get the cookie
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

    const cookies = loginRes.headers['set-cookie'];

    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', cookies);

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('401 — missing/invalid refresh token returns Unauthorized', async () => {
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', 'refreshToken=bad-token-value');

    expect(res.status).toBe(401);
  });
});

// ─── POST /auth/logout ────────────────────────────────────────────────────────

describe('POST /api/v1/auth/logout', () => {
  it('200 — logout clears the refreshToken cookie', async () => {
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

    const cookies = loginRes.headers['set-cookie'];

    const res = await request(app)
      .post('/api/v1/auth/logout')
      .set('Cookie', cookies);

    expect(res.status).toBe(200);
    // Cookie should be cleared (maxAge=0 or expires in the past)
    const setCookieHeader = res.headers['set-cookie'];
    if (setCookieHeader) {
      expect(
        setCookieHeader.some(
          c => c.includes('refreshToken') && (c.includes('Expires=Thu, 01 Jan 1970') || c.includes('Max-Age=0'))
        )
      ).toBe(true);
    }
  });
});

// ─── Protected route guard ────────────────────────────────────────────────────

describe('Protected routes require authentication', () => {
  it('401 — GET /api/v1/complaints without token', async () => {
    const res = await request(app).get('/api/v1/complaints');
    expect(res.status).toBe(401);
  });

  it('401 — GET /api/v1/billing without token', async () => {
    const res = await request(app).get('/api/v1/billing');
    expect(res.status).toBe(401);
  });

  it('401 — GET /api/v1/dashboard/admin without token', async () => {
    const res = await request(app).get('/api/v1/dashboard/admin');
    expect(res.status).toBe(401);
  });
});
