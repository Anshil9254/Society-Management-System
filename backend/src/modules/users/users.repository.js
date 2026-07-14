class UsersRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async findAllUsers(skip = 0, take = 10) {
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take,
        include: {
          residentProfile: {
            include: { flat: { include: { block: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);
    return { users, total };
  }

  async findUserById(id) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        residentProfile: {
          include: { flat: { include: { block: true } } },
        },
      },
    });
  }

  async updateUser(id, data) {
    return this.prisma.user.update({
      where: { id },
      data,
      include: { residentProfile: true },
    });
  }

  async updateResidentProfile(userId, profileData) {
    return this.prisma.residentProfile.update({
      where: { userId },
      data: profileData,
    });
  }

  async deleteUser(id) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}

module.exports = UsersRepository;
