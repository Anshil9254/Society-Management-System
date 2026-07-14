class AnnouncementResponseDTO {
  constructor(announcement) {
    this.id = announcement.id;
    this.title = announcement.title;
    this.content = announcement.content;
    this.targetAudience = announcement.targetAudience;
    this.isPinned = announcement.isPinned;
    this.createdAt = announcement.createdAt;
  }
}

class CreateAnnouncementDTO {
  constructor(data) {
    this.title = data.title;
    this.content = data.content;
    this.targetAudience = data.targetAudience || 'all';
    this.isPinned = data.isPinned || false;
  }
}

class UpdateAnnouncementDTO {
  constructor(data) {
    this.title = data.title;
    this.content = data.content;
    this.targetAudience = data.targetAudience;
    this.isPinned = data.isPinned;
  }
}

module.exports = {
  AnnouncementResponseDTO,
  CreateAnnouncementDTO,
  UpdateAnnouncementDTO,
};
