module.exports = function setupEventSubscribers(container) {
  const eventBus = container.get('eventBus');
  const queueService = container.get('queueService');
  const prisma = container.get('prisma');

  // ─── Complaints ─────────────────────────────────────────────
  eventBus.on('complaint.created', async (complaint) => {
    // Notify admin/committee
    const admins = await prisma.user.findMany({ where: { role: { in: ['admin', 'committee'] } } });
    for (const admin of admins) {
      await queueService.addJob('notifications', 'send', {
        userId: admin.id,
        title: 'New Complaint Raised',
        message: `Complaint #${complaint.id} needs attention.`,
        type: 'complaint'
      });
    }
  });

  // ─── Announcements ──────────────────────────────────────────
  eventBus.on('announcement.created', async (announcement) => {
    // Notify target audience
    const filters = {};
    if (announcement.targetAudience === 'residents') filters.role = 'resident';
    if (announcement.targetAudience === 'committee') filters.role = 'committee';
    
    const users = await prisma.user.findMany({ where: filters });
    
    // Batch jobs to the queue
    for (const user of users) {
      await queueService.addJob('notifications', 'send', {
        userId: user.id,
        title: 'New Announcement',
        message: announcement.title,
        type: 'announcement'
      });
    }
  });

  // ─── Billing ────────────────────────────────────────────────
  eventBus.on('bill.generated', async (bill) => {
    // Find resident associated with flat
    const profiles = await prisma.residentProfile.findMany({
      where: { flatId: bill.flatId },
      include: { user: true }
    });
    
    for (const profile of profiles) {
      await queueService.addJob('notifications', 'send', {
        userId: profile.userId,
        title: 'New Maintenance Bill',
        message: `Your maintenance bill for ${bill.billingMonth}/${bill.billingYear} is generated. Amount: ₹${bill.amount}`,
        type: 'bill'
      });
    }
  });

  // ─── Service Requests ───────────────────────────────────────
  eventBus.on('serviceRequest.created', async (sr) => {
    const admins = await prisma.user.findMany({ where: { role: { in: ['admin', 'committee'] } } });
    for (const admin of admins) {
      await queueService.addJob('notifications', 'send', {
        userId: admin.id,
        title: 'New Service Request',
        message: `A new ${sr.serviceType} service request has been raised.`,
        type: 'service'
      });
    }
  });

  console.log('[EventBus] Subscribers registered to dispatch jobs to Queue.');
};
