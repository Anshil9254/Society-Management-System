class ComplaintResponseDTO {
  constructor(complaint) {
    this.id = complaint.id;
    this.title = complaint.title;
    this.description = complaint.description;
    this.category = complaint.category;
    this.priority = complaint.priority;
    this.status = complaint.status;
    this.imageUrl = complaint.imageUrl;
    this.createdAt = complaint.createdAt;
    this.updatedAt = complaint.updatedAt;

    // Optional included relations
    if (complaint.user) {
      this.reportedBy = {
        id: complaint.user.id,
        fullName: complaint.user.residentProfile?.fullName || 'Unknown',
        flat: complaint.user.residentProfile?.flat?.flatNumber || null,
      };
    }

    if (complaint.statusLogs) {
      this.history = complaint.statusLogs.map((log) => ({
        id: log.id,
        status: log.status,
        comment: log.comment,
        createdAt: log.createdAt,
      }));
    }
  }
}

class CreateComplaintDTO {
  constructor(data, imageUrl = null) {
    this.title = data.title;
    this.description = data.description;
    this.category = data.category;
    this.priority = data.priority;
    this.imageUrl = imageUrl;
  }
}

class UpdateComplaintStatusDTO {
  constructor(data) {
    this.status = data.status;
    this.comment = data.comment;
  }
}

module.exports = {
  ComplaintResponseDTO,
  CreateComplaintDTO,
  UpdateComplaintStatusDTO,
};
