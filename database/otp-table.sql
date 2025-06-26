-- Add OTP verification table to existing Privault database
-- Run this if the vault_otp_verifications table doesn't exist yet

-- ==========================================
-- TABLE: vault_otp_verifications
-- Stores OTP codes for vault security verification
-- ==========================================
CREATE TABLE IF NOT EXISTS vault_otp_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    otp_code TEXT NOT NULL, -- 6-digit OTP code
    purpose TEXT NOT NULL CHECK (purpose IN ('vault_access', 'vault_password_change')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_used BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Constraints
    CONSTRAINT otp_code_check CHECK (otp_code ~ '^[0-9]{6}$'), -- Ensure 6-digit numeric code
    CONSTRAINT otp_expires_future CHECK (expires_at > created_at) -- Expiry must be in future
);

-- ==========================================
-- INDEXES for Performance
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_vault_otp_user_id ON vault_otp_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_vault_otp_code ON vault_otp_verifications(otp_code);
CREATE INDEX IF NOT EXISTS idx_vault_otp_expires_at ON vault_otp_verifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_vault_otp_purpose ON vault_otp_verifications(purpose);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) SETUP
-- ==========================================

-- Enable RLS on OTP table
ALTER TABLE vault_otp_verifications ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- RLS POLICIES: vault_otp_verifications table
-- ==========================================
-- Users can only access their own OTP verifications
CREATE POLICY "Users can view own otp verifications" ON vault_otp_verifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own otp verifications" ON vault_otp_verifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own otp verifications" ON vault_otp_verifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own otp verifications" ON vault_otp_verifications FOR DELETE USING (auth.uid() = user_id);

-- Success message
SELECT 'OTP verification table created successfully! 📧🔒' as message; 