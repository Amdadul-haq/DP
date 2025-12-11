-- ============================================
-- Admin Role System Update
-- ============================================
-- This script updates the user system to support separate admin role
-- Run this AFTER the payment-schema.sql

-- Step 1: Update role type to include 'admin'
-- First, check existing role_type
DO $$ 
BEGIN
  -- Drop the old constraint if it exists
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_role_check'
  ) THEN
    ALTER TABLE users DROP CONSTRAINT users_role_check;
  END IF;
  
  -- Add new constraint with admin role
  ALTER TABLE users ADD CONSTRAINT users_role_check 
    CHECK (role IN ('doctor', 'assistant', 'admin'));
END $$;

-- Step 2: Remove is_admin column (we'll use role='admin' instead)
-- This keeps the system cleaner - one role field instead of two
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'is_admin'
  ) THEN
    -- First, update any doctors with is_admin=true to role='admin'
    -- (This is a migration step for existing data)
    -- UPDATE users SET role = 'admin' WHERE is_admin = true AND role = 'doctor';
    
    -- Then drop the column
    ALTER TABLE users DROP COLUMN is_admin;
  END IF;
END $$;

-- Step 3: Ensure admins don't need doctor-specific fields
-- Admins won't have BMDC registration or specialty
-- Make bmdc_reg nullable for admins (but still required for doctors via app logic)
ALTER TABLE users ALTER COLUMN bmdc_reg DROP NOT NULL;

-- Step 4: Add index for faster role-based queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Step 5: Create admin user (EXAMPLE - Follow instructions below)
-- 
-- TO CREATE AN ADMIN USER:
-- 1. Run: node scripts/hash-password.js YourSecurePassword
-- 2. Copy the hashed password from the output
-- 3. Replace 'REPLACE_WITH_HASHED_PASSWORD' below with the hash
-- 4. Change the email to your admin email
-- 5. Run this INSERT query
--
-- Example:
-- INSERT INTO users (email, password_hash, first_name, last_name, bmdc_reg, role)
-- VALUES (
--   'admin@yourdomain.com',
--   '$scrypt$N=16384...',  -- Your hashed password here
--   'Admin',
--   'User',
--   NULL,  -- Admins don't need BMDC registration
--   'admin'
-- );
--
-- IMPORTANT: Admins are NOT doctors. They have a separate role.
-- Admins manage payment approvals and system administration.

-- Step 6: Ensure subscriptions table is only for doctors
-- Add comment for clarity
COMMENT ON TABLE subscriptions IS 'Subscription plans for doctors only. Admins do not need subscriptions.';

-- Step 7: Ensure payment_requests table is only for doctors
COMMENT ON TABLE payment_requests IS 'Payment requests from doctors for subscription plans. Admins do not make payments.';

-- ============================================
-- Verification Queries
-- ============================================

-- Check role constraint
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'users'::regclass AND conname = 'users_role_check';

-- Check if is_admin column is removed
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'is_admin';
-- Should return no rows

-- View all users with their roles
SELECT id, email, first_name, last_name, role, created_at 
FROM users 
ORDER BY role, created_at DESC;

-- Count users by role
SELECT role, COUNT(*) as count 
FROM users 
GROUP BY role;
