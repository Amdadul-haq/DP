-- Create Admin User Script
-- Run this SQL to create an admin user in your database

-- First, you need to hash your password using your application
-- You can create a temporary route or script to hash the password

-- Example: Create admin user with hashed password
-- Replace 'YOUR_HASHED_PASSWORD_HERE' with the actual hashed password

-- Option 1: If you already have a doctor account, just make it admin
-- UPDATE users SET is_admin = true WHERE email = 'your-email@example.com';

-- Option 2: Create a new admin user from scratch
-- You'll need to hash the password first using your hashPassword function
-- Then run:

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
    'admin@digitalprescription.com',  -- Change this to your email
    'YOUR_HASHED_PASSWORD_HERE',      -- Replace with hashed password
    'Admin',                           -- Your first name
    'User',                            -- Your last name
    'ADMIN001',                        -- Admin BMDC registration (unique)
    'Administration',                  -- Specialty
    'doctor',                          -- Must be 'doctor' role
    true,                              -- is_admin flag set to true
    true                               -- Email verified
)
ON CONFLICT (email) DO UPDATE
SET is_admin = true;

-- Check if admin user was created successfully
SELECT id, email, first_name, last_name, role, is_admin 
FROM users 
WHERE is_admin = true;

-- Make an existing user an admin (replace email)
-- UPDATE users SET is_admin = true WHERE email = 'your-email@example.com';

-- Remove admin privileges from a user (replace email)
-- UPDATE users SET is_admin = false WHERE email = 'user-email@example.com';

-- List all admin users
-- SELECT id, email, first_name, last_name, role, is_admin 
-- FROM users 
-- WHERE is_admin = true;
