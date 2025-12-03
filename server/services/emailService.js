const createTransporter = require('../config/email');

// Send email
const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to,
      subject,
      html,
    };

    console.log(`📧 Attempting to send email to: ${to}`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️  Email sent successfully: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('❌ Error sending email:');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Full error:', error);
    throw error;
  }
};

// Email templates

const taskAssignedEmail = (userName, taskTitle, projectName, taskUrl) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3B82F6;">Task Assigned</h2>
      <p>Hi ${userName},</p>
      <p>You have been assigned a new task:</p>
      <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0;">${taskTitle}</h3>
        <p style="margin: 0; color: #6B7280;">Project: ${projectName}</p>
      </div>
      <a href="${taskUrl}" style="display: inline-block; background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
        View Task
      </a>
      <p style="margin-top: 30px; color: #6B7280; font-size: 14px;">
        This is an automated email from ${process.env.FROM_NAME}. Please do not reply.
      </p>
    </div>
  `;
};

const commentMentionEmail = (userName, commenterName, taskTitle, comment, taskUrl) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3B82F6;">You were mentioned in a comment</h2>
      <p>Hi ${userName},</p>
      <p><strong>${commenterName}</strong> mentioned you in a comment on:</p>
      <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0;">${taskTitle}</h3>
        <p style="margin: 10px 0 0 0; padding: 10px; background-color: white; border-left: 3px solid #3B82F6;">
          ${comment}
        </p>
      </div>
      <a href="${taskUrl}" style="display: inline-block; background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
        View Comment
      </a>
      <p style="margin-top: 30px; color: #6B7280; font-size: 14px;">
        This is an automated email from ${process.env.FROM_NAME}. Please do not reply.
      </p>
    </div>
  `;
};

const taskDueSoonEmail = (userName, taskTitle, dueDate, taskUrl) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #F59E0B;">Task Due Soon</h2>
      <p>Hi ${userName},</p>
      <p>The following task is due soon:</p>
      <div style="background-color: #FEF3C7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F59E0B;">
        <h3 style="margin: 0 0 10px 0;">${taskTitle}</h3>
        <p style="margin: 0; color: #92400E;">Due: ${dueDate}</p>
      </div>
      <a href="${taskUrl}" style="display: inline-block; background-color: #F59E0B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
        View Task
      </a>
      <p style="margin-top: 30px; color: #6B7280; font-size: 14px;">
        This is an automated email from ${process.env.FROM_NAME}. Please do not reply.
      </p>
    </div>
  `;
};

const workspaceInviteEmail = (userName, workspaceName, inviterName, inviteUrl) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3B82F6;">Workspace Invitation</h2>
      <p>Hi ${userName},</p>
      <p><strong>${inviterName}</strong> has invited you to join the workspace:</p>
      <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0;">${workspaceName}</h3>
      </div>
      <a href="${inviteUrl}" style="display: inline-block; background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
        Accept Invitation
      </a>
      <p style="margin-top: 30px; color: #6B7280; font-size: 14px;">
        This invitation will expire in 7 days.
      </p>
      <p style="color: #6B7280; font-size: 14px;">
        This is an automated email from ${process.env.FROM_NAME}. Please do not reply.
      </p>
    </div>
  `;
};

const verificationOTPEmail = (userName, otp) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3B82F6;">Welcome to ProjectArc!</h2>
      <p>Hi ${userName},</p>
      <p>Thank you for registering with ProjectArc. To complete your registration, please verify your email address using the OTP below:</p>
      <div style="background-color: #F3F4F6; padding: 30px; border-radius: 8px; margin: 30px 0; text-align: center;">
        <div style="font-size: 36px; font-weight: bold; color: #3B82F6; letter-spacing: 8px; font-family: 'Courier New', monospace;">
          ${otp}
        </div>
      </div>
      <p style="color: #6B7280;">This OTP will expire in <strong>10 minutes</strong>.</p>
      <p style="color: #6B7280;">If you didn't create an account with ProjectArc, please ignore this email.</p>
      <p style="margin-top: 30px; color: #6B7280; font-size: 14px;">
        This is an automated email from ${process.env.FROM_NAME}. Please do not reply.
      </p>
    </div>
  `;
};

const resetPasswordOTPEmail = (userName, otp) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #F59E0B;">Password Reset Request</h2>
      <p>Hi ${userName},</p>
      <p>We received a request to reset your password. Use the OTP below to proceed:</p>
      <div style="background-color: #FEF3C7; padding: 30px; border-radius: 8px; margin: 30px 0; text-align: center; border-left: 4px solid #F59E0B;">
        <div style="font-size: 36px; font-weight: bold; color: #92400E; letter-spacing: 8px; font-family: 'Courier New', monospace;">
          ${otp}
        </div>
      </div>
      <p style="color: #6B7280;">This OTP will expire in <strong>10 minutes</strong>.</p>
      <p style="color: #DC2626; font-weight: 500;">If you didn't request a password reset, please ignore this email and ensure your account is secure.</p>
      <p style="margin-top: 30px; color: #6B7280; font-size: 14px;">
        This is an automated email from ${process.env.FROM_NAME}. Please do not reply.
      </p>
    </div>
  `;
};

module.exports = {
  sendEmail,
  taskAssignedEmail,
  commentMentionEmail,
  taskDueSoonEmail,
  workspaceInviteEmail,
  verificationOTPEmail,
  resetPasswordOTPEmail,
};
