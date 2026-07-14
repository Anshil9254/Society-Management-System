class BlocksRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async findAllBlocks() {
    return this.prisma.block.findMany({
      include: {
        flats: {
          include: {
            residents: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    phone: true,
                    role: true,
                    status: true
                  }
                }
              }
            },
            familyMembers: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  async createBlock(data) {
    return this.prisma.block.create({
      data: {
        name: data.name,
        floorCount: Number(data.floorCount)
      }
    });
  }

  async findBlockByName(name) {
    return this.prisma.block.findUnique({
      where: { name }
    });
  }

  async updateBlock(id, data) {
    return this.prisma.block.update({
      where: { id },
      data: {
        name: data.name,
        floorCount: Number(data.floorCount)
      }
    });
  }

  async deleteBlock(id) {
    return this.prisma.block.delete({
      where: { id }
    });
  }

  async createFlat(data) {
    return this.prisma.flat.create({
      data: {
        blockId: data.blockId,
        flatNumber: data.flatNumber,
        type: data.type,
        squareFeet: data.squareFeet ? Number(data.squareFeet) : null
      }
    });
  }

  async findFlatByNumber(blockId, flatNumber) {
    return this.prisma.flat.findUnique({
      where: {
        blockId_flatNumber: { blockId, flatNumber }
      }
    });
  }

  async createFamilyMember(data) {
    return this.prisma.familyMember.create({
      data: {
        flatId: data.flatId,
        fullName: data.fullName,
        relation: data.relation,
        age: data.age ? Number(data.age) : null
      }
    });
  }

  async deleteFamilyMember(id) {
    return this.prisma.familyMember.delete({
      where: { id }
    });
  }

  async findUserByEmail(email) {
    return this.prisma.user.findUnique({
      where: { email }
    });
  }

  async createResidentWithUser(flatId, userData, profileData) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Create User
      const user = await tx.user.create({
        data: {
          email: userData.email,
          passwordHash: userData.passwordHash,
          phone: userData.phone || null,
          role: 'resident',
          status: 'active'
        }
      });

      // 2. Create Resident Profile linked to User and Flat
      const profile = await tx.residentProfile.create({
        data: {
          userId: user.id,
          flatId: flatId,
          fullName: profileData.fullName,
          moveInDate: new Date(profileData.moveInDate || Date.now()),
          isOwner: profileData.isOwner
        }
      });

      return { user, profile };
    });
  }

  async deleteResidentProfile(residentId) {
    return this.prisma.$transaction(async (tx) => {
      const profile = await tx.residentProfile.findUnique({
        where: { id: residentId }
      });

      if (!profile) return null;

      // Delete resident profile
      await tx.residentProfile.delete({
        where: { id: residentId }
      });

      // Delete user account
      await tx.user.delete({
        where: { id: profile.userId }
      });

      return true;
    });
  }

  async findFlatById(id) {
    return this.prisma.flat.findUnique({
      where: { id },
      include: {
        block: true,
        residents: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                phone: true,
                role: true,
                status: true
              }
            }
          }
        },
        familyMembers: true
      }
    });
  }

  async findResidentProfileByUserId(userId) {
    return this.prisma.residentProfile.findUnique({
      where: { userId }
    });
  }
}

module.exports = BlocksRepository;
