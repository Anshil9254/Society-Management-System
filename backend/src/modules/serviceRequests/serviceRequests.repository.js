class ServiceRequestsRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async createServiceRequest(userId, data) {
    return this.prisma.serviceRequest.create({
      data: {
        userId,
        serviceType: data.serviceType,
        preferredDate: new Date(data.preferredDate),
        notes: data.notes,
        imageUrl: data.imageUrl,
      },
      include: {
        user: {
          include: {
            residentProfile: {
              include: {
                flat: { include: { block: true } },
              },
            },
          },
        },
      },
    });
  }

  async findAllServiceRequests(filters = {}, skip = 0, take = 10) {
    const [requests, total] = await Promise.all([
      this.prisma.serviceRequest.findMany({
        where: filters,
        skip,
        take,
        orderBy: { preferredDate: 'asc' },
        include: {
          user: {
            include: {
              residentProfile: {
                include: {
                  flat: { include: { block: true } },
                },
              },
            },
          },
        },
      }),
      this.prisma.serviceRequest.count({ where: filters }),
    ]);
    return { requests, total };
  }

  async findServiceRequestById(id) {
    return this.prisma.serviceRequest.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            residentProfile: {
              include: {
                flat: { include: { block: true } },
              },
            },
          },
        },
      },
    });
  }

  async updateStatus(id, status) {
    return this.prisma.serviceRequest.update({
      where: { id },
      data: { status },
      include: {
        user: {
          include: {
            residentProfile: {
              include: {
                flat: { include: { block: true } },
              },
            },
          },
        },
      },
    });
  }
}

module.exports = ServiceRequestsRepository;
