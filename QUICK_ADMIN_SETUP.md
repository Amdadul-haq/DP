# Quick Reference: Create Admin User

## Step 1: Hash Your Password

```bash
node scripts/hash-password.js YourSecurePassword123
```

**Output:**
```
✅ Password hashed successfully!

Password: YourSecurePassword123
Hashed: f8a2c1b3d4e5f6a7:8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e...
```

## Step 2: Run SQL Query

### Option A: Make Existing User Admin (Easiest)

```sql
UPDATE users 
SET is_admin = true 
WHERE email = 'your-existing-email@example.com';
```

### Option B: Create New Admin User

```sql
INSERT INTO users (
    email, 
    password_hash, 
    first_name, 
    last_name, 
    bmdc_reg, 
    specialty, 
    role, 
    is_admin,
    email_verified
) VALUES (
    'admin@digitalprescription.com',
    'PASTE_YOUR_HASHED_PASSWORD_HERE',
    'Admin',
    'User',
    'ADMIN001',
    'Administration',
    'doctor',
    true,
    true
);
```

## Step 3: Verify

```sql
SELECT id, email, first_name, role, is_admin 
FROM users 
WHERE is_admin = true;
```

## Step 4: Login

1. Go to `/login`
2. Login with admin email and password
3. Navigate to `/dashboard/admin/payment-requests`
4. You should see the admin panel ✅

---

## Telegram Setup (Optional)

### 1. Create Bot
- Open Telegram, search `@BotFather`
- Send `/newbot`
- Follow prompts
- Copy bot token

### 2. Get Chat ID
- Send message to your bot
- Open: `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates`
- Find `"chat":{"id":123456789}`

### 3. Update .env.local

```env
TELEGRAM_ENABLED=true
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_ADMIN_CHAT_ID=123456789
```

### 4. Restart Server

```bash
npm run dev
```

---

## Troubleshooting

### "You don't have admin access"

```sql
-- Check if is_admin is true
SELECT email, role, is_admin FROM users WHERE email = 'your@email.com';

-- Set is_admin to true
UPDATE users SET is_admin = true WHERE email = 'your@email.com';
```

### "Unauthorized access"

- Make sure role is 'doctor' (not 'assistant')
- Clear browser cache and re-login

---

## Quick Commands

```bash
# Hash password
node scripts/hash-password.js MyPassword123

# Run payment schema
psql -U postgres -d digital_prescription -f src/lib/payment-schema.sql

# Check admin users
psql -U postgres -d digital_prescription -c "SELECT email, is_admin FROM users WHERE is_admin = true;"

# Make user admin
psql -U postgres -d digital_prescription -c "UPDATE users SET is_admin = true WHERE email = 'user@example.com';"
```

---

**For detailed documentation, see:**
- `docs/ADMIN_SETUP.md` - Complete admin guide
- `docs/TELEGRAM_SETUP.md` - Telegram configuration
- `docs/PAYMENT_SYSTEM_SUMMARY.md` - Full system overview
