class AnnouncementsRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async createAnnouncement(data) {
    return this.prisma.announcement.create({ data });
  }

  async findAllAnnouncements(filters = {}, skip = 0, take = 10) {
    const [announcements, total] = await Promise.all([
      this.prisma.announcement.findMany({
        where: filters,
        skip,
        take,
        // Pinned first, then newest
        orderBy: [
          { isPinned: 'desc' },
          { createdAt: 'desc' }
        ],
      }),
      this.prisma.announcement.count({ where: filters }),
    ]);
    return { announcements, total };
  }

  async findAnnouncementById(id) {
    return this.prisma.announcement.findUnique({
      where: { id },
    });
  }

  async updateAnnouncement(id, data) {
    return this.prisma.announcement.update({
      where: { id },
      data,
    });
  }

  async deleteAnnouncement(id) {
    return this.prisma.announcement.delete({
      where: { id },
    });
  }
}

module.exports = AnnouncementsRepository;
