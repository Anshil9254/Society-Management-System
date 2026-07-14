const apiResponse = require('../../shared/utils/apiResponse');
const { CreateAnnouncementDTO, UpdateAnnouncementDTO } = require('./announcements.dto');

class AnnouncementsController {
  constructor(announcementsService) {
    this.service = announcementsService;
  }

  createAnnouncement = async (req, res) => {
    const dto = new CreateAnnouncementDTO(req.validatedBody);
    const result = await this.service.createAnnouncement(dto);
    return apiResponse(res, 201, 'Announcement created successfully', result);
  };

  getAnnouncements = async (req, res) => {
    const result = await this.service.getAnnouncements(req.user, req.query);
    return apiResponse(res, 200, 'Announcements fetched successfully', result);
  };

  getAnnouncementById = async (req, res) => {
    const result = await this.service.getAnnouncementById(req.params.id);
    return apiResponse(res, 200, 'Announcement fetched successfully', result);
  };

  updateAnnouncement = async (req, res) => {
    const dto = new UpdateAnnouncementDTO(req.validatedBody);
    const result = await this.service.updateAnnouncement(req.params.id, dto);
    return apiResponse(res, 200, 'Announcement updated successfully', result);
  };

  deleteAnnouncement = async (req, res) => {
    await this.service.deleteAnnouncement(req.params.id);
    return apiResponse(res, 200, 'Announcement deleted successfully');
  };
}

module.exports = AnnouncementsController;
