-- ==========================
-- 1) Users table
-- ==========================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    bmdc_reg VARCHAR(50) UNIQUE NOT NULL,
    specialty VARCHAR(100),
    email_verified BOOLEAN DEFAULT FALSE,
    password_reset_code VARCHAR(6),
    reset_code_expires TIMESTAMP,
    role VARCHAR(20) DEFAULT 'doctor' CHECK (role IN ('doctor', 'assistant')),
    doctor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
    stripe_subscription_id VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
INSERT INTO plans (name, description, price_monthly, price_yearly, features, is_active) VALUES
('Free', 'For students and new practitioners getting started', 0, 0, '["Up to 5 prescriptions per month", "Basic medicine database access", "Patient management (up to 10 patients)", "PDF download", "Community support"]', true),
('Starter', 'For individual practitioners with basic needs', 5, 60, '["Up to 30 prescriptions per month", "Basic medicine database access", "Patient management", "PDF download", "Email support"]', true),
('Professional', 'For established practices with higher volume', 10, 115, '["Unlimited prescriptions", "Full medicine database access", "Advanced patient management", "Custom prescription templates", "Priority support"]', true)
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