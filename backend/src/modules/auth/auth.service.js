const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { AuthResponseDTO } = require('./auth.dto');
const { ConflictError, UnauthorizedError, NotFoundError } = require('../../shared/errors');
const { generateAccessToken, generateRefreshToken } = require('../../shared/utils/generateTokens');
const authConfig = require('../../shared/config/auth.config');

/**
 * Auth Service
 * Contains all business logic for authentication.
 */
class AuthService {
  constructor(authRepository, redisClient) {
    this.repository = authRepository;
    this.redis = redisClient; // For refresh token whitelisting / revocation
  }

  async register(registerDTO) {
    // 1. Check if user exists
    const existingUser = await this.repository.findUserByEmail(registerDTO.email);
    if (existingUser) {
      throw new ConflictError('User with this email already exists.');
    }

    // 2. Hash password
    const passwordHash = await bcrypt.hash(registerDTO.password, authConfig.bcryptSaltRounds);

    // 3. Create user in DB via repository
    const user = await this.repository.createResidentUser({
      ...registerDTO,
      passwordHash,
    });

    // 4. Generate tokens
    const jti = uuidv4();
    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id, jti);

    // 5. Store refresh token in Redis (if configured) to allow revocation
    if (this.redis) {
      // 7 days in seconds = 604800
      await this.redis.set(`refresh:${user.id}:${jti}`, 'valid', 'EX', 604800);
    }

    // 6. Return standard response object
    return new AuthResponseDTO(user, accessToken, refreshToken);
  }

  async login(loginDTO) {
    // 1. Find user
    const user = await this.repository.findUserByEmail(loginDTO.email);
    if (!user || user.status !== 'active') {
      throw new UnauthorizedError('Invalid credentials or inactive account.');
    }

    // 2. Verify password
    const isValid = await bcrypt.compare(loginDTO.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError('Invalid credentials.');
    }

    // 3. Update last login
    await this.repository.updateLastLogin(user.id);

    // 4. Generate tokens
    const jti = uuidv4();
    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id, jti);

    if (this.redis) {
      await this.redis.set(`refresh:${user.id}:${jti}`, 'valid', 'EX', 604800);
    }

    return new AuthResponseDTO(user, accessToken, refreshToken);
  }

  async refreshToken(token) {
    try {
      // 1. Verify token signature
      const decoded = jwt.verify(token, authConfig.refreshSecret);
      
      // 2. Check if revoked in Redis
      if (this.redis) {
        const isValid = await this.redis.get(`refresh:${decoded.id}:${decoded.jti}`);
        if (!isValid) {
          throw new UnauthorizedError('Token has been revoked or expired.');
        }
      }

      // 3. Get fresh user data to ensure they haven't been suspended
      const user = await this.repository.findUserById(decoded.id);
      if (!user || user.status !== 'active') {
        throw new UnauthorizedError('Account is no longer active.');
      }

      // 4. Generate new tokens (rotating refresh token)
      const newJti = uuidv4();
      const newAccessToken = generateAccessToken(user.id, user.role);
      const newRefreshToken = generateRefreshToken(user.id, newJti);

      // 5. Update Redis: delete old, set new
      if (this.redis) {
        await this.redis.del(`refresh:${decoded.id}:${decoded.jti}`);
        await this.redis.set(`refresh:${user.id}:${newJti}`, 'valid', 'EX', 604800);
      }

      return new AuthResponseDTO(user, newAccessToken, newRefreshToken);
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired refresh token.');
    }
  }

  async logout(userId, jti) {
    if (this.redis && jti) {
      // Delete specific token family
      await this.redis.del(`refresh:${userId}:${jti}`);
    }
  }
}

module.exports = AuthService;
