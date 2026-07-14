const prisma = require('./shared/config/database.config');
const { EventBus } = require('./shared/events');
const redisClient = require('./shared/config/redis.config');

const AuthRepository = require('./modules/auth/auth.repository');
const AuthService = require('./modules/auth/auth.service');
const AuthController = require('./modules/auth/auth.controller');

const UsersRepository = require('./modules/users/users.repository');
const UsersService = require('./modules/users/users.service');
const UsersController = require('./modules/users/users.controller');

const ComplaintsRepository = require('./modules/complaints/complaints.repository');
const ComplaintsService = require('./modules/complaints/complaints.service');
const ComplaintsController = require('./modules/complaints/complaints.controller');

const BillingRepository = require('./modules/billing/billing.repository');
const BillingService = require('./modules/billing/billing.service');
const BillingController = require('./modules/billing/billing.controller');

const PaymentsRepository = require('./modules/payments/payments.repository');
const PaymentsService = require('./modules/payments/payments.service');
const PaymentsController = require('./modules/payments/payments.controller');

const AnnouncementsRepository = require('./modules/announcements/announcements.repository');
const AnnouncementsService = require('./modules/announcements/announcements.service');
const AnnouncementsController = require('./modules/announcements/announcements.controller');

const CacheService = require('./shared/services/cache.service');

class Container {
  constructor() {
    this.services = new Map();

    // Core
    this.services.set('prisma', prisma);
    this.services.set('redisClient', redisClient);
    this.services.set('eventBus', EventBus.getInstance());
    this.services.set('cacheService', new CacheService(this.get('redisClient')));

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

    // Complaints Module
    const complaintsRepository = new ComplaintsRepository(this.get('prisma'));
    this.services.set('complaintsRepository', complaintsRepository);

    const complaintsService = new ComplaintsService(
      this.get('complaintsRepository'),
      this.get('eventBus'),
      this.get('cacheService')
    );
    this.services.set('complaintsService', complaintsService);

    const complaintsController = new ComplaintsController(this.get('complaintsService'));
    this.services.set('complaintsController', complaintsController);

    // Billing Module
    const billingRepository = new BillingRepository(this.get('prisma'));
    this.services.set('billingRepository', billingRepository);

    const billingService = new BillingService(this.get('billingRepository'), this.get('eventBus'));
    this.services.set('billingService', billingService);

    const billingController = new BillingController(this.get('billingService'));
    this.services.set('billingController', billingController);

    // Payments Module
    const paymentsRepository = new PaymentsRepository(this.get('prisma'));
    this.services.set('paymentsRepository', paymentsRepository);

    const paymentsService = new PaymentsService(this.get('paymentsRepository'), this.get('eventBus'));
    this.services.set('paymentsService', paymentsService);

    const paymentsController = new PaymentsController(this.get('paymentsService'));
    this.services.set('paymentsController', paymentsController);

    // Announcements Module
    const announcementsRepository = new AnnouncementsRepository(this.get('prisma'));
    this.services.set('announcementsRepository', announcementsRepository);

    const announcementsService = new AnnouncementsService(
      this.get('announcementsRepository'),
      this.get('cacheService'),
      this.get('eventBus')
    );
    this.services.set('announcementsService', announcementsService);

    const announcementsController = new AnnouncementsController(this.get('announcementsService'));
    this.services.set('announcementsController', announcementsController);

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
