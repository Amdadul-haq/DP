// lib/email.ts - Email configuration with provider support
import nodemailer from "nodemailer";

/**
 * Build transporter dynamically - NO CACHING in serverless to avoid stale configs
 */
function buildTransporter(): nodemailer.Transporter {
  const hostRaw = process.env.EMAIL_HOST?.trim();
  const serviceRaw = process.env.EMAIL_SERVICE?.trim();
  const portStr = process.env.EMAIL_PORT?.trim();
  const port = portStr ? parseInt(portStr, 10) : undefined;
  const secureEnv = process.env.EMAIL_SECURE?.trim() === 'true';
  const user = process.env.EMAIL_USER?.trim();
  const pass = process.env.EMAIL_PASSWORD?.trim();

  // Log config for debugging
  console.log('[email] Building transporter with env:', {
    hasHost: !!hostRaw,
    host: hostRaw || 'not set',
    port: port || 'not set',
    hasUser: !!user,
    hasPass: !!pass,
    secure: secureEnv
  });

  // Basic validation
  if (!user || !pass) {
    console.error('[email] Missing EMAIL_USER or EMAIL_PASSWORD environment variables.');
    throw new Error('Email configuration incomplete: missing credentials');
  }

  // CRITICAL: Always use explicit SMTP when EMAIL_HOST is set
  // Never fall back to Gmail service if Brevo credentials are configured
  if (hostRaw) {
    const smtpPort = port || 587; // Default to 587 for Brevo
    console.log(`[email] Using SMTP: ${hostRaw}:${smtpPort}`);
    
    return nodemailer.createTransport({
      host: hostRaw,
      port: smtpPort,
      secure: secureEnv, // explicit secure flag
      auth: { 
        user, 
        pass 
      },
      // Brevo specific settings
      tls: { 
        rejectUnauthorized: false,
        ciphers: 'SSLv3'
      }
    });
  }

  // Fallback to service-based (Gmail, etc.) only if no EMAIL_HOST
  console.log(`[email] Using service: ${serviceRaw || 'gmail'}`);
  return nodemailer.createTransport({
    service: serviceRaw || 'gmail',
    auth: { user, pass }
  });
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send email using nodemailer with Brevo
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const requiredVars = ['EMAIL_USER', 'EMAIL_PASSWORD', 'EMAIL_HOST'];
  const missing = requiredVars.filter(v => !process.env[v]);
  if (missing.length) {
    console.error('[email] Missing required env vars:', missing);
    return false;
  }

  // Build fresh transporter every time in serverless (no cache)
  const transporter = buildTransporter();

  // Optional verify in non-production for clearer diagnostics
  if (process.env.NODE_ENV !== 'production') {
    try {
      await transporter.verify();
      console.log('[email] Transporter verified OK');
    } catch (verifyErr: unknown) {
      console.error('[email] Transporter verification failed:', verifyErr);
    }
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    return true;
  } catch (error: unknown) {
    const err = error as { code?: string } & Error;
    if (err.code === 'EAUTH') {
      console.error('[email] Authentication failed. Check EMAIL_USER / EMAIL_PASSWORD. If using Brevo ensure SMTP key (not UI password) is set.');
    }
    console.error('[email] Email sending error:', err);
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
