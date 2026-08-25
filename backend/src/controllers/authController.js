const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { hashPassword, comparePassword, generateRandomToken } = require('../utils/securityUtils');
const { generateAccessToken, generateRefreshToken } = require('../services/tokenService');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
};

/**
 * Handles user registration
 */
exports.register = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      // Return a generic success-like response to prevent user enumeration
      // but standard UX usually shows "Email already in use". OWASP dictates being careful.
      return res.status(400).json({ status: 'ERROR', message: 'Email is already registered' });
    }

    // Hash the password
    const passwordHash = await hashPassword(password);

    // Generate email verification token
    const verificationToken = generateRandomToken(32);

    // Create user
    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        passwordHash,
        role: role.toUpperCase(), // Ensure role is uppercase to match Enum
        verificationToken,
        isEmailVerified: process.env.NODE_ENV !== 'production', // Auto-verify in dev mode
      },
    });

    // Send Verification Email
    await sendVerificationEmail(user.email, verificationToken);

    res.status(201).json({
      status: 'SUCCESS',
      message: 'Registration successful. Please check your email to verify your account.',
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ status: 'ERROR', message: error.message || 'Internal server error' });
  }
};

/**
 * Handles email verification
 */
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await prisma.user.findFirst({ where: { verificationToken: token } });
    if (!user) {
      return res.status(400).json({ status: 'ERROR', message: 'Invalid or expired verification token' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        verificationToken: null, // Single use
      },
    });

    res.status(200).json({ status: 'SUCCESS', message: 'Email verified successfully. You may now log in.' });
  } catch (error) {
    console.error('Verification Error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Internal server error' });
  }
};

/**
 * Handles user login
 */
exports.login = async (req, res) => {
  try {
    const { email, password, otp } = req.body;

    // Find User
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ status: 'ERROR', message: 'Incorrect email or password' });
    }

    // Check Account Lockout
    if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
      return res.status(403).json({ status: 'ERROR', message: 'Account is locked. Try again later.' });
    }

    // Compare password
    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      const newAttempts = user.failedLoginAttempts + 1;
      const updates = { failedLoginAttempts: newAttempts };

      if (newAttempts >= 5) {
        updates.accountLockedUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 mins
        // Log account lockout
        await prisma.systemLog.create({
          data: { userId: user.id, actionType: 'ACCOUNT_LOCKOUT', description: 'Account locked due to multiple failed login attempts', ipAddress: req.ip }
        });
      }

      await prisma.user.update({ where: { id: user.id }, data: updates });
      return res.status(401).json({ status: 'ERROR', message: 'Incorrect email or password' });
    }

    // Check Email Verification
    if (!user.isEmailVerified) {
      return res.status(403).json({ status: 'ERROR', message: 'Please verify your email before logging in' });
    }

    // Check 2FA
    if (user.isTwoFactorEnabled) {
      if (!otp) {
        return res.status(200).json({ status: 'REQUIRE_2FA', message: 'Two-factor authentication required' });
      }
      const isOtpValid = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: otp,
      });
      if (!isOtpValid) {
        return res.status(401).json({ status: 'ERROR', message: 'Invalid OTP' });
      }
    }

    // Reset failed attempts
    if (user.failedLoginAttempts > 0) {
      await prisma.user.update({ where: { id: user.id }, data: { failedLoginAttempts: 0, accountLockedUntil: null } });
    }

    // Log successful login
    await prisma.systemLog.create({
      data: { userId: user.id, actionType: 'LOGIN', description: 'Successful login', ipAddress: req.ip }
    });

    const sessionId = generateRandomToken(16);
    await prisma.refreshToken.updateMany({
      where: { userId: user.id, revoked: false },
      data: { revoked: true }
    });
    await prisma.user.update({
      where: { id: user.id },
      data: { currentSessionId: sessionId }
    });

    // Generate Tokens
    const payload = { id: user.id, role: user.role, sessionId };
    const accessToken = generateAccessToken(payload);
    const refreshTokenString = generateRefreshToken(payload);

    // Save Refresh Token to DB
    await prisma.refreshToken.create({
      data: {
        token: refreshTokenString,
        userId: user.id,
        deviceInfo: req.headers['user-agent'],
        ipAddress: req.ip,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      }
    });

    // Set HttpOnly Cookies
    res.cookie('accessToken', accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 }); // 15 mins
    res.cookie('refreshToken', refreshTokenString, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7 days

    res.status(200).json({
      status: 'SUCCESS',
      message: 'Login successful',
      user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Internal server error' });
  }
};

/**
 * Handles Token Refresh with Rotation and Reuse Detection
 */
exports.refreshToken = async (req, res) => {
  try {
    const oldRefreshToken = req.cookies?.refreshToken;
    if (!oldRefreshToken) {
      return res.status(401).json({ status: 'ERROR', message: 'No refresh token provided' });
    }

    // Find token in DB
    const dbToken = await prisma.refreshToken.findUnique({ where: { token: oldRefreshToken }, include: { user: true } });
    
    // REUSE DETECTION
    if (dbToken && dbToken.revoked) {
      // Potential token theft: Revoke ALL tokens for this user
      await prisma.refreshToken.updateMany({
        where: { userId: dbToken.userId },
        data: { revoked: true }
      });
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      // Log anomaly
      await prisma.systemLog.create({
        data: { userId: dbToken.userId, actionType: 'TOKEN_REUSE', description: 'Detected reused revoked token. Terminated all sessions.', ipAddress: req.ip }
      });
      return res.status(403).json({ status: 'ERROR', message: 'Security anomaly detected. Please log in again.' });
    }

    if (!dbToken || dbToken.expiresAt < new Date()) {
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      return res.status(401).json({ status: 'ERROR', message: 'Invalid or expired refresh token' });
    }

    // Invalidate the old token
    await prisma.refreshToken.update({
      where: { id: dbToken.id },
      data: { revoked: true }
    });

    let sessionId = dbToken.user.currentSessionId;
    if (dbToken.user.role === 'STUDENT') {
      if (!sessionId) {
        return res.status(401).json({ status: 'ERROR', message: 'Invalid session' });
      }
    }

    // Issue new tokens
    const payload = { id: dbToken.user.id, role: dbToken.user.role, sessionId };
    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: dbToken.user.id,
        deviceInfo: req.headers['user-agent'],
        ipAddress: req.ip,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }
    });

    res.cookie('accessToken', newAccessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', newRefreshToken, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 });

    res.status(200).json({ status: 'SUCCESS', message: 'Token refreshed' });
  } catch (error) {
    console.error('Refresh Error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Internal server error' });
  }
};

/**
 * Logout the current session
 */
exports.logout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      await prisma.refreshToken.updateMany({
        where: { token: refreshToken },
        data: { revoked: true }
      });
    }
    
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.status(200).json({ status: 'SUCCESS', message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout Error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Internal server error' });
  }
};

/**
 * Initiates Password Reset
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      // Prevent user enumeration
      return res.status(200).json({ status: 'SUCCESS', message: 'If that email exists, a reset link has been sent.' });
    }

    const resetToken = generateRandomToken(32);
    // In a real scenario, we'd hash the token before saving to DB, but for simplicity here we save it
    // as per the prompt: "Store only hashed reset tokens"
    const hashedResetToken = await hashPassword(resetToken);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hashedResetToken,
        passwordResetExpiry: new Date(Date.now() + 15 * 60 * 1000) // 15 mins
      }
    });

    await sendPasswordResetEmail(user.email, resetToken);

    res.status(200).json({ status: 'SUCCESS', message: 'If that email exists, a reset link has been sent.' });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Internal server error' });
  }
};

/**
 * Resets Password
 */
exports.resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.passwordResetToken || !user.passwordResetExpiry || user.passwordResetExpiry < new Date()) {
      return res.status(400).json({ status: 'ERROR', message: 'Invalid or expired token' });
    }

    const isValidToken = await comparePassword(token, user.passwordResetToken);
    if (!isValidToken) {
      return res.status(400).json({ status: 'ERROR', message: 'Invalid or expired token' });
    }

    const newPasswordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
        passwordResetToken: null,
        passwordResetExpiry: null
      }
    });

    // Invalidate all active sessions for security
    await prisma.refreshToken.updateMany({
      where: { userId: user.id },
      data: { revoked: true }
    });

    res.status(200).json({ status: 'SUCCESS', message: 'Password has been reset successfully. All other sessions have been logged out.' });
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Internal server error' });
  }
};


/**
 * Logout all sessions
 */
exports.logoutAll = async (req, res) => {
  try {
    await prisma.refreshToken.updateMany({
      where: { userId: req.user.id },
      data: { revoked: true }
    });
    
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.status(200).json({ status: 'SUCCESS', message: 'Logged out of all sessions successfully' });
  } catch (error) {
    console.error('Logout All Error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Internal server error' });
  }
};
