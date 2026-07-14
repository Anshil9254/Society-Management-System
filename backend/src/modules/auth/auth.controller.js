const { RegisterRequestDTO, LoginRequestDTO } = require('./auth.dto');
const apiResponse = require('../../shared/utils/apiResponse');

/**
 * Auth Controller
 * Parses request, invokes Service, formats HTTP response.
 * Completely devoid of business logic or DB calls.
 */
class AuthController {
  constructor(authService) {
    this.service = authService;
  }

  register = async (req, res) => {
    // req.validatedBody is populated by validate.middleware
    const dto = new RegisterRequestDTO(req.validatedBody);
    
    const result = await this.service.register(dto);

    // Set refresh token in HTTP-only cookie for better security
    res.cookie('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return apiResponse(res, 201, 'User registered successfully', {
      user: result.user,
      accessToken: result.tokens.accessToken,
    });
  };

  login = async (req, res) => {
    const dto = new LoginRequestDTO(req.validatedBody);
    
    const result = await this.service.login(dto);

    res.cookie('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return apiResponse(res, 200, 'Login successful', {
      user: result.user,
      accessToken: result.tokens.accessToken,
    });
  };

  refreshToken = async (req, res) => {
    // Try cookie first, fallback to body
    const token = req.cookies?.refreshToken || req.validatedBody.refreshToken;
    
    const result = await this.service.refreshToken(token);

    res.cookie('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return apiResponse(res, 200, 'Token refreshed successfully', {
      user: result.user,
      accessToken: result.tokens.accessToken,
    });
  };

  logout = async (req, res) => {
    // Extract jti from current refresh token if available
    const token = req.cookies?.refreshToken;
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.decode(token); // Just decode to get jti, verify was done on creation
        if (decoded?.id && decoded?.jti) {
          await this.service.logout(decoded.id, decoded.jti);
        }
      } catch (err) {
        // Ignore decode errors on logout
      }
    }

    res.clearCookie('refreshToken');
    return apiResponse(res, 200, 'Logged out successfully');
  };
}

module.exports = AuthController;
