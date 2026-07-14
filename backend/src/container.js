const prisma = require('./shared/config/database.config');
const { EventBus } = require('./shared/events');
const redisClient = require('./shared/config/redis.config');

const AuthRepository = require('./modules/auth/auth.repository');
const AuthService = require('./modules/auth/auth.service');
const AuthController = require('./modules/auth/auth.controller');

const UsersRepository = require('./modules/users/users.repository');
const UsersService = require('./modules/users/users.service');
const UsersController = require('./modules/users/users.controller');

class Container {
  constructor() {
    this.services = new Map();

    // Core
    this.services.set('prisma', prisma);
    this.services.set('redisClient', redisClient);
    this.services.set('eventBus', EventBus.getInstance());

    // Auth Module
    const authRepository = new AuthRepository(this.get('prisma'));
    this.services.set('authRepository', authRepository);

    const authService = new AuthService(this.get('authRepository'), this.get('redisClient'));
    this.services.set('authService', authService);

    const authController = new AuthController(this.get('authService'));
    this.services.set('authController', authController);

    // Users Module
    const usersRepository = new UsersRepository(this.get('prisma'));
    this.services.set('usersRepository', usersRepository);

    const usersService = new UsersService(this.get('usersRepository'));
    this.services.set('usersService', usersService);

    const usersController = new UsersController(this.get('usersService'));
    this.services.set('usersController', usersController);

    // Other modules will be added here
  }

  get(name) {
    if (!this.services.has(name)) {
      throw new Error(`Dependency ${name} not found in container`);
    }
    return this.services.get(name);
  }
}

// Singleton instance
const container = new Container();
module.exports = container;
