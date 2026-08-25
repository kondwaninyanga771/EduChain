const rateLimit = require('express-rate-limit');

/**
 * Standard rate limiter for API endpoints
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 'ERROR',
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
});

/**
 * Stricter rate limiter specifically for login attempts
 * Limits to 5 attempts per minute to prevent brute-forcing
 */
const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'ERROR',
    message: 'Too many login attempts, please try again after a minute.',
  },
});

module.exports = {
  apiLimiter,
  loginLimiter,
};
