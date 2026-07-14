const apiResponse = require('../../shared/utils/apiResponse');
const { UpdateProfileDTO, UpdateRoleDTO } = require('./users.dto');

class UsersController {
  constructor(usersService) {
    this.service = usersService;
  }

  getProfile = async (req, res) => {
    // req.user.id comes from auth middleware
    const user = await this.service.getUserById(req.user.id);
    return apiResponse(res, 200, 'Profile fetched successfully', user);
  };

  updateProfile = async (req, res) => {
    const dto = new UpdateProfileDTO(req.validatedBody);
    const updatedUser = await this.service.updateProfile(req.user.id, dto);
    return apiResponse(res, 200, 'Profile updated successfully', updatedUser);
  };

  getAllUsers = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const paginatedData = await this.service.getAllUsers(page, limit);
    return apiResponse(res, 200, 'Users fetched successfully', paginatedData);
  };

  getUserById = async (req, res) => {
    const user = await this.service.getUserById(req.params.id);
    return apiResponse(res, 200, 'User fetched successfully', user);
  };

  updateRole = async (req, res) => {
    const dto = new UpdateRoleDTO(req.validatedBody);
    const updatedUser = await this.service.updateRole(req.user.id, req.params.id, dto.role);
    return apiResponse(res, 200, 'User role updated successfully', updatedUser);
  };

  updateStatus = async (req, res) => {
    const { status } = req.validatedBody;
    const updatedUser = await this.service.updateStatus(req.user.id, req.params.id, status);
    return apiResponse(res, 200, 'User status updated successfully', updatedUser);
  };
}

module.exports = UsersController;
