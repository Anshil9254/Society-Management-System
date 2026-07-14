const jwt = require('jsonwebtoken');
const { UnauthorizedError, ForbiddenError } = require('../errors');
const authConfig = require('../config/auth.config');

/**
 * Middleware to authenticate requests via JWT Access Token
 */
const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Missing or invalid authorization header'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, authConfig.accessSecret);
    
    // Attach user payload to request
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };
    
    // Load residentProfile if they have one
    const prisma = require('../config/database.config');
    const residentProfile = await prisma.residentProfile.findUnique({
      where: { userId: decoded.id }
    });
    
    if (residentProfile) {
      req.user.residentProfile = residentProfile;
    }
    
    next();
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    console.error('Provided Token:', token.substring(0, 20) + '...');
    console.error('Secret used starts with:', authConfig.accessSecret ? authConfig.accessSecret.substring(0, 5) : 'undefined');
    if (error.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Access token expired. Please refresh.'));
    }
    return next(new UnauthorizedError('Invalid access token'));
  }
};

/**
 * Middleware to restrict access based on roles
 * @param  {...string} roles - Array of allowed roles (from Roles constants)
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required before role check'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('You do not have permission to perform this action'));
    }

    next();
  };
};

module.exports = {
  requireAuth,
  requireRole,
};
