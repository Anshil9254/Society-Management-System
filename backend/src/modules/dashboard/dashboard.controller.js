const apiResponse = require('../../shared/utils/apiResponse');
const { ROLES } = require('../../shared/constants');

class DashboardController {
  constructor(dashboardService) {
    this.service = dashboardService;
  }

  getDashboardStats = async (req, res) => {
    let stats;
    
    if (req.user.role === ROLES.ADMIN || req.user.role === ROLES.COMMITTEE) {
      stats = await this.service.getAdminDashboardStats();
    } else {
      // Resident
      const flatId = req.user.residentProfile?.flatId;
      stats = await this.service.getResidentDashboardStats(req.user.id, flatId);
    }

    return apiResponse(res, 200, 'Dashboard stats fetched successfully', stats);
  };
}

module.exports = DashboardController;
