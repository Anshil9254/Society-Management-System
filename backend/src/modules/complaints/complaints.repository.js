class ComplaintsRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async createComplaint(data) {
    return this.prisma.complaint.create({
      data,
      include: {
        user: { include: { residentProfile: { include: { flat: true } } } },
      },
    });
  }

  async findAllComplaints(filters = {}, skip = 0, take = 10) {
    const [complaints, total] = await Promise.all([
      this.prisma.complaint.findMany({
        where: filters,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { include: { residentProfile: { include: { flat: true } } } },
          statusLogs: { orderBy: { createdAt: 'desc' } },
        },
      }),
      this.prisma.complaint.count({ where: filters }),
    ]);
    return { complaints, total };
  }

  async findComplaintById(id) {
    return this.prisma.complaint.findUnique({
      where: { id },
      include: {
        user: { include: { residentProfile: { include: { flat: true } } } },
        statusLogs: { orderBy: { createdAt: 'desc' } },
      },
    });
  }

  /**
   * Use an interactive transaction to update status and create a log atomically.
   */
  async updateStatusAndLog(complaintId, newStatus, comment) {
    return this.prisma.$transaction(async (tx) => {
      // Update complaint status
      const updatedComplaint = await tx.complaint.update({
        where: { id: complaintId },
        data: { status: newStatus },
        include: {
          user: { include: { residentProfile: { include: { flat: true } } } },
        },
      });

      // Insert log
      await tx.complaintStatusLog.create({
        data: {
          complaintId,
          status: newStatus,
          comment,
        },
      });

      // Return fully loaded complaint with logs
      return tx.complaint.findUnique({
        where: { id: complaintId },
        include: {
          user: { include: { residentProfile: { include: { flat: true } } } },
          statusLogs: { orderBy: { createdAt: 'desc' } },
        },
      });
    });
  }
}

module.exports = ComplaintsRepository;
