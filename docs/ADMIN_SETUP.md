# Admin Setup Guide

This guide explains how to set up admin access for the payment system in production.

## Overview

The payment system requires admin users who can:
- View all payment requests
- Approve payment requests (which activates user subscriptions)
- Reject payment requests with reasons
- Receive Telegram notifications (optional)

**Important**: Only users with `role='doctor'` AND `is_admin=true` can access the admin panel.

## Step 1: Run the Payment Schema

First, make sure you've run the payment schema to add the `is_admin` column:

```bash
psql -U your_username -d digital_prescription -f src/lib/payment-schema.sql
```

This adds the `is_admin` column to the `users` table.

## Step 2: Create an Admin User

You have two options:

### Option A: Make an Existing User Admin (Recommended)

If you already have a doctor account, simply make it an admin:

```sql
UPDATE users 
SET is_admin = true 
WHERE email = 'your-email@example.com';
```

### Option B: Create a New Admin User

1. **Generate a hashed password** using the provided script:

```bash
node scripts/hash-password.js YourSecurePassword123
```

This will output a hashed password like:
```
✅ Password hashed successfully!

Password: YourSecurePassword123
Hashed: a1b2c3d4e5f6g7h8:9i0j1k2l3m4n5o6p7q8r9s0t...

📋 Copy the hashed password and use it in your SQL query:

INSERT INTO users (email, password_hash, first_name, last_name, bmdc_reg, specialty, role, is_admin, email_verified)
VALUES ('admin@example.com', 'a1b2c3d4e5f6g7h8:9i0j1k2l3m4n5o6p7q8r9s0t...', 'Admin', 'User', 'ADMIN001', 'Administration', 'doctor', true, true);
```

2. **Run the SQL query** with your details:

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
    'admin@digitalprescription.com',  -- Your admin email
    'PASTE_HASHED_PASSWORD_HERE',      -- Hashed password from step 1
    'Admin',                           -- Your first name
    'User',                            -- Your last name
    'ADMIN001',                        -- Unique BMDC number
    'Administration',                  -- Specialty
    'doctor',                          -- Must be 'doctor'
    true,                              -- is_admin = true
    true                               -- Email verified
);
```

## Step 3: Verify Admin Access

Check if the admin user was created successfully:

```sql
SELECT id, email, first_name, last_name, role, is_admin 
FROM users 
WHERE is_admin = true;
```

You should see your admin user(s) listed with `is_admin = true`.

## Step 4: Login and Access Admin Panel

1. **Login** with your admin credentials at `/login`
2. **Navigate** to the admin panel at `/dashboard/admin/payment-requests`
3. You should see the payment requests dashboard

## Access Control

The system has multiple layers of security:

### Frontend Check
- User must be logged in
- User role must be `'doctor'`
- Makes API call to verify `is_admin` flag

### Backend Check (All Admin APIs)
- Verifies JWT token
- Checks user role is `'doctor'`
- Queries database to confirm `is_admin = true`
- Returns 403 Forbidden if any check fails

## Managing Admin Users

### List All Admins
```sql
SELECT id, email, first_name, last_name, role, is_admin 
FROM users 
WHERE is_admin = true;
```

### Add Admin Privileges
```sql
UPDATE users 
SET is_admin = true 
WHERE email = 'doctor@example.com';
```

### Remove Admin Privileges
```sql
UPDATE users 
SET is_admin = false 
WHERE email = 'former-admin@example.com';
```

### Check Specific User
```sql
SELECT email, role, is_admin 
FROM users 
WHERE email = 'user@example.com';
```

## Troubleshooting

### "You don't have admin access" error

1. **Check if is_admin is true**:
```sql
SELECT email, role, is_admin FROM users WHERE email = 'your-email@example.com';
```

2. **Verify you're a doctor**:
- Only users with `role = 'doctor'` can be admins
- Assistants cannot access the admin panel

3. **Update is_admin flag**:
```sql
UPDATE users SET is_admin = true WHERE email = 'your-email@example.com';
```

4. **Clear browser cache and re-login**

### "Unauthorized" error

- Make sure you're logged in
- Check if your JWT token is valid
- Try logging out and logging in again

### Cannot access admin panel

1. **Check the URL**: `/dashboard/admin/payment-requests`
2. **Verify role**: Must be `'doctor'`, not `'assistant'`
3. **Check is_admin flag in database**

## Security Best Practices

1. **Strong Passwords**: Use strong, unique passwords for admin accounts
2. **Limited Access**: Only give admin access to trusted users
3. **Regular Audits**: Periodically review who has admin access
4. **Separate Accounts**: Use separate accounts for admin and regular doctor work
5. **Monitor Activity**: Review payment approval/rejection logs regularly

## Production Deployment

When deploying to production:

1. **Update Environment Variables**:
```env
DATABASE_URL=your_production_database_url
JWT_SECRET=your_secure_random_secret
```

2. **Run Migrations**:
```bash
psql -U your_username -d your_production_db -f src/lib/payment-schema.sql
```

3. **Create Admin User** (use Option B with a strong password)

4. **Test Access**:
   - Login as admin
   - Access admin panel
   - Test approval/rejection flow

5. **Setup Telegram** (optional but recommended):
   - See `docs/TELEGRAM_SETUP.md`

## API Endpoints Reference

### Check Admin Access
```
GET /api/admin/check-access
Headers: Authorization: Bearer <token>
Returns: 200 if admin, 403 if not
```

### List Payment Requests
```
GET /api/admin/payment-requests
GET /api/admin/payment-requests?status=pending
Headers: Authorization: Bearer <token>
```

### Approve Payment
```
POST /api/admin/payment-requests/[id]/approve
Headers: Authorization: Bearer <token>
Body: { "adminNote": "optional note" }
```

### Reject Payment
```
POST /api/admin/payment-requests/[id]/reject
Headers: Authorization: Bearer <token>
Body: { "adminNote": "required rejection reason" }
```

## Support

If you encounter issues:

1. Check database connection
2. Verify `is_admin` column exists
3. Confirm JWT token is valid
4. Review server logs for errors
5. Test with the SQL queries above

---

**Remember**: Admin access is powerful. Only grant it to trusted team members who need to manage payment approvals!
