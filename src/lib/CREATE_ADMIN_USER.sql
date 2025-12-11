-- ===================================================================
-- CREATE YOUR FIRST ADMIN USER
-- ===================================================================
-- Follow these steps AFTER running MIGRATION_ADMIN_ROLE.sql

-- Step 1: Generate password hash
-- Open terminal and run:
-- node scripts/hash-password.js YourPassword123

-- Step 2: Copy the output (looks like: abc123:def456...)

-- Step 3: Replace PASTE_HASH_HERE below and run this SQL:

INSERT INTO users (
  email, 
  password_hash, 
  first_name, 
  last_name, 
  bmdc_reg, 
  role
) 
VALUES (
  'admin@digitalprescription.com',  -- Change to your email
  'PASTE_HASH_HERE',                -- Paste hash from Step 1
  'Admin',                           -- Change to your name
  'User',                            -- Change to your last name
  NULL,                              -- Admins don't need BMDC
  'admin'                            -- MUST be 'admin'
);

-- Step 4: Verify admin was created
SELECT id, email, first_name, last_name, role 
FROM users 
WHERE role = 'admin';

-- You should see your admin user listed.
