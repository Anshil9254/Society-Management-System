const { NotificationResponseDTO } = require('./notifications.dto');
const paginate = require('../../shared/utils/paginate');

class NotificationsService {
  constructor(notificationsRepository) {
    this.repository = notificationsRepository;
  }

  async createNotification(userId, title, message, type) {
    return this.repository.createNotification({ userId, title, message, type });
  }

  async getNotifications(userId, queryParams) {
    const page = parseInt(queryParams.page) || 1;
    const limit = parseInt(queryParams.limit) || 10;
    const skip = (page - 1) * limit;

    const { notifications, total } = await this.repository.findAllNotifications(userId, skip, limit);
    const mapped = notifications.map(n => new NotificationResponseDTO(n));
    return paginate(mapped, total, page, limit);
  }

  async getUnreadCount(userId) {
    const count = await this.repository.getUnreadCount(userId);
    return { unreadCount: count };
  }

  async markAsRead(userId, notificationId) {
    await this.repository.markAsRead(notificationId, userId);
  }

  async markAllAsRead(userId) {
    await this.repository.markAllAsRead(userId);
  }
}

module.exports = NotificationsService;
