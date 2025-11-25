// lib/email.ts - Email configuration with provider support
import nodemailer from "nodemailer";

// Determine transporter based on EMAIL_HOST or EMAIL_SERVICE
const getTransporter = () => {
  const host = process.env.EMAIL_HOST;
  const port = process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : undefined;
  const emailService = process.env.EMAIL_SERVICE;
  
  // If explicit SMTP host/port are provided, use them (e.g., Brevo)
  if (host && port) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  
  // Otherwise, use a named service (Gmail, Outlook, etc.)
  return nodemailer.createTransport({
    service: emailService || "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

const transporter = getTransporter();

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send email using nodemailer with Brevo
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    return true;
  } catch (error) {
    console.error("Email sending error:", error);
    return false;
  }
}

/**
 * Generate a 6-digit reset code
 */
export function generateResetCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send password reset email with 6-digit code
 */
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetCode: string
): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Password Reset Request</h2>
      <p>Hello ${name},</p>
      <p>We received a request to reset your password. Use the code below to proceed:</p>
      <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; text-align: center; border-radius: 5px;">
        <h1 style="color: #0066cc; letter-spacing: 5px; margin: 0;">${resetCode}</h1>
      </div>
      <p style="color: #666;">This code will expire in 15 minutes.</p>
      <p style="color: #666;">If you didn't request this, please ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
      <p style="font-size: 12px; color: #999;">
        Digital Prescription System<br />
        This is an automated email, please do not reply.
      </p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: "Password Reset Code - Digital Prescription",
    html,
  });
}

/**
 * Send email verification code (optional, for future use)
 */
export async function sendEmailVerificationCode(
  email: string,
  name: string,
  verificationCode: string
): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Verify Your Email</h2>
      <p>Hello ${name},</p>
      <p>Thank you for registering. Please use the code below to verify your email:</p>
      <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; text-align: center; border-radius: 5px;">
        <h1 style="color: #0066cc; letter-spacing: 5px; margin: 0;">${verificationCode}</h1>
      </div>
      <p style="color: #666;">This code will expire in 15 minutes.</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
      <p style="font-size: 12px; color: #999;">
        Digital Prescription System<br />
        This is an automated email, please do not reply.
      </p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: "Email Verification Code - Digital Prescription",
    html,
  });
}
