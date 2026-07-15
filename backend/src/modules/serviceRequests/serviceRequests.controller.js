const apiResponse = require('../../shared/utils/apiResponse');
const { CreateServiceRequestDTO, UpdateServiceRequestStatusDTO } = require('./serviceRequests.dto');

class ServiceRequestsController {
  constructor(serviceRequestsService) {
    this.service = serviceRequestsService;
  }

  createServiceRequest = async (req, res) => {
    // If an image was uploaded, construct its URL/path
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const dto = new CreateServiceRequestDTO(req.validatedBody, imageUrl);
    const result = await this.service.createServiceRequest(req.user.id, dto);
    return apiResponse(res, 201, 'Service request raised successfully', result);
  };

  getServiceRequests = async (req, res) => {
    const result = await this.service.getServiceRequests(req.user, req.query);
    return apiResponse(res, 200, 'Service requests fetched successfully', result);
  };

  getServiceRequestById = async (req, res) => {
    const result = await this.service.getServiceRequestById(req.user, req.params.id);
    return apiResponse(res, 200, 'Service request fetched successfully', result);
  };

  updateServiceRequestStatus = async (req, res) => {
    const dto = new UpdateServiceRequestStatusDTO(req.validatedBody);
    const result = await this.service.updateServiceRequestStatus(req.params.id, dto);
    return apiResponse(res, 200, 'Service request status updated', result);
  };
}

module.exports = ServiceRequestsController;
