// lib/telegram.ts
/**
 * Telegram Notification Utility
 * Sends notifications to Telegram bot when payment requests are submitted
 */

interface TelegramConfig {
  enabled: boolean;
  botToken: string;
  adminChatId: string;
}

interface PaymentNotificationData {
  userName: string;
  userEmail: string;
  planName: string;
  amount: number;
  billingCycle: string;
  paymentMethod: string;
  transactionId: string;
  senderNumberLast4: string;
  recipientNumber: string;
  requestId: number;
}

/**
 * Get Telegram configuration from environment variables
 */
function getTelegramConfig(): TelegramConfig {
  return {
    enabled: process.env.TELEGRAM_ENABLED === 'true',
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    adminChatId: process.env.TELEGRAM_ADMIN_CHAT_ID || '',
  };
}

/**
 * Check if Telegram notifications are properly configured
 */
export function isTelegramConfigured(): boolean {
  const config = getTelegramConfig();
  return config.enabled && !!config.botToken && !!config.adminChatId;
}

/**
 * Send a message via Telegram Bot API
 */
async function sendTelegramMessage(message: string): Promise<boolean> {
  const config = getTelegramConfig();

  if (!config.enabled) {
    console.log('Telegram notifications are disabled');
    return false;
  }

  if (!config.botToken || !config.adminChatId) {
    console.error('Telegram bot token or admin chat ID is not configured');
    return false;
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${config.botToken}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: config.adminChatId,
          text: message,
          parse_mode: 'HTML',
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Telegram API error:', errorData);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);
    return false;
  }
}

/**
 * Format and send payment request notification to admin
 */
export async function sendPaymentRequestNotification(
  data: PaymentNotificationData
): Promise<boolean> {
  if (!isTelegramConfigured()) {
    return false;
  }

  const message = `
🔔 <b>New Payment Request</b>

👤 <b>User:</b> ${data.userName}
📧 <b>Email:</b> ${data.userEmail}

💼 <b>Plan:</b> ${data.planName}
💰 <b>Amount:</b> ৳${data.amount}
📅 <b>Billing:</b> ${data.billingCycle}

💳 <b>Payment Method:</b> ${data.paymentMethod.toUpperCase()}
🔢 <b>Transaction ID:</b> <code>${data.transactionId}</code>
📱 <b>Sender (Last 4):</b> ***${data.senderNumberLast4}
📞 <b>Recipient:</b> ${data.recipientNumber}

🆔 <b>Request ID:</b> #${data.requestId}

⏰ <b>Time:</b> ${new Date().toLocaleString('en-BD', { timeZone: 'Asia/Dhaka' })}

Please review and approve/reject this payment request in the admin dashboard.
`.trim();

  return await sendTelegramMessage(message);
}

/**
 * Send payment approval notification to user (optional - if you want to notify users via Telegram)
 */
export async function sendPaymentApprovalNotification(
  userName: string,
  planName: string,
  adminNote?: string
): Promise<boolean> {
  if (!isTelegramConfigured()) {
    return false;
  }

  const message = `
✅ <b>Payment Approved</b>

Hello ${userName},

Your payment for the <b>${planName}</b> plan has been approved!
Your subscription is now active.

${adminNote ? `📝 <b>Admin Note:</b> ${adminNote}` : ''}

Thank you for choosing Digital Prescription!
`.trim();

  return await sendTelegramMessage(message);
}

/**
 * Send payment rejection notification
 */
export async function sendPaymentRejectionNotification(
  userName: string,
  planName: string,
  reason: string
): Promise<boolean> {
  if (!isTelegramConfigured()) {
    return false;
  }

  const message = `
❌ <b>Payment Request Rejected</b>

Hello ${userName},

Unfortunately, your payment request for the <b>${planName}</b> plan has been rejected.

📝 <b>Reason:</b> ${reason}

Please contact support if you have any questions or try submitting a new payment request.
`.trim();

  return await sendTelegramMessage(message);
}
