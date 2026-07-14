class AuditLogsRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async findAllLogs(filters = {}, skip = 0, take = 10) {
    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: filters,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          actor: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
        },
      }),
      this.prisma.auditLog.count({ where: filters }),
    ]);
    return { logs, total };
  }
}

module.exports = AuditLogsRepository;
