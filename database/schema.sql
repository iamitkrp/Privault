-- Privault Database Schema
-- Run this script in your Supabase SQL Editor

-- Enable Row Level Security extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- TABLE: profiles
-- Stores user metadata and cryptographic salt
-- ==========================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    email TEXT NOT NULL,
    salt TEXT NOT NULL, -- Base64 encoded salt for PBKDF2 key derivation
    security_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Constraints
    CONSTRAINT profiles_user_id_unique UNIQUE (user_id),
    CONSTRAINT profiles_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT profiles_salt_check CHECK (length(salt) >= 40) -- Ensure salt is long enough
);

-- ==========================================
-- TABLE: vaults
-- Stores encrypted vault data as single blob per user
-- ==========================================
CREATE TABLE IF NOT EXISTS vaults (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    encrypted_data TEXT NOT NULL, -- AES-256-GCM encrypted JSON blob of all credentials
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Constraints
    CONSTRAINT vaults_user_id_unique UNIQUE (user_id),
    CONSTRAINT vaults_encrypted_data_check CHECK (length(encrypted_data) > 0)
);

-- ==========================================
-- TABLE: vault_items (Alternative approach)
-- Stores individual encrypted credentials
-- ==========================================
CREATE TABLE IF NOT EXISTS vault_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    credential_id UUID NOT NULL, -- UUID identifier for the credential
    encrypted_credential TEXT NOT NULL, -- AES-256-GCM encrypted credential JSON
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Constraints
    CONSTRAINT vault_items_user_credential_unique UNIQUE (user_id, credential_id),
    CONSTRAINT vault_items_encrypted_credential_check CHECK (length(encrypted_credential) > 0)
);

-- ==========================================
-- TABLE: password_history
-- Stores encrypted password change history
-- ==========================================
CREATE TABLE IF NOT EXISTS password_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    credential_id UUID NOT NULL, -- References the credential this history belongs to
    old_password_hash TEXT NOT NULL, -- SHA-256 hash of old password for comparison
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Constraints
    CONSTRAINT password_history_hash_check CHECK (length(old_password_hash) = 64) -- SHA-256 hex length
);

-- ==========================================
-- TABLE: vault_otp_verifications
-- Stores OTP codes for vault security verification
-- ==========================================
CREATE TABLE IF NOT EXISTS vault_otp_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    otp_code TEXT NOT NULL, -- 6-digit OTP code
    purpose TEXT NOT NULL CHECK (purpose IN ('vault_access', 'vault_password_change', 'email_update', 'profile_delete')),
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
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_vaults_user_id ON vaults(user_id);
CREATE INDEX IF NOT EXISTS idx_vault_items_user_id ON vault_items(user_id);
CREATE INDEX IF NOT EXISTS idx_vault_items_credential_id ON vault_items(credential_id);
CREATE INDEX IF NOT EXISTS idx_password_history_user_id ON password_history(user_id);
CREATE INDEX IF NOT EXISTS idx_password_history_credential_id ON password_history(credential_id);
CREATE INDEX IF NOT EXISTS idx_password_history_changed_at ON password_history(changed_at);
CREATE INDEX IF NOT EXISTS idx_vault_otp_user_id ON vault_otp_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_vault_otp_code ON vault_otp_verifications(otp_code);
CREATE INDEX IF NOT EXISTS idx_vault_otp_expires_at ON vault_otp_verifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_vault_otp_purpose ON vault_otp_verifications(purpose);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) SETUP
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_otp_verifications ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- RLS POLICIES: profiles table
-- ==========================================
-- Users can only access their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own profile" ON profiles FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- RLS POLICIES: vaults table  
-- ==========================================
-- Users can only access their own vault
CREATE POLICY "Users can view own vault" ON vaults FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own vault" ON vaults FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own vault" ON vaults FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own vault" ON vaults FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- RLS POLICIES: vault_items table
-- ==========================================
-- Users can only access their own vault items
CREATE POLICY "Users can view own vault items" ON vault_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own vault items" ON vault_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own vault items" ON vault_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own vault items" ON vault_items FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- RLS POLICIES: password_history table
-- ==========================================
-- Users can only access their own password history
CREATE POLICY "Users can view own password history" ON password_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own password history" ON password_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own password history" ON password_history FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own password history" ON password_history FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- RLS POLICIES: vault_otp_verifications table
-- ==========================================
-- Users can only access their own OTP verifications
CREATE POLICY "Users can view own otp verifications" ON vault_otp_verifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own otp verifications" ON vault_otp_verifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own otp verifications" ON vault_otp_verifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own otp verifications" ON vault_otp_verifications FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- FUNCTIONS AND TRIGGERS
-- ==========================================

-- Function to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vaults_updated_at 
    BEFORE UPDATE ON vaults 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vault_items_updated_at 
    BEFORE UPDATE ON vault_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- SECURITY VERIFICATION QUERIES
-- Test these after running the schema
-- ==========================================

-- Verify RLS is enabled (should return true for all tables)
-- SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE tablename IN ('profiles', 'vaults', 'vault_items', 'password_history');

-- Verify policies exist (should return multiple rows)
-- SELECT schemaname, tablename, policyname FROM pg_policies WHERE tablename IN ('profiles', 'vaults', 'vault_items', 'password_history');

-- ==========================================
-- GRANT PERMISSIONS
-- ==========================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- Grant permissions on tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Grant permissions on sequences
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Success message
SELECT 'Privault database schema created successfully! 🎉' as message; 