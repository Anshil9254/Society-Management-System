class NotificationsRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async createNotification(data) {
    return this.prisma.notification.create({ data });
  }

  async findAllNotifications(userId, skip = 0, take = 10) {
    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where: { userId } }),
    ]);
    return { notifications, total };
  }

  async getUnreadCount(userId) {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  async markAsRead(id, userId) {
    // Only mark if it belongs to user
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}

module.exports = NotificationsRepository;
