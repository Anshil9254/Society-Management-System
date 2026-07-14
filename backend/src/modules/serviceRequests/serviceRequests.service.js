const { NotFoundError } = require('../../shared/errors');
const { ServiceRequestResponseDTO } = require('./serviceRequests.dto');
const paginate = require('../../shared/utils/paginate');
const { Roles } = require('../../shared/constants');

class ServiceRequestsService {
  constructor(serviceRequestsRepository, eventBus) {
    this.repository = serviceRequestsRepository;
    this.eventBus = eventBus;
  }

  async createServiceRequest(userId, createDTO) {
    const sr = await this.repository.createServiceRequest(userId, createDTO);
    this.eventBus.emit('serviceRequest.created', sr);
    return new ServiceRequestResponseDTO(sr);
  }

  async getServiceRequests(user, queryParams) {
    const page = parseInt(queryParams.page) || 1;
    const limit = parseInt(queryParams.limit) || 10;
    const skip = (page - 1) * limit;

    const filters = {};

    // Residents only see their own requests
    if (user.role === Roles.RESIDENT) {
      filters.userId = user.id;
    } else if (queryParams.userId) {
      filters.userId = queryParams.userId;
    }

    if (queryParams.status) filters.status = queryParams.status;
    if (queryParams.serviceType) filters.serviceType = queryParams.serviceType;

    const { requests, total } = await this.repository.findAllServiceRequests(filters, skip, limit);
    const mapped = requests.map(r => new ServiceRequestResponseDTO(r));
    return paginate(mapped, total, page, limit);
  }

  async getServiceRequestById(user, id) {
    const sr = await this.repository.findServiceRequestById(id);
    if (!sr) {
      throw new NotFoundError('Service request not found');
    }

    // Authorization
    if (user.role === Roles.RESIDENT && sr.userId !== user.id) {
      throw new NotFoundError('Service request not found'); // Mask existence for security
    }

    return new ServiceRequestResponseDTO(sr);
  }

  async updateServiceRequestStatus(id, updateDTO) {
    const existing = await this.repository.findServiceRequestById(id);
    if (!existing) {
      throw new NotFoundError('Service request not found');
    }

    const updated = await this.repository.updateStatus(id, updateDTO.status);
    
    this.eventBus.emit('serviceRequest.statusUpdated', updated);
    
    return new ServiceRequestResponseDTO(updated);
  }
}

module.exports = ServiceRequestsService;
