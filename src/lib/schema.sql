-- ============================================
-- DIGITAL PRESCRIPTION - COMPLETE DATABASE SCHEMA
-- ============================================
-- This is the ONLY SQL file you need to execute
-- Run this on a fresh database OR on existing database (it's safe - uses IF NOT EXISTS)
--
-- For Supabase:
-- 1. Go to SQL Editor in your Supabase dashboard
-- 2. Copy and paste this entire file
-- 3. Click "Run"
--
-- Last Updated: December 12, 2025
-- ============================================

-- ==========================
-- 1) Users table
-- ==========================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    bmdc_reg VARCHAR(50) UNIQUE, -- Made nullable for admin users
    specialty VARCHAR(100),
    email_verified BOOLEAN DEFAULT FALSE,
    password_reset_code VARCHAR(6),
    reset_code_expires TIMESTAMP,
    role VARCHAR(20) DEFAULT 'doctor' CHECK (role IN ('doctor', 'assistant', 'admin')),
    doctor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_bmdc_reg ON users(bmdc_reg);

-- ==========================
-- 2) Plans table
-- ==========================
CREATE TABLE IF NOT EXISTS plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10, 2) NOT NULL,
    price_yearly DECIMAL(10, 2) NOT NULL,
    features JSONB NOT NULL DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================
-- 3) Subscriptions table
-- ==========================
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    plan_id INTEGER REFERENCES plans(id),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'expired')),
    billing_cycle VARCHAR(10) NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
    current_period_start TIMESTAMP NOT NULL,
    current_period_end TIMESTAMP NOT NULL,
    payment_request_id INTEGER, -- Links to approved payment request
    stripe_subscription_id VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_payment_request_id ON subscriptions(payment_request_id);

-- ==========================
-- 4) User sessions
-- ==========================
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================
-- 5) Default plans
-- ==========================
-- Prices are in BDT (Bangladeshi Taka)
-- Free plan: Only monthly (yearly option disabled in frontend), 0 BDT
-- Starter plan: ৳500/month, ৳4500/year (10% discount, saves ৳500), 100 prescriptions/month
-- Professional plan: ৳1000/month, ৳8500/year (15% discount, saves ৳1500), unlimited prescriptions
INSERT INTO plans (name, description, price_monthly, price_yearly, features, is_active) VALUES
('Free', 'For students and new practitioners getting started', 0, 0, '["Up to 5 prescriptions per month", "Basic medicine database access", "Patient management (up to 10 patients)", "PDF download", "Community support"]', true),
('Starter', 'For individual practitioners with basic needs', 500, 4500, '["Up to 100 prescriptions per month", "Basic medicine database access", "Patient management", "PDF download", "Email support"]', true),
('Professional', 'For established practices with higher volume', 1000, 8500, '["Unlimited prescriptions", "Full medicine database access", "Advanced patient management", "Custom prescription templates", "Priority support"]', true)
ON CONFLICT DO NOTHING;

-- ==========================
-- 6) Patients table
-- ==========================
CREATE TYPE gender_enum AS ENUM ('Male', 'Female', 'Other');

CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    doctor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    patient_number INTEGER NOT NULL,
    full_name TEXT NOT NULL,
    gender gender_enum NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 0 AND age <= 150),
    mobile VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    blood_group VARCHAR(5),
    address TEXT,
    last_visit_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(doctor_id, mobile),
    UNIQUE(doctor_id, patient_number)
);

CREATE INDEX idx_patients_doctor_id ON patients(doctor_id);
CREATE INDEX idx_patients_full_name ON patients(full_name);
CREATE INDEX idx_patients_mobile ON patients(mobile);
CREATE INDEX idx_patients_doctor_patient_number ON patients(doctor_id, patient_number);

-- ==========================
-- 7) Function to get next patient number for a doctor
-- ==========================
CREATE OR REPLACE FUNCTION get_next_patient_number(doctor_id_param INT)
RETURNS INT AS $$
DECLARE
    next_number INT;
BEGIN
    SELECT COALESCE(MAX(patient_number), 0) + 1 
    INTO next_number 
    FROM patients 
    WHERE doctor_id = doctor_id_param;
    
    RETURN next_number;
END;
$$ LANGUAGE plpgsql;

-- ==========================
-- 8) Patients vitals table
-- ==========================
CREATE TABLE IF NOT EXISTS patients_vitals (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    blood_pressure TEXT,
    pulse TEXT,
    weight TEXT,
    temperature TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_patients_vitals_patient_id ON patients_vitals(patient_id);
CREATE INDEX IF NOT EXISTS idx_patients_vitals_created_at ON patients_vitals(created_at);

-- ==========================
-- 9) Prescriptions table (UPDATED)
-- ==========================
CREATE TABLE IF NOT EXISTS prescriptions (
    id SERIAL PRIMARY KEY,
    doctor_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    patient_id INT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    diagnosis TEXT,
    history TEXT,
    cc TEXT,
    bp TEXT,
    pulse TEXT,
    weight TEXT,
    temperature TEXT,
    tests TEXT,
    advice TEXT, -- ADDED: This is the missing column
    next_visit_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','completed')),
    created_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_prescriptions_doctor_id_created_at ON prescriptions(doctor_id, created_at DESC);
-- ==========================
-- 10) Prescription medicines
-- ==========================
CREATE TABLE IF NOT EXISTS prescription_medicines (
    id SERIAL PRIMARY KEY,
    prescription_id INT NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    rules TEXT,
    days TEXT,
    notes TEXT
);

CREATE INDEX idx_prescription_medicines_prescription_id ON prescription_medicines(prescription_id);

-- ==========================
-- 11) Lab Reports and Settings
-- ==========================
CREATE TABLE IF NOT EXISTS lab_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lab_name_bengali TEXT,
    lab_name_english TEXT,
    lab_address TEXT,
    lab_mobile VARCHAR(20),
    lab_email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_lab_settings_user_id ON lab_settings(user_id);

-- ==========================
-- 12) Payment System
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
    
    -- Recipient info (admin payment numbers)
    recipient_number VARCHAR(20) NOT NULL,
    
    -- Status and admin actions
    status payment_status_enum DEFAULT 'pending',
    admin_id INTEGER REFERENCES users(id),
    admin_note TEXT,
    reviewed_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_transaction_per_request UNIQUE(transaction_id, payment_method)
);

-- Indexes for payment requests
CREATE INDEX IF NOT EXISTS idx_payment_requests_user_id ON payment_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_requests_status ON payment_requests(status);
CREATE INDEX IF NOT EXISTS idx_payment_requests_created_at ON payment_requests(created_at DESC);

-- Payment configuration (stores admin payment numbers)
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

-- Insert default payment configuration (UPDATE THESE WITH YOUR ACTUAL NUMBERS)
INSERT INTO payment_config (payment_method, account_number, account_name, instructions, is_active) VALUES
('bkash', '01522-115653', 'MD.AMDADUL HAQUE', 'Send money to this bKash number. Make sure to note down the Transaction ID (TrxID) from your bKash app.', true),
('nagad', '01522-115653', 'MD.AMDADUL HAQUE', 'Send money to this Nagad number. After successful payment, you will receive a Transaction ID. Please copy it.', true),
('rocket', '01522-115653', 'MD.AMDADUL HAQUE', 'Send money to this Rocket number. Keep your Transaction ID from the confirmation SMS.', true)
ON CONFLICT (payment_method) DO NOTHING;

-- ==========================
-- 13) Add Foreign Key Constraint for Subscriptions
-- ==========================
-- This ensures subscriptions are only created when payment is approved
ALTER TABLE subscriptions 
ADD CONSTRAINT fk_subscriptions_payment_request 
FOREIGN KEY (payment_request_id) 
REFERENCES payment_requests(id) 
ON DELETE SET NULL;

-- ==========================
-- IMPORTANT NOTES
-- ==========================
-- 1. After running this schema, you need to create an admin user manually
-- 2. Admin users require: role='admin' and don't need bmdc_reg
-- 3. Use the hash-password.js script to generate password hash
-- 4. Update payment_config with your actual bKash/Nagad/Rocket numbers
-- 5. Telegram configuration is in .env.local file:
--    TELEGRAM_ENABLED=true/false
--    TELEGRAM_BOT_TOKEN=your_bot_token
--    TELEGRAM_ADMIN_CHAT_ID=your_admin_chat_id

-- ==========================
-- END OF SCHEMA
-- ==========================