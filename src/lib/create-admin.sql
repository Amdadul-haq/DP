-- ============================================
-- CREATE ADMIN USER
-- ============================================
-- Run this AFTER executing schema.sql
-- This creates an admin user who can approve payment requests

-- Step 1: Generate password hash using Node.js
-- Run this command in your project folder:
-- node -e "const crypto = require('crypto'); const password = 'your_password_here'; const salt = crypto.randomBytes(16).toString('hex'); const hash = crypto.scryptSync(password, salt, 64).toString('hex'); console.log(salt + ':' + hash);"
-- Copy the output (it will look like: abc123...:def456...)

-- Step 2: Replace 'YOUR_PASSWORD_HASH_HERE' with the output from Step 1
-- Replace 'admin@yourdomain.com' with your actual admin email

INSERT INTO users (
    email, 
    password_hash, 
    first_name, 
    last_name, 
    bmdc_reg, 
    specialty, 
    role
) VALUES (
    'admin@yourdomain.com',                     -- Change this to your admin email
    'YOUR_PASSWORD_HASH_HERE',                  -- Replace with hash from Step 1
    'Admin',                                     -- Admin first name
    'User',                                      -- Admin last name
    NULL,                                        -- Admins don't need BMDC registration
    'System Administrator',                      -- Admin specialty
    'admin'                                      -- IMPORTANT: Must be 'admin'
) ON CONFLICT (email) DO NOTHING;

-- Verify admin was created
SELECT id, email, first_name, last_name, role FROM users WHERE role = 'admin';

-- ============================================
-- QUICK PASSWORD HASH GENERATOR
-- ============================================
-- If you have the project running, use the hash-password.js script:
-- node hash-password.js
-- 
-- Or use this PowerShell one-liner:
-- $password = "YourAdminPassword123"; node -e "const crypto = require('crypto'); const salt = crypto.randomBytes(16).toString('hex'); const hash = crypto.scryptSync('$password', salt, 64).toString('hex'); console.log(salt + ':' + hash);"
