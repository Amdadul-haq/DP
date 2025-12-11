-- ===================================================================
-- MIGRATION: Add Admin Role System
-- ===================================================================
-- Copy and paste this ENTIRE file into your PostgreSQL client (pgAdmin, psql, etc.)
-- This will safely update your existing database

-- Step 1: Drop the old role constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Step 2: Add new constraint that includes 'admin' role
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('doctor', 'assistant', 'admin'));

-- Step 3: Make bmdc_reg nullable (admins don't need BMDC registration)
ALTER TABLE users ALTER COLUMN bmdc_reg DROP NOT NULL;

-- Step 4: Add index for faster role lookups
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Step 5: Add payment_request_id to subscriptions (for tracking which payment created the subscription)
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS payment_request_id INTEGER;

-- Done! Now you can create an admin user.
-- See instructions below.
