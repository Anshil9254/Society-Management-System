const { ROLES } = require('../../shared/constants');

class DashboardService {
  constructor(prisma, cacheService) {
    this.prisma = prisma;
    this.cache = cacheService;
  }

  async getAdminDashboardStats() {
    return this.cache.getOrSet('dashboard:admin:stats', async () => {
      const now = new Date();
      const currentMonth = now.getMonth(); // 0-11
      const currentYear = now.getFullYear();
      
      const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);
      const startOfNextMonth = new Date(currentYear, currentMonth + 1, 1);
      
      const previousMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const startOfPreviousMonth = new Date(previousMonthYear, previousMonth, 1);
      
      const startOfSixMonthsAgo = new Date(currentYear, currentMonth - 5, 1);

      // Run sequentially to avoid exhausting Supabase's strict connection limit on port 5432
      const totalResidents = await this.prisma.residentProfile.count();
      const totalFlats = await this.prisma.flat.count();
      const occupiedFlatsGroups = await this.prisma.residentProfile.groupBy({ by: ['flatId'] });
      const openComplaints = await this.prisma.complaint.count({ where: { status: { in: ['open', 'in_progress'] } } });
      const highPriorityOpenComplaints = await this.prisma.complaint.count({ where: { status: { in: ['open', 'in_progress'] }, priority: 'high' } });
      const paymentsThisMonthResult = await this.prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'success', paidAt: { gte: startOfCurrentMonth, lt: startOfNextMonth } }
      });
      const paymentsLastMonthResult = await this.prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'success', paidAt: { gte: startOfPreviousMonth, lt: startOfCurrentMonth } }
      });
      const complaintsStatusGroups = await this.prisma.complaint.groupBy({
        by: ['status'],
        _count: { id: true }
      });
      const recentNotifications = await this.prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5
      });
      const upcomingEvents = await this.prisma.event.findMany({
        where: { eventDate: { gte: now } },
        orderBy: { eventDate: 'asc' },
        take: 4
      });
      const paymentsLast6Months = await this.prisma.payment.findMany({
        where: { status: 'success', paidAt: { gte: startOfSixMonthsAgo } },
        select: { amount: true, paidAt: true }
      });
      const billsLast6Months = await this.prisma.maintenanceBill.findMany({
        where: { dueDate: { gte: startOfSixMonthsAgo } },
        select: { amount: true, dueDate: true, status: true }
      });

      const occupiedFlats = occupiedFlatsGroups.length;
      const vacantFlats = totalFlats - occupiedFlats;
      const collectionsThisMonth = Number(paymentsThisMonthResult._sum.amount || 0);
      const collectionsLastMonth = Number(paymentsLastMonthResult._sum.amount || 0);
      
      // Calculate % change
      let collectionGrowth = 0;
      if (collectionsLastMonth > 0) {
        collectionGrowth = ((collectionsThisMonth - collectionsLastMonth) / collectionsLastMonth) * 100;
      }

      // Format Chart Data
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const chartDataMap = {};
      
      for (let i = 5; i >= 0; i--) {
        const d = new Date(currentYear, currentMonth - i, 1);
        const name = monthNames[d.getMonth()];
        chartDataMap[`${d.getFullYear()}-${d.getMonth()}`] = { name, collected: 0, pending: 0 };
      }

      paymentsLast6Months.forEach(p => {
        const key = `${p.paidAt.getFullYear()}-${p.paidAt.getMonth()}`;
        if (chartDataMap[key]) {
          chartDataMap[key].collected += Number(p.amount);
        }
      });

      billsLast6Months.forEach(b => {
        const key = `${b.dueDate.getFullYear()}-${b.dueDate.getMonth()}`;
        if (chartDataMap[key] && (b.status === 'pending' || b.status === 'partially_paid' || b.status === 'overdue')) {
          chartDataMap[key].pending += Number(b.amount);
        }
      });
      
      const maintenanceData = Object.values(chartDataMap);

      const complaintData = complaintsStatusGroups.map(g => ({
        name: g.status,
        value: g._count.id
      }));

      const occupancyData = [
        { name: 'Occupied', value: occupiedFlats },
        { name: 'Vacant', value: vacantFlats }
      ];

      return {
        totalResidents,
        totalFlats,
        vacantFlats,
        openComplaints,
        highPriorityOpenComplaints,
        collectionsThisMonth,
        collectionGrowth: collectionGrowth.toFixed(1),
        maintenanceData,
        complaintData,
        occupancyData,
        recentNotifications,
        upcomingEvents
      };
    }, 300); // cache for 5 mins
  }

  async getResidentDashboardStats(userId, flatId) {
    if (!flatId) {
      // Run sequentially to avoid exhausting database connection pool
      const openComplaints = await this.prisma.complaint.count({
        where: { userId, status: { in: ['open', 'in_progress'] } }
      });
      const recentAnnouncements = await this.prisma.announcement.findMany({
        where: { targetAudience: { in: ['all', 'residents'] } },
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        take: 5
      });
      const upcomingEvents = await this.prisma.event.findMany({
        where: { eventDate: { gte: new Date() } },
        orderBy: { eventDate: 'asc' },
        take: 3
      });

      return {
        unpaidBills: [],
        openComplaints,
        recentAnnouncements,
        activeServiceRequests: 0,
        upcomingEvents
      };
    }

    // Run sequentially to avoid exhausting database connection pool
    const unpaidBills = await this.prisma.maintenanceBill.findMany({
      where: { flatId, status: { in: ['pending', 'partially_paid'] } },
      orderBy: { dueDate: 'asc' },
      take: 3
    });
    const openComplaints = await this.prisma.complaint.count({
      where: { userId, status: { in: ['open', 'in_progress'] } }
    });
    const recentAnnouncements = await this.prisma.announcement.findMany({
      where: { targetAudience: { in: ['all', 'residents'] } },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      take: 5
    });
    const activeServiceRequests = await this.prisma.serviceRequest.count({
      where: { userId, status: { in: ['pending', 'assigned', 'in_progress'] } }
    });
    const upcomingEvents = await this.prisma.event.findMany({
      where: { eventDate: { gte: new Date() } },
      orderBy: { eventDate: 'asc' },
      take: 3
    });

    return {
      unpaidBills,
      openComplaints,
      recentAnnouncements,
      activeServiceRequests,
      upcomingEvents
    };
  }
}

module.exports = DashboardService;
