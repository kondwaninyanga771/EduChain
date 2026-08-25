const csurf = require('csurf');

/**
 * CSRF Protection Middleware
 * We use cookie-based CSRF tokens to keep the API stateless.
 * The client must include the token in the 'X-CSRF-Token' header for state-changing requests.
 */
const csrfProtection = csurf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  },
});

module.exports = csrfProtection;
