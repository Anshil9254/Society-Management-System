/**
 * Auth Repository
 * The ONLY file in the auth module allowed to touch the database (Prisma).
 */
class AuthRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async findUserByEmail(email) {
    return this.prisma.user.findUnique({
      where: { email },
      include: { residentProfile: true },
    });
  }

  async findUserById(id) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { residentProfile: true },
    });
  }

  async createResidentUser(data) {
    return this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        phone: data.phone,
        role: 'resident',
        residentProfile: {
          create: {
            flatId: data.flatId,
            fullName: data.fullName,
            moveInDate: new Date(),
            isOwner: false, // Defaulting to false, can be updated later by admin
          },
        },
      },
      include: { residentProfile: true },
    });
  }

  async updateLastLogin(id) {
    return this.prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }
}

module.exports = AuthRepository;
