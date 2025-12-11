# Quick Setup Guide - Admin User Creation

## Step 1: Run Database Migration

```bash
psql -U your_username -d your_database_name -f src/lib/admin-schema.sql
```

This will:
- Add 'admin' to role types
- Remove old is_admin column
- Make bmdc_reg nullable for admins

## Step 2: Generate Password Hash

```bash
cd c:\Users\Dell\Desktop\digital-prescription
node scripts/hash-password.js YourSecurePassword123
```

**Copy the hash** that appears (looks like: `f8d7a6b5c4:3e2d1c0b9a8f7e6d...`)

## Step 3: Create Admin User

Open your PostgreSQL client and run:

```sql
INSERT INTO users (
  email, 
  password_hash, 
  first_name, 
  last_name, 
  bmdc_reg, 
  role
) 
VALUES (
  'admin@digitalprescription.com',  -- Change this to your email
  'PASTE_YOUR_HASHED_PASSWORD_HERE',  -- Paste the hash from Step 2
  'Admin',  -- Change to your first name
  'User',   -- Change to your last name
  NULL,     -- Admins don't need BMDC registration
  'admin'   -- IMPORTANT: Must be 'admin', not 'doctor'
);
```

## Step 4: Verify Admin User

```sql
-- Check admin was created
SELECT id, email, first_name, last_name, role, bmdc_reg
FROM users 
WHERE role = 'admin';
```

You should see your admin user with:
- role = 'admin'
- bmdc_reg = NULL

## Step 5: Test Admin Login

1. Open your application: `http://localhost:3000/login`
2. Login with admin credentials
3. You should be redirected to: `/dashboard/admin/payment-requests`
4. You should see the admin panel (NOT the doctor dashboard)

## Common Issues

### ❌ Admin redirected to pricing page
**Problem:** Role is 'doctor', not 'admin'

**Fix:**
```sql
UPDATE users 
SET role = 'admin', bmdc_reg = NULL 
WHERE email = 'admin@digitalprescription.com';
```

### ❌ Column "is_admin" does not exist
**Problem:** Old code still references is_admin

**Fix:** Run the migration again:
```bash
psql -U your_username -d your_database -f src/lib/admin-schema.sql
```

### ❌ Cannot access admin panel
**Problem:** Check role in database

**Fix:**
```sql
-- Check role
SELECT email, role FROM users WHERE email = 'your@email.com';

-- Update to admin if needed
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

## Production Checklist

- [ ] Change default admin email
- [ ] Use strong password (minimum 12 characters)
- [ ] Hash password using hash-password.js
- [ ] Verify admin can login
- [ ] Verify admin panel loads correctly
- [ ] Test payment approval workflow
- [ ] Configure Telegram bot (optional)
- [ ] Backup database before migrations

## Example: Complete Setup

```bash
# 1. Navigate to project
cd c:\Users\Dell\Desktop\digital-prescription

# 2. Hash password
node scripts/hash-password.js MySecurePass@2024
# Output: Salt:Hash → Copy the full string

# 3. Run SQL migration
psql -U postgres -d digital_prescription -f src/lib/admin-schema.sql

# 4. Create admin in SQL
# (Paste in psql or pgAdmin)
INSERT INTO users (email, password_hash, first_name, last_name, role)
VALUES (
  'admin@mycompany.com',
  'a1b2c3d4e5:f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0...',  -- Your hash
  'John',
  'Admin',
  'admin'
);

# 5. Verify
SELECT * FROM users WHERE role = 'admin';

# 6. Test login at http://localhost:3000/login
```

## Next Steps

After creating admin user:
1. ✅ Test admin login
2. ✅ Test doctor payment submission
3. ✅ Test admin approval
4. ✅ Verify subscription activation
5. ✅ Configure Telegram notifications (optional)

## Need Help?

See full documentation: `docs/ADMIN_ROLE_SYSTEM.md`
