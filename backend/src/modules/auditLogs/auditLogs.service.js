const paginate = require('../../shared/utils/paginate');

class AuditLogsService {
  constructor(auditLogsRepository) {
    this.repository = auditLogsRepository;
  }

  async getAuditLogs(queryParams) {
    const page = parseInt(queryParams.page) || 1;
    const limit = parseInt(queryParams.limit) || 20;
    const skip = (page - 1) * limit;

    const filters = {};
    if (queryParams.userId) filters.userId = queryParams.userId;
    if (queryParams.action) filters.action = queryParams.action;
    if (queryParams.entityType) filters.entityType = queryParams.entityType;
    if (queryParams.entityId) filters.entityId = queryParams.entityId;

    const { logs, total } = await this.repository.findAllLogs(filters, skip, limit);
    return paginate(logs, total, page, limit);
  }
}

module.exports = AuditLogsService;
