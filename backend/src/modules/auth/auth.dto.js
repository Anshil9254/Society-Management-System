/**
 * Auth DTOs (Data Transfer Objects)
 * Defines the strict shape of data entering the service layer and 
 * leaving the API (responses). Strips out any internal fields (like passwordHashes).
 */

class RegisterRequestDTO {
  constructor(data) {
    this.email = data.email;
    this.password = data.password;
    this.fullName = data.fullName;
    this.phone = data.phone;
    this.flatId = data.flatId;
    // We don't accept 'role' here — everyone registers as 'resident' by default.
  }
}

class LoginRequestDTO {
  constructor(data) {
    this.email = data.email;
    this.password = data.password;
  }
}

class AuthResponseDTO {
  constructor(user, accessToken, refreshToken) {
    this.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.residentProfile?.fullName || 'Admin User',
      flatId: user.residentProfile?.flatId || null,
    };
    this.tokens = {
      accessToken,
      refreshToken, // typically sent in httpOnly cookie, but provided here for flexibility
    };
  }
}

module.exports = {
  RegisterRequestDTO,
  LoginRequestDTO,
  AuthResponseDTO,
};
