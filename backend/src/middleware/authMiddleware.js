const { verifyAccessToken } = require('../services/tokenService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Middleware to protect routes that require authentication.
 * Checks for the presence of the access token in HTTP-only cookies.
 */
const authenticate = async (req, res, next) => {
  try {
    const accessToken = req.cookies?.accessToken;

    if (!accessToken) {
      return res.status(401).json({ status: 'ERROR', message: 'Authentication required' });
    }

    // Verify token
    const decoded = verifyAccessToken(accessToken);
    
    // Attach user payload to request
    req.user = decoded;
    
    // Enforce single active session for all users
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { currentSessionId: true }
    });
    if (!user || user.currentSessionId !== decoded.sessionId) {
      return res.status(401).json({ status: 'ERROR', message: 'You have been logged out because you logged in from another device.' });
    }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ status: 'ERROR', message: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ status: 'ERROR', message: 'Invalid token' });
  }
};

/**
 * Role-based access control middleware.
 * Ensures the authenticated user has one of the allowed roles.
 * @param {...string} roles - Allowed roles (e.g., 'STUDENT', 'LECTURER', 'ADMIN')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      // Return a 403 Forbidden
      return res.status(403).json({ status: 'ERROR', message: 'Access denied: Insufficient permissions' });
    }
    next();
  };
};

module.exports = {
  authenticate,
  authorize,
};
