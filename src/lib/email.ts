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

/**
 * Send payment request notification email to admin
 */
export async function sendPaymentRequestEmailToAdmin(
  adminEmail: string,
  userName: string,
  userEmail: string,
  planName: string,
  amount: number,
  billingCycle: string,
  paymentMethod: string,
  transactionId: string,
  requestId: number
): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333; border-bottom: 2px solid #0066cc; padding-bottom: 10px;">New Payment Request</h2>
      <p>A new payment request has been submitted and requires your review.</p>
      
      <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px;">
        <h3 style="color: #0066cc; margin-top: 0;">User Details</h3>
        <p style="margin: 5px 0;"><strong>Name:</strong> ${userName}</p>
        <p style="margin: 5px 0;"><strong>Email:</strong> ${userEmail}</p>
        
        <h3 style="color: #0066cc; margin-top: 20px;">Subscription Details</h3>
        <p style="margin: 5px 0;"><strong>Plan:</strong> ${planName}</p>
        <p style="margin: 5px 0;"><strong>Amount:</strong> ৳${amount}</p>
        <p style="margin: 5px 0;"><strong>Billing Cycle:</strong> ${billingCycle}</p>
        
        <h3 style="color: #0066cc; margin-top: 20px;">Payment Information</h3>
        <p style="margin: 5px 0;"><strong>Method:</strong> ${paymentMethod}</p>
        <p style="margin: 5px 0;"><strong>Transaction ID:</strong> ${transactionId}</p>
        <p style="margin: 5px 0;"><strong>Request ID:</strong> #${requestId}</p>
      </div>
      
      <p style="margin: 20px 0;">
        <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/admin/payment-requests" 
           style="background-color: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Review Payment Request
        </a>
      </p>
      
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
      <p style="font-size: 12px; color: #999;">
        Digital Prescription System - Admin Panel<br />
        This is an automated email, please do not reply.
      </p>
    </div>
  `;

  return sendEmail({
    to: adminEmail,
    subject: `New Payment Request #${requestId} - ${userName}`,
    html,
  });
}

/**
 * Send payment approval notification email to user
 */
export async function sendPaymentApprovalEmailToUser(
  userEmail: string,
  userName: string,
  planName: string,
  billingCycle: string,
  amount: number,
  periodEnd: Date,
  adminNote?: string
): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #28a745; border-bottom: 2px solid #28a745; padding-bottom: 10px;">✓ Payment Approved</h2>
      <p>Hello ${userName},</p>
      <p>Congratulations! Your payment request has been approved and your subscription is now active.</p>
      
      <div style="background-color: #d4edda; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #28a745;">
        <h3 style="color: #155724; margin-top: 0;">Subscription Details</h3>
        <p style="margin: 5px 0;"><strong>Plan:</strong> ${planName}</p>
        <p style="margin: 5px 0;"><strong>Amount Paid:</strong> ৳${amount}</p>
        <p style="margin: 5px 0;"><strong>Billing Cycle:</strong> ${billingCycle}</p>
        <p style="margin: 5px 0;"><strong>Valid Until:</strong> ${new Date(periodEnd).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
      
      ${adminNote ? `
      <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
        <p style="margin: 0;"><strong>Admin Note:</strong></p>
        <p style="margin: 5px 0; color: #666;">${adminNote}</p>
      </div>
      ` : ''}
      
      <p style="margin: 20px 0;">
        <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/login" 
           style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Access Your Dashboard
        </a>
      </p>
      
      <p>You can now enjoy all the features of your ${planName} plan!</p>
      
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
      <p style="font-size: 12px; color: #999;">
        Digital Prescription System<br />
        This is an automated email, please do not reply.
      </p>
    </div>
  `;

  return sendEmail({
    to: userEmail,
    subject: "Payment Approved - Subscription Activated",
    html,
  });
}

/**
 * Send payment rejection notification email to user
 */
export async function sendPaymentRejectionEmailToUser(
  userEmail: string,
  userName: string,
  planName: string,
  reason: string
): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc3545; border-bottom: 2px solid #dc3545; padding-bottom: 10px;">Payment Request Declined</h2>
      <p>Hello ${userName},</p>
      <p>We regret to inform you that your payment request for the <strong>${planName}</strong> plan could not be approved.</p>
      
      <div style="background-color: #f8d7da; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #dc3545;">
        <h3 style="color: #721c24; margin-top: 0;">Reason for Rejection</h3>
        <p style="margin: 0; color: #721c24;">${reason}</p>
      </div>
      
      <h3 style="color: #333;">What to do next?</h3>
      <ul style="color: #666; line-height: 1.8;">
        <li>Please verify your payment details and transaction ID</li>
        <li>Make sure the payment was sent to the correct account</li>
        <li>Double-check the transaction amount matches the plan price</li>
        <li>If you believe this is an error, please contact support</li>
      </ul>
      
      <p style="margin: 20px 0;">
        <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/pricing" 
           style="background-color: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Try Again
        </a>
      </p>
      
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
      <p style="font-size: 12px; color: #999;">
        Digital Prescription System<br />
        If you have any questions, please contact our support team.
      </p>
    </div>
  `;

  return sendEmail({
    to: userEmail,
    subject: "Payment Request Declined - Action Required",
    html,
  });
}

/**
 * Send Free Plan activation notification email to admin
 */
export async function sendFreePlanNotificationToAdmin(
  adminEmail: string,
  userName: string,
  userEmail: string,
  userId: number,
  validUntil: Date
): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10b981; border-bottom: 2px solid #10b981; padding-bottom: 10px;">🎉 New Free Plan Activation</h2>
      <p>Hello Admin,</p>
      <p>A user has successfully activated the <strong>Free Plan</strong>.</p>
      
      <div style="background-color: #f0fdf4; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #10b981;">
        <h3 style="color: #059669; margin-top: 0;">User Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666; width: 40%;"><strong>Name:</strong></td>
            <td style="padding: 8px 0; color: #333;">${userName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;"><strong>Email:</strong></td>
            <td style="padding: 8px 0; color: #333;">${userEmail}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;"><strong>User ID:</strong></td>
            <td style="padding: 8px 0; color: #333;">#${userId}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;"><strong>Plan:</strong></td>
            <td style="padding: 8px 0; color: #333;">Free Plan</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;"><strong>Valid Until:</strong></td>
            <td style="padding: 8px 0; color: #333;">${validUntil.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
          </tr>
        </table>
      </div>
      
      <p style="color: #666;">
        This is an automated notification for your records. No action is required.
      </p>
      
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
      <p style="font-size: 12px; color: #999;">
        Digital Prescription System - Admin Notification<br />
        This is an automated email, please do not reply.
      </p>
    </div>
  `;

  return sendEmail({
    to: adminEmail,
    subject: "🎉 New Free Plan Activation - Digital Prescription",
    html,
  });
}

/**
 * Send Free Plan activation confirmation email to user
 */
export async function sendFreePlanConfirmationToUser(
  userEmail: string,
  userName: string,
  validUntil: Date
): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10b981; border-bottom: 2px solid #10b981; padding-bottom: 10px;">🎉 Welcome to Digital Prescription!</h2>
      <p>Dear ${userName},</p>
      <p>Congratulations! Your <strong>Free Plan</strong> has been activated successfully.</p>
      
      <div style="background-color: #f0fdf4; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #10b981;">
        <h3 style="color: #059669; margin-top: 0;">Subscription Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666; width: 40%;"><strong>Plan:</strong></td>
            <td style="padding: 8px 0; color: #333;">Free Plan</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;"><strong>Duration:</strong></td>
            <td style="padding: 8px 0; color: #333;">1 Month</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;"><strong>Valid Until:</strong></td>
            <td style="padding: 8px 0; color: #333;">${validUntil.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;"><strong>Status:</strong></td>
            <td style="padding: 8px 0; color: #10b981; font-weight: bold;">✓ Active</td>
          </tr>
        </table>
      </div>
      
      <div style="background-color: #fef3c7; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #f59e0b;">
        <p style="margin: 0; color: #92400e; font-size: 14px;">
          <strong>Important:</strong> The Free Plan can only be activated once per account. After expiration, you'll need to upgrade to a paid plan to continue using our services.
        </p>
      </div>
      
      <p style="color: #333;">
        You can now access your dashboard and start creating prescriptions!
      </p>
      
      <p style="margin: 20px 0;">
        <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard" 
           style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Go to Dashboard
        </a>
      </p>
      
      <div style="background-color: #f9fafb; padding: 15px; margin: 20px 0; border-radius: 5px;">
        <h3 style="color: #333; margin-top: 0;">Need more features?</h3>
        <p style="margin: 0; color: #666; line-height: 1.6;">
          Upgrade to our Starter or Professional plans anytime to unlock unlimited prescriptions, advanced features, and priority support.
        </p>
        <p style="margin: 10px 0 0 0;">
          <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/pricing" 
             style="color: #059669; text-decoration: none; font-weight: bold;">
            View Plans →
          </a>
        </p>
      </div>
      
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
      <p style="font-size: 12px; color: #999;">
        Thank you for choosing Digital Prescription!<br />
        If you have any questions, feel free to contact our support team.
      </p>
    </div>
  `;

  return sendEmail({
    to: userEmail,
    subject: "🎉 Free Plan Activated - Welcome to Digital Prescription!",
    html,
  });
}
