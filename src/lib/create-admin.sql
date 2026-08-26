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
