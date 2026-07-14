const { NotFoundError, ForbiddenError } = require('../../shared/errors');
const { ComplaintResponseDTO } = require('./complaints.dto');
const paginate = require('../../shared/utils/paginate');
const { Roles } = require('../../shared/constants');

class ComplaintsService {
  constructor(complaintsRepository, eventBus, cacheService) {
    this.repository = complaintsRepository;
    this.eventBus = eventBus;
    this.cache = cacheService;
  }

  async createComplaint(userId, createDTO) {
    const data = {
      userId,
      title: createDTO.title,
      description: createDTO.description,
      category: createDTO.category,
      priority: createDTO.priority,
      imageUrl: createDTO.imageUrl,
    };

    const complaint = await this.repository.createComplaint(data);
    
    // Publish event
    this.eventBus.emit('complaint.created', complaint);

    // Invalidate complaints cache
    await this.cache.deletePattern('complaints:*');

    return new ComplaintResponseDTO(complaint);
  }

  async getComplaints(user, queryParams) {
    const page = parseInt(queryParams.page) || 1;
    const limit = parseInt(queryParams.limit) || 10;
    const skip = (page - 1) * limit;

    const filters = {};
    
    // Residents only see their own complaints. Admin/Committee see all.
    if (user.role === Roles.RESIDENT) {
      filters.userId = user.id;
    }

    // Optional filtering
    if (queryParams.status) filters.status = queryParams.status;
    if (queryParams.category) filters.category = queryParams.category;

    // Try cache if no specific filters applied (besides pagination/role)
    const cacheKey = `complaints:${user.id}:p${page}:l${limit}:s${queryParams.status||'all'}:c${queryParams.category||'all'}`;
    
    return this.cache.getOrSet(cacheKey, async () => {
      const { complaints, total } = await this.repository.findAllComplaints(filters, skip, limit);
      const mapped = complaints.map(c => new ComplaintResponseDTO(c));
      return paginate(mapped, total, page, limit);
    }, 300); // cache for 5 minutes
  }

  async getComplaintById(user, complaintId) {
    const complaint = await this.repository.findComplaintById(complaintId);
    if (!complaint) {
      throw new NotFoundError('Complaint not found');
    }

    // Auth check: Resident can only view their own
    if (user.role === Roles.RESIDENT && complaint.userId !== user.id) {
      throw new ForbiddenError('You can only access your own complaints');
    }

    return new ComplaintResponseDTO(complaint);
  }

  async updateStatus(adminId, complaintId, updateDTO) {
    // 1. Verify existence
    const existing = await this.repository.findComplaintById(complaintId);
    if (!existing) {
      throw new NotFoundError('Complaint not found');
    }

    // 2. Perform transactional update
    const updated = await this.repository.updateStatusAndLog(
      complaintId,
      updateDTO.status,
      updateDTO.comment
    );

    // 3. Emit event (Notification service will pick this up)
    this.eventBus.emit('complaint.statusUpdated', updated);

    // 4. Invalidate cache
    await this.cache.deletePattern('complaints:*');

    return new ComplaintResponseDTO(updated);
  }
}

module.exports = ComplaintsService;
