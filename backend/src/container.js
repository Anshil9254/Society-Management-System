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

const ServiceRequestsRepository = require('./modules/serviceRequests/serviceRequests.repository');
const ServiceRequestsService = require('./modules/serviceRequests/serviceRequests.service');
const ServiceRequestsController = require('./modules/serviceRequests/serviceRequests.controller');

const DashboardService = require('./modules/dashboard/dashboard.service');
const DashboardController = require('./modules/dashboard/dashboard.controller');

const NotificationsRepository = require('./modules/notifications/notifications.repository');
const NotificationsService = require('./modules/notifications/notifications.service');
const NotificationsController = require('./modules/notifications/notifications.controller');

const AuditLogsRepository = require('./modules/auditLogs/auditLogs.repository');
const AuditLogsService = require('./modules/auditLogs/auditLogs.service');
const AuditLogsController = require('./modules/auditLogs/auditLogs.controller');

const CacheService = require('./shared/services/cache.service');
const QueueService = require('./shared/services/queue.service');
const env = require('./shared/config/env');

class Container {
  constructor() {
    this.services = new Map();

    // Core
    this.services.set('prisma', prisma);
    this.services.set('redisClient', redisClient);
    this.services.set('eventBus', EventBus.getInstance());
    this.services.set('cacheService', new CacheService(this.get('redisClient')));
    this.services.set('queueService', new QueueService(this.get('redisClient')));

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

    // Service Requests Module
    const serviceRequestsRepository = new ServiceRequestsRepository(this.get('prisma'));
    this.services.set('serviceRequestsRepository', serviceRequestsRepository);

    const serviceRequestsService = new ServiceRequestsService(
      this.get('serviceRequestsRepository'),
      this.get('eventBus')
    );
    this.services.set('serviceRequestsService', serviceRequestsService);

    const serviceRequestsController = new ServiceRequestsController(this.get('serviceRequestsService'));
    this.services.set('serviceRequestsController', serviceRequestsController);

    // Dashboard Module
    const dashboardService = new DashboardService(this.get('prisma'), this.get('cacheService'));
    this.services.set('dashboardService', dashboardService);

    const dashboardController = new DashboardController(this.get('dashboardService'));
    this.services.set('dashboardController', dashboardController);

    // Notifications Module
    const notificationsRepository = new NotificationsRepository(this.get('prisma'));
    this.services.set('notificationsRepository', notificationsRepository);

    const notificationsService = new NotificationsService(this.get('notificationsRepository'));
    this.services.set('notificationsService', notificationsService);

    const notificationsController = new NotificationsController(this.get('notificationsService'));
    this.services.set('notificationsController', notificationsController);

    // Audit Logs Module
    const auditLogsRepository = new AuditLogsRepository(this.get('prisma'));
    this.services.set('auditLogsRepository', auditLogsRepository);

    const auditLogsService = new AuditLogsService(this.get('auditLogsRepository'));
    this.services.set('auditLogsService', auditLogsService);

    const auditLogsController = new AuditLogsController(this.get('auditLogsService'));
    this.services.set('auditLogsController', auditLogsController);

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
