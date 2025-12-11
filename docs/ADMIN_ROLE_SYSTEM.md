# Admin Role System - Complete Guide

## Overview

The system now has **three separate user roles**:
- **Doctor**: Medical practitioners who create prescriptions (require subscription)
- **Assistant**: Staff members who help doctors manage patients (no subscription needed)
- **Admin**: System administrators who approve payments and manage the platform (no subscription needed)

## Key Changes

### 1. Separate Admin Role
- Admins are **NOT** doctors with special permissions
- Admins are completely separate users with `role='admin'`
- Admins cannot create prescriptions or manage patients
- Admins only manage payment approvals

### 2. Database Schema Updates

```sql
-- Role types now include 'admin'
CHECK (role IN ('doctor', 'assistant', 'admin'))

-- Removed is_admin column (use role='admin' instead)
-- BMDC registration is now nullable (admins don't need it)
```

### 3. Login Flow

**Doctor Login:**
- Checks subscription status
- If no subscription → redirects to `/pricing`
- If has subscription → redirects to `/dashboard`

**Admin Login:**
- Always redirects to `/dashboard/admin/payment-requests`
- No subscription check (admins don't need subscriptions)

**Assistant Login:**
- Redirects to `/dashboard/patients`
- No subscription check (linked to doctor's subscription)

### 4. Dashboard Access Control

**Doctors:**
- Cannot access dashboard without active subscription
- Blocked at layout level with subscription check
- Can access billing page to submit payment

**Admins:**
- Can only access `/dashboard/admin/*` routes
- Blocked from doctor dashboard pages
- No navigation sidebar (admin panel only)

**Assistants:**
- Can only access `/dashboard/patients`
- Blocked from other routes

## Creating an Admin User

### Method 1: Using SQL (Recommended for Production)

1. **Hash your password:**
```bash
node scripts/hash-password.js YourSecurePassword123
```

2. **Copy the hashed password** from the output

3. **Run the migration:**
```bash
# In your PostgreSQL client
psql -U your_username -d your_database -f src/lib/admin-schema.sql
```

4. **Create admin user:**
```sql
INSERT INTO users (email, password_hash, first_name, last_name, bmdc_reg, role)
VALUES (
  'admin@yourdomain.com',
  'PASTE_HASHED_PASSWORD_HERE',
  'Admin',
  'User',
  NULL,  -- Admins don't need BMDC
  'admin'
);
```

### Method 2: Using Postman/API Client

**Endpoint:** `POST /api/admin/create` (if you create this endpoint)

Or directly in database:
```sql
-- Quick admin creation
INSERT INTO users (email, password_hash, first_name, last_name, role)
VALUES (
  'admin@example.com',
  '[HASHED_PASSWORD]',
  'System',
  'Administrator',
  'admin'
);
```

## Admin Capabilities

### What Admins Can Do:
✅ View all payment requests
✅ Approve payment requests (activates subscriptions)
✅ Reject payment requests with reasons
✅ Filter payment requests by status
✅ Receive Telegram notifications (if configured)

### What Admins CANNOT Do:
❌ Create prescriptions
❌ Manage patients
❌ Access doctor dashboard
❌ Create assistants
❌ Register via frontend (must be created via backend)

## Payment Approval Workflow

1. **Doctor submits payment** via frontend (`/checkout?plan=2`)
2. **System sends Telegram notification** to admin (if configured)
3. **Admin logs in** → Redirected to `/dashboard/admin/payment-requests`
4. **Admin reviews** payment details (transaction ID, sender number)
5. **Admin verifies** payment in mobile banking app (bKash/Nagad/Rocket)
6. **Admin approves/rejects** the request
7. **System activates subscription** (if approved)
8. **Doctor gets access** to dashboard

## Security Features

### Registration Blocked
```typescript
// Cannot create admin via registration
if (email.includes('admin') || bmdcReg === 'admin') {
  return error('Invalid registration data');
}
```

### Role-Based Access Control
```typescript
// API endpoints check role
if (user.role !== 'admin') {
  return error('Admin access required');
}
```

### Dashboard Layout Guard
```typescript
// Admins only see admin panel
if (user.role === 'admin' && !pathname.startsWith('/dashboard/admin')) {
  router.replace('/dashboard/admin/payment-requests');
}
```

## Testing the System

### 1. Create Admin User
```bash
# Hash password
node scripts/hash-password.js Admin@12345

# Run migration
psql -d your_db -f src/lib/admin-schema.sql

# Insert admin (update hash)
INSERT INTO users (email, password_hash, first_name, last_name, role)
VALUES ('admin@test.com', 'HASHED_PASSWORD', 'Test', 'Admin', 'admin');
```

### 2. Test Admin Login
1. Go to `/login`
2. Login with admin credentials
3. Should redirect to `/dashboard/admin/payment-requests`
4. Should NOT see doctor navigation

### 3. Test Doctor Payment Flow
1. Register new doctor account
2. Login → Redirected to `/pricing`
3. Select plan → Submit payment
4. Should see "Pending Approval" message
5. Should NOT have "Go to Dashboard" button
6. Cannot access `/dashboard` until approved

### 4. Test Admin Approval
1. Login as admin
2. See pending payment request
3. Approve the payment
4. Check subscription is created
5. Doctor can now login and access dashboard

## Troubleshooting

### Issue: Admin can't access admin panel
**Solution:** Check database role:
```sql
SELECT email, role FROM users WHERE email = 'admin@example.com';
-- Should show role='admin', not 'doctor'
```

### Issue: Doctor can access dashboard without subscription
**Solution:** Check dashboard layout subscription check:
- Layout should fetch subscription from context
- Should redirect to `/pricing` if no subscription

### Issue: Payment submission redirects to dashboard
**Solution:** Check PaymentForm.tsx success state:
- Should NOT have "Go to Dashboard" button
- Should show "Pending Approval" warning

### Issue: Frontend shows is_admin related errors
**Solution:** Run admin-schema.sql to remove is_admin column:
```sql
ALTER TABLE users DROP COLUMN IF EXISTS is_admin;
```

## API Endpoints Summary

### Admin-Only Endpoints
- `GET /api/admin/check-access` - Verify admin role
- `GET /api/admin/payment-requests` - List payment requests
- `POST /api/admin/payment-requests/[id]/approve` - Approve payment
- `POST /api/admin/payment-requests/[id]/reject` - Reject payment

### Doctor Endpoints (Auth Required)
- `POST /api/payment/submit` - Submit payment request
- `GET /api/payment/submit` - Get payment history
- `GET /api/payment/config` - Get payment methods

### Public Endpoints
- `POST /api/auth/login` - Login (all roles)
- `POST /api/auth/register` - Register (doctors only)
- `GET /api/plans` - Get subscription plans

## Migration Checklist

- [ ] Run `src/lib/admin-schema.sql` to update schema
- [ ] Create admin user using hash-password.js
- [ ] Verify admin can login and access admin panel
- [ ] Test doctor payment submission (no dashboard access)
- [ ] Test admin approval workflow
- [ ] Verify doctor gets access after approval
- [ ] Remove any old is_admin references in code
- [ ] Update .env.local with Telegram config (optional)
- [ ] Test all three roles (doctor, admin, assistant)

## Production Deployment

1. **Backup database** before running migrations
2. **Run admin-schema.sql** on production database
3. **Create production admin user** with strong password
4. **Test admin login** on production
5. **Verify payment flow** end-to-end
6. **Configure Telegram bot** (optional but recommended)
7. **Monitor logs** for any role-related errors

## Support

If you encounter issues:
1. Check browser console for errors
2. Check server logs for API errors
3. Verify database schema with provided queries
4. Ensure all migrations are applied
5. Test each role separately

---

**Last Updated:** December 11, 2024
**System Version:** v2.0 (Separate Admin Role System)
