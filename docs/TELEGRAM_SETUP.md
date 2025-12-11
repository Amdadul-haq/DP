# Telegram Notification Setup Guide

This guide will help you set up Telegram notifications for payment request alerts in the Digital Prescription platform.

## Why Telegram Notifications?

Telegram notifications allow you to receive instant alerts on your phone when:
- A new payment request is submitted by a user
- Payment requests are approved (optional notification to users)
- Payment requests are rejected (optional notification to users)

## Prerequisites

1. A Telegram account
2. Access to create a Telegram bot

## Step 1: Create a Telegram Bot

1. Open Telegram and search for `@BotFather`
2. Start a chat with BotFather and send: `/newbot`
3. Follow the prompts:
   - Choose a name for your bot (e.g., "Digital Prescription Bot")
   - Choose a username (must end in 'bot', e.g., "digitalprescription_bot")
4. BotFather will give you a **Bot Token**. Copy and save it.
   - Example: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`

## Step 2: Get Your Chat ID

### Option A: Using a Bot
1. Search for `@userinfobot` in Telegram
2. Start a chat and it will send you your Chat ID
3. Copy the Chat ID number

### Option B: Using Your Bot
1. Send a message to your bot (the one you just created)
2. Open this URL in your browser (replace YOUR_BOT_TOKEN):
   ```
   https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates
   ```
3. Look for `"chat":{"id":` in the response
4. Copy the Chat ID number

## Step 3: Configure Environment Variables

Open your `.env.local` file and update the Telegram configuration:

```env
# Telegram Configuration (Optional)
TELEGRAM_ENABLED=true
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_ADMIN_CHAT_ID=123456789
```

### Configuration Options:

- **TELEGRAM_ENABLED**: Set to `true` to enable notifications, `false` to disable
- **TELEGRAM_BOT_TOKEN**: Your bot token from BotFather
- **TELEGRAM_ADMIN_CHAT_ID**: Your personal Chat ID (admin who receives notifications)

## Step 4: Test the Setup

1. Restart your Next.js server:
   ```bash
   npm run dev
   ```

2. Submit a test payment request through your application

3. You should receive a notification on Telegram like:
   ```
   🔔 New Payment Request

   👤 User: John Doe
   📧 Email: john@example.com

   💼 Plan: Professional
   💰 Amount: ৳1000
   📅 Billing: monthly

   💳 Payment Method: BKASH
   🔢 Transaction ID: ABC123XYZ
   📱 Sender (Last 4): ***1234
   📞 Recipient: 01522-115653

   🆔 Request ID: #1

   ⏰ Time: 12/11/2025, 10:30:00 AM

   Please review and approve/reject this payment request in the admin dashboard.
   ```

## Troubleshooting

### Not receiving notifications?

1. **Check if Telegram is enabled**:
   - Verify `TELEGRAM_ENABLED=true` in `.env.local`

2. **Check your Bot Token**:
   - Make sure there are no extra spaces
   - Verify it's the correct token from BotFather

3. **Check your Chat ID**:
   - Make sure you've sent at least one message to your bot
   - Verify the Chat ID is correct (it's usually a number)

4. **Check server logs**:
   - Look for Telegram-related errors in your terminal
   - If you see "Telegram API error", check your credentials

5. **Test the bot manually**:
   - Visit: `https://api.telegram.org/botYOUR_BOT_TOKEN/getMe`
   - If you see bot info, the token is valid
   - Visit: `https://api.telegram.org/botYOUR_BOT_TOKEN/sendMessage?chat_id=YOUR_CHAT_ID&text=Test`
   - If you receive "Test", everything is configured correctly

### Notifications are optional

If Telegram notifications fail, the payment system will still work normally. Notifications are designed to fail silently without affecting the core payment workflow.

## Disabling Notifications

To disable Telegram notifications:

```env
TELEGRAM_ENABLED=false
```

Or simply remove/comment out the Telegram configuration lines in `.env.local`.

## Security Notes

- **Never commit `.env.local` to version control** - it contains sensitive credentials
- Keep your Bot Token secret - anyone with it can send messages as your bot
- Your Chat ID is not as sensitive but should still be kept private
- Consider using environment variables on your production server instead of `.env.local`

## Advanced: Group Notifications

To send notifications to a Telegram group instead of personal chat:

1. Create a Telegram group
2. Add your bot to the group
3. Make the bot an admin (required to send messages)
4. Get the group chat ID:
   - Send a message in the group
   - Visit: `https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates`
   - Look for the chat ID (it will be negative for groups, e.g., `-123456789`)
5. Use the group chat ID as `TELEGRAM_ADMIN_CHAT_ID`

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the server logs for error messages
3. Verify your bot and chat configuration
4. Test with the manual API calls described above

---

**Note**: Telegram notifications are completely optional. The payment system works perfectly without them - they're just a convenient way to get instant alerts on your phone!
