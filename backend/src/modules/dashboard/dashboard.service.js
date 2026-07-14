const { Roles } = require('../../shared/constants');

class DashboardService {
  constructor(prisma, cacheService) {
    this.prisma = prisma;
    this.cache = cacheService;
  }

  async getAdminDashboardStats() {
    return this.cache.getOrSet('dashboard:admin:stats', async () => {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      const [
        totalFlats,
        openComplaints,
        activeServiceRequests,
        paymentsThisMonthResult
      ] = await Promise.all([
        this.prisma.flat.count(),
        this.prisma.complaint.count({ where: { status: { in: ['open', 'in_progress'] } } }),
        this.prisma.serviceRequest.count({ where: { status: 'pending' } }),
        this.prisma.payment.aggregate({
          _sum: { amount: true },
          where: {
            status: 'success',
            paidAt: {
              gte: new Date(currentYear, currentMonth - 1, 1),
              lt: new Date(currentYear, currentMonth, 1),
            }
          }
        }),
      ]);

      return {
        totalFlats,
        openComplaints,
        activeServiceRequests,
        collectionsThisMonth: paymentsThisMonthResult._sum.amount || 0,
      };
    }, 300); // cache for 5 mins
  }

  async getResidentDashboardStats(userId, flatId) {
    const [unpaidBills, openComplaints, recentAnnouncements] = await Promise.all([
      this.prisma.maintenanceBill.findMany({
        where: { flatId, status: { in: ['pending', 'partially_paid'] } },
        orderBy: { dueDate: 'asc' },
        take: 3
      }),
      this.prisma.complaint.count({
        where: { userId, status: { in: ['open', 'in_progress'] } }
      }),
      this.prisma.announcement.findMany({
        where: { targetAudience: { in: ['all', 'residents'] } },
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        take: 5
      })
    ]);

    return {
      unpaidBills,
      openComplaints,
      recentAnnouncements
    };
  }
}

module.exports = DashboardService;
