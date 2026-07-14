const apiResponse = require('../../shared/utils/apiResponse');

class NotificationsController {
  constructor(notificationsService) {
    this.service = notificationsService;
  }

  getNotifications = async (req, res) => {
    const result = await this.service.getNotifications(req.user.id, req.query);
    return apiResponse(res, 200, 'Notifications fetched successfully', result);
  };

  getUnreadCount = async (req, res) => {
    const result = await this.service.getUnreadCount(req.user.id);
    return apiResponse(res, 200, 'Unread count fetched', result);
  };

  markAsRead = async (req, res) => {
    await this.service.markAsRead(req.user.id, req.params.id);
    return apiResponse(res, 200, 'Notification marked as read');
  };

  markAllAsRead = async (req, res) => {
    await this.service.markAllAsRead(req.user.id);
    return apiResponse(res, 200, 'All notifications marked as read');
  };
}

module.exports = NotificationsController;
