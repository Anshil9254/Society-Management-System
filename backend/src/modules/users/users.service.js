const { NotFoundError } = require('../../shared/errors');
const { UserResponseDTO } = require('./users.dto');
const paginate = require('../../shared/utils/paginate');

class UsersService {
  constructor(usersRepository) {
    this.repository = usersRepository;
  }

  async getAllUsers(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const { users, total } = await this.repository.findAllUsers(skip, limit);
    
    const mappedUsers = users.map(user => new UserResponseDTO(user));
    return paginate(mappedUsers, total, page, limit);
  }

  async getUserById(id) {
    const user = await this.repository.findUserById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return new UserResponseDTO(user);
  }

  async updateProfile(userId, updateDTO) {
    // Check if user exists
    await this.getUserById(userId);

    const userUpdate = {};
    if (updateDTO.phone) userUpdate.phone = updateDTO.phone;

    // Update user root fields
    if (Object.keys(userUpdate).length > 0) {
      await this.repository.updateUser(userId, userUpdate);
    }

    // Update resident profile if fullName is provided
    if (updateDTO.fullName) {
      await this.repository.updateResidentProfile(userId, { fullName: updateDTO.fullName });
    }

    return this.getUserById(userId);
  }

  async updateRole(adminId, targetUserId, newRole) {
    // Check if user exists
    await this.getUserById(targetUserId);

    // Perform update
    await this.repository.updateUser(targetUserId, { role: newRole });

    return this.getUserById(targetUserId);
  }

  async updateStatus(adminId, targetUserId, newStatus) {
    await this.getUserById(targetUserId);
    await this.repository.updateUser(targetUserId, { status: newStatus });
    return this.getUserById(targetUserId);
  }
}

module.exports = UsersService;
