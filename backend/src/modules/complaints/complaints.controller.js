const apiResponse = require('../../shared/utils/apiResponse');
const { CreateComplaintDTO, UpdateComplaintStatusDTO } = require('./complaints.dto');

class ComplaintsController {
  constructor(complaintsService) {
    this.service = complaintsService;
  }

  createComplaint = async (req, res) => {
    // If an image was uploaded, construct its URL/path
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    
    const dto = new CreateComplaintDTO(req.validatedBody, imageUrl);
    const result = await this.service.createComplaint(req.user.id, dto);

    return apiResponse(res, 201, 'Complaint raised successfully', result);
  };

  getComplaints = async (req, res) => {
    const result = await this.service.getComplaints(req.user, req.query);
    return apiResponse(res, 200, 'Complaints fetched successfully', result);
  };

  getComplaintById = async (req, res) => {
    const result = await this.service.getComplaintById(req.user, req.params.id);
    return apiResponse(res, 200, 'Complaint fetched successfully', result);
  };

  updateStatus = async (req, res) => {
    const dto = new UpdateComplaintStatusDTO(req.validatedBody);
    const result = await this.service.updateStatus(req.user.id, req.params.id, dto);
    
    return apiResponse(res, 200, 'Complaint status updated successfully', result);
  };
}

module.exports = ComplaintsController;
