const apiResponse = require('../../shared/utils/apiResponse');

class AuditLogsController {
  constructor(auditLogsService) {
    this.service = auditLogsService;
  }

  getAuditLogs = async (req, res) => {
    const result = await this.service.getAuditLogs(req.query);
    return apiResponse(res, 200, 'Audit logs fetched successfully', result);
  };
}

module.exports = AuditLogsController;
