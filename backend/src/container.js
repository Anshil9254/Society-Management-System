const prisma = require('./shared/config/database.config');
const { eventBus } = require('./shared/events');
const redisClient = require('./shared/config/redis.config');

/**
 * Dependency Injection (DI) Container.
 * 
 * Centralizes the wiring of all Repositories, Services, and Controllers.
 * No module instantiates its own dependencies. This makes testing easy
 * (we can pass mock repos to services) and keeps modules decoupled.
 * 
 * As we build out modules in Phases 3 and 4, we will register them here.
 */

// ─── Repositories ──────────────────────────────────────────
// const AuthRepository = require('./modules/auth/auth.repository');
// const authRepository = new AuthRepository(prisma);

// ─── Services ──────────────────────────────────────────────
// const AuthService = require('./modules/auth/auth.service');
// const authService = new AuthService(authRepository, eventBus, redisClient);

// ─── Controllers ───────────────────────────────────────────
// const AuthController = require('./modules/auth/auth.controller');
// const authController = new AuthController(authService);

module.exports = {
  // authController,
  prisma,
};
