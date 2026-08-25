const nodemailer = require('nodemailer');

// For testing purposes, we use Ethereal SMTP to generate credentials
let transporter;
nodemailer.createTestAccount().then(account => {
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: account.user,
      pass: account.pass,
    },
  });
  console.log('Ethereal SMTP Test Account created:', account.user);
}).catch(err => {
  console.error('Failed to create Ethereal account:', err);
});

/**
 * Sends a verification email to the user
 * @param {string} to - Recipient email address
 * @param {string} token - Verification token
 */
const sendVerificationEmail = async (to, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@educhain.com',
    to,
    subject: 'EduChain - Verify Your Email',
    html: `
      <h2>Welcome to EduChain!</h2>
      <p>Please click the link below to verify your email address. This link is valid for 24 hours.</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
    `,
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Sends a password reset email to the user
 * @param {string} to - Recipient email address
 * @param {string} token - Password reset token
 */
const sendPasswordResetEmail = async (to, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@educhain.com',
    to,
    subject: 'EduChain - Password Reset Request',
    html: `
      <h2>Password Reset Request</h2>
      <p>You requested a password reset. Click the link below to reset your password. This link is valid for 15 minutes.</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>If you did not request this, please ignore this email.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};
