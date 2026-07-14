module.exports = function setupNotificationWorker(container) {
  const queueService = container.get('queueService');
  const notificationsService = container.get('notificationsService');

  queueService.createWorker('notifications', async (job) => {
    const { userId, title, message, type } = job.data;
    
    console.log(`[Worker] Processing notification for user ${userId}: ${title}`);
    
    // In a real app, this might also send Push Notifications (FCM) or Emails (SendGrid)
    await notificationsService.createNotification(userId, title, message, type);
    
    return { success: true };
  });
};
