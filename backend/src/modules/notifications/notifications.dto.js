class NotificationResponseDTO {
  constructor(notification) {
    this.id = notification.id;
    this.title = notification.title;
    this.message = notification.message;
    this.type = notification.type;
    this.isRead = notification.isRead;
    this.createdAt = notification.createdAt;
  }
}

module.exports = {
  NotificationResponseDTO,
};
