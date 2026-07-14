const { NotFoundError } = require('../../shared/errors');
const { AnnouncementResponseDTO } = require('./announcements.dto');
const paginate = require('../../shared/utils/paginate');
const { Roles } = require('../../shared/constants');

class AnnouncementsService {
  constructor(announcementsRepository, cacheService, eventBus) {
    this.repository = announcementsRepository;
    this.cache = cacheService;
    this.eventBus = eventBus;
  }

  async createAnnouncement(createDTO) {
    const announcement = await this.repository.createAnnouncement({
      title: createDTO.title,
      content: createDTO.content,
      targetAudience: createDTO.targetAudience,
      isPinned: createDTO.isPinned,
    });

    // Invalidate announcements cache
    await this.cache.deletePattern('announcements:*');

    // Fire event (to send push notifications/emails)
    this.eventBus.emit('announcement.created', announcement);

    return new AnnouncementResponseDTO(announcement);
  }

  async getAnnouncements(user, queryParams) {
    const page = parseInt(queryParams.page) || 1;
    const limit = parseInt(queryParams.limit) || 10;
    const skip = (page - 1) * limit;

    const filters = {};

    // If resident, they can see 'all' or 'residents' target audience.
    if (user.role === Roles.RESIDENT) {
      filters.targetAudience = { in: ['all', 'residents'] };
    }

    const cacheKey = `announcements:${user.role}:p${page}:l${limit}`;

    return this.cache.getOrSet(cacheKey, async () => {
      const { announcements, total } = await this.repository.findAllAnnouncements(filters, skip, limit);
      const mapped = announcements.map(a => new AnnouncementResponseDTO(a));
      return paginate(mapped, total, page, limit);
    }, 3600); // cache for 1 hour
  }

  async getAnnouncementById(id) {
    const announcement = await this.repository.findAnnouncementById(id);
    if (!announcement) {
      throw new NotFoundError('Announcement not found');
    }
    return new AnnouncementResponseDTO(announcement);
  }

  async updateAnnouncement(id, updateDTO) {
    const existing = await this.repository.findAnnouncementById(id);
    if (!existing) {
      throw new NotFoundError('Announcement not found');
    }

    const updateData = {};
    if (updateDTO.title !== undefined) updateData.title = updateDTO.title;
    if (updateDTO.content !== undefined) updateData.content = updateDTO.content;
    if (updateDTO.targetAudience !== undefined) updateData.targetAudience = updateDTO.targetAudience;
    if (updateDTO.isPinned !== undefined) updateData.isPinned = updateDTO.isPinned;

    const updated = await this.repository.updateAnnouncement(id, updateData);

    await this.cache.deletePattern('announcements:*');

    return new AnnouncementResponseDTO(updated);
  }

  async deleteAnnouncement(id) {
    const existing = await this.repository.findAnnouncementById(id);
    if (!existing) {
      throw new NotFoundError('Announcement not found');
    }

    await this.repository.deleteAnnouncement(id);
    await this.cache.deletePattern('announcements:*');
  }
}

module.exports = AnnouncementsService;
