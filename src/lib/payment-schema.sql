-- ==========================
-- Payment System Schema
-- ==========================

-- Payment method enum
CREATE TYPE payment_method_enum AS ENUM ('bkash', 'nagad', 'rocket');

-- Payment request status enum
CREATE TYPE payment_status_enum AS ENUM ('pending', 'approved', 'rejected');

-- Payment requests table
CREATE TABLE IF NOT EXISTS payment_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id INTEGER NOT NULL REFERENCES plans(id),
    billing_cycle VARCHAR(10) NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
    
    -- Payment details
    payment_method payment_method_enum NOT NULL,
    sender_number_last_4 VARCHAR(4) NOT NULL,
    transaction_id VARCHAR(100) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    
    -- Admin info (your personal numbers)
    recipient_number VARCHAR(20) NOT NULL, -- The number user sent money to
    
    -- Status and admin actions
    status payment_status_enum DEFAULT 'pending',
    admin_id INTEGER REFERENCES users(id), -- Admin who approved/rejected
    admin_note TEXT, -- Optional note from admin
    reviewed_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_transaction_per_request UNIQUE(transaction_id, payment_method)
);

CREATE INDEX idx_payment_requests_user_id ON payment_requests(user_id);
CREATE INDEX idx_payment_requests_status ON payment_requests(status);
CREATE INDEX idx_payment_requests_created_at ON payment_requests(created_at DESC);

-- ==========================
-- Admin Users
-- ==========================
-- Add is_admin flag to existing users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Create an admin user (you should change these credentials)
-- Password: admin123 (hashed using your hashPassword function)
-- You'll need to run this separately with proper password hashing
-- INSERT INTO users (email, password_hash, first_name, last_name, bmdc_reg, specialty, role, is_admin)
-- VALUES ('admin@digitalprescription.com', 'HASHED_PASSWORD_HERE', 'Admin', 'User', 'ADMIN001', 'Administration', 'doctor', true);

-- ==========================
-- Payment Configuration
-- ==========================
-- Store your payment numbers (bKash, Nagad, Rocket)
CREATE TABLE IF NOT EXISTS payment_config (
    id SERIAL PRIMARY KEY,
    payment_method payment_method_enum NOT NULL UNIQUE,
    account_number VARCHAR(20) NOT NULL,
    account_name VARCHAR(100) NOT NULL,
    instructions TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert your payment numbers here (replace with your actual numbers)
INSERT INTO payment_config (payment_method, account_number, account_name, instructions, is_active) VALUES
('bkash', '01522-115653', 'MD.AMDADUL HAQUE', 'Send money to this bKash number. Make sure to note down the Transaction ID (TrxID) from your bKash app.', true),
('nagad', '01522-115653', 'MD.AMDADUL HAQUE', 'Send money to this Nagad number. After successful payment, you will receive a Transaction ID. Please copy it.', true),
('rocket', '01522-115653', 'MD.AMDADUL HAQUE', 'Send money to this Rocket number. Keep your Transaction ID from the confirmation SMS.', true)
ON CONFLICT (payment_method) DO NOTHING;

-- ==========================
-- Update subscriptions to link with payment requests
-- ==========================
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS payment_request_id INTEGER REFERENCES payment_requests(id);

-- ==========================
-- Note: Telegram Configuration
-- ==========================
-- Telegram bot configuration is now stored in .env.local file:
-- TELEGRAM_ENABLED=true/false
-- TELEGRAM_BOT_TOKEN=your_bot_token
-- TELEGRAM_ADMIN_CHAT_ID=your_admin_chat_id
