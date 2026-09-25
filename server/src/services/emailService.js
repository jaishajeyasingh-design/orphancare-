const nodemailer = require('nodemailer');

/**
 * Checks whether SMTP environment variables are properly configured.
 * Returns true only if SMTP_HOST, SMTP_USER, and SMTP_PASSWORD are provided.
 */
const isSmtpConfigured = () => {
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_HOST.trim() !== '' &&
    process.env.SMTP_USER &&
    process.env.SMTP_USER.trim() !== '' &&
    process.env.SMTP_PASSWORD &&
    process.env.SMTP_PASSWORD.trim() !== ''
  );
};

/**
 * Sends a password reset email using Nodemailer.
 * @param {Object} params
 * @param {string} params.to - Recipient email address
 * @param {string} params.resetUrl - Full password reset URL
 */
const sendPasswordResetEmail = async ({ to, resetUrl }) => {
  if (!isSmtpConfigured()) {
    return {
      success: false,
      reason: 'SMTP configuration is incomplete or missing.'
    };
  }

  try {
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const secure = process.env.SMTP_SECURE === 'true' || port === 465;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: port,
      secure: secure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });

    const fromAddress = process.env.MAIL_FROM || process.env.SMTP_USER || '"OrphanCare+" <no-reply@orphancare.org>';

    const textContent = `You requested a password reset for your OrphanCare+ account.\n\nPlease click the following link to reset your password:\n${resetUrl}\n\nThis reset link will expire in 10 minutes.\n\nIf you did not request this reset, please ignore this email.`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 0; }
          .container { max-width: 580px; margin: 30px auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
          .header { background-color: #2563eb; padding: 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
          .content { padding: 32px; line-height: 1.6; }
          .btn-container { text-align: center; margin: 28px 0; }
          .btn { background-color: #2563eb; color: #ffffff !important; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; }
          .footer { background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b; }
          .warning { font-size: 13px; color: #64748b; margin-top: 24px; background: #f8fafc; padding: 12px; border-radius: 8px; border-left: 4px solid #3b82f6; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>OrphanCare+</h1>
          </div>
          <div class="content">
            <h2>Password Reset Request</h2>
            <p>Hello,</p>
            <p>We received a request to reset your password for your OrphanCare+ account. Click the button below to choose a new password:</p>
            
            <div class="btn-container">
              <a href="${resetUrl}" class="btn" target="_blank">Reset Password</a>
            </div>

            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #2563eb;"><a href="${resetUrl}">${resetUrl}</a></p>

            <div class="warning">
              <strong>Notice:</strong> This password reset link expires in <strong>10 minutes</strong>. If you did not request a password reset, please ignore this email and your password will remain unchanged.
            </div>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} OrphanCare+ Platform. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;

    const info = await transporter.sendMail({
      from: fromAddress,
      to: to,
      subject: 'OrphanCare+ Password Reset',
      text: textContent,
      html: htmlContent
    });

    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    // Log safe error message without exposing credentials or secrets
    console.error('Email Delivery Exception:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  isSmtpConfigured,
  sendPasswordResetEmail
};
