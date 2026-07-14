class UserResponseDTO {
  constructor(user) {
    this.id = user.id;
    this.email = user.email;
    this.phone = user.phone;
    this.role = user.role;
    this.status = user.status;
    this.lastLoginAt = user.lastLoginAt;
    this.createdAt = user.createdAt;
    
    // Include Resident Profile if available
    if (user.residentProfile) {
      this.profile = {
        fullName: user.residentProfile.fullName,
        isOwner: user.residentProfile.isOwner,
        moveInDate: user.residentProfile.moveInDate,
        flatId: user.residentProfile.flatId,
        flatNumber: user.residentProfile.flat?.flatNumber,
        blockName: user.residentProfile.flat?.block?.name,
      };
    }
  }
}

class UpdateProfileDTO {
  constructor(data) {
    this.phone = data.phone;
    this.fullName = data.fullName;
  }
}

class UpdateRoleDTO {
  constructor(data) {
    this.role = data.role; // admin, committee_member, resident
  }
}

module.exports = {
  UserResponseDTO,
  UpdateProfileDTO,
  UpdateRoleDTO,
};
