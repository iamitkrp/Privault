-- ===================================================================
-- PRIVAULT: DATABASE SCHEMA
-- This file contains the complete database schema for Privault.
-- Copy and paste this entire file into the Supabase SQL editor to
-- set up the database.
-- ===================================================================

-- Enable the uuid-ossp extension if it's not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. TABLES
-- ==========================================

-- 1. profiles
-- Stores user metadata and cryptographic salt.
CREATE TABLE IF NOT EXISTS profiles (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    email           TEXT NOT NULL,
    salt            TEXT NOT NULL,        -- Base64-encoded, for PBKDF2 key derivation
    vault_verification_data TEXT,         -- Encrypted test data to verify master password
    kdf_iterations  INTEGER,             -- Per-user PBKDF2 iteration count (NULL = legacy 100K)
    security_settings JSONB DEFAULT '{
        "autoLockTimeout": 900000,
        "requireOtp": false
    }'::jsonb,
    created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. vault_credentials
-- Each credential stored individually with its own encryption.
CREATE TABLE IF NOT EXISTS vault_credentials (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    credential_id       UUID NOT NULL DEFAULT uuid_generate_v4(),
    
    -- Encrypted data
    encrypted_data      TEXT NOT NULL,    -- AES-256-GCM encrypted JSON
    iv                  TEXT NOT NULL,    -- Base64-encoded initialization vector
    
    -- Plaintext metadata (for queries/filtering)
    category            TEXT DEFAULT 'other',
    tags                TEXT[] DEFAULT '{}',
    is_favorite         BOOLEAN DEFAULT false,
    
    -- Password lifecycle
    expires_at          TIMESTAMPTZ,
    last_password_change TIMESTAMPTZ DEFAULT now(),
    
    -- Access tracking
    access_count        INTEGER DEFAULT 0,
    last_accessed       TIMESTAMPTZ,
    
    -- Versioning
    version             INTEGER DEFAULT 1,
    
    -- Timestamps
    created_at          TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at          TIMESTAMPTZ DEFAULT now() NOT NULL,
    
    CONSTRAINT vault_credentials_user_credential_unique UNIQUE (user_id, credential_id)
);

-- 3. password_history
-- Tracks previous passwords for each credential (encrypted).
CREATE TABLE IF NOT EXISTS password_history (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    credential_id   UUID NOT NULL,
    encrypted_old_password TEXT NOT NULL,  -- AES-256-GCM encrypted old password
    iv              TEXT NOT NULL,         -- IV for the encrypted old password
    password_hash   TEXT NOT NULL,         -- SHA-256 hash for reuse detection
    change_reason   TEXT DEFAULT 'manual', -- manual, expired, security, rotation
    changed_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. vault_otp_verifications
-- OTP codes for email-based two-factor verification.
-- NOTE: otp_code stores a SHA-256 hex digest (64 chars), NOT the plaintext 6-digit code.
CREATE TABLE IF NOT EXISTS vault_otp_verifications (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    otp_code    TEXT NOT NULL,         -- SHA-256 hex digest of the 6-digit OTP code
    purpose     TEXT NOT NULL,         -- vault_access, vault_password_change
    expires_at  TIMESTAMPTZ NOT NULL,  -- 10-minute expiration
    is_used     BOOLEAN DEFAULT false,
    created_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
    
    CONSTRAINT otp_code_format CHECK (length(otp_code) = 64 AND otp_code ~ '^[0-9a-f]{64}$')
);

-- Migration for existing deployments: enforce SHA-256 hex-only otp_code.
-- This block is idempotent and safe to run on both fresh and upgraded databases.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'otp_code_format'
          AND table_name = 'vault_otp_verifications'
    ) THEN
        ALTER TABLE vault_otp_verifications DROP CONSTRAINT otp_code_format;
    END IF;
    ALTER TABLE vault_otp_verifications
        ADD CONSTRAINT otp_code_format CHECK (length(otp_code) = 64 AND otp_code ~ '^[0-9a-f]{64}$');
END
$$;

-- 5. audit_log
-- Security audit trail for all significant actions.
CREATE TABLE IF NOT EXISTS audit_log (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    action      TEXT NOT NULL,         -- credential_created, credential_read, vault_unlocked, etc.
    entity_type TEXT,                  -- credential, vault, profile
    entity_id   UUID,                 -- ID of the affected entity
    metadata    JSONB DEFAULT '{}'::jsonb,  -- Additional context
    ip_address  TEXT,
    user_agent  TEXT,
    created_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 6. security_events
-- Security monitoring events (login attempts, suspicious activity).
CREATE TABLE IF NOT EXISTS security_events (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    event_type      TEXT NOT NULL,     -- login_success, login_failure, vault_locked, session_timeout
    severity        TEXT DEFAULT 'info', -- info, warning, critical
    details         JSONB DEFAULT '{}'::jsonb,
    ip_address      TEXT,
    user_agent      TEXT,
    created_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ==========================================
-- 2. INDEXES
-- ==========================================

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- Vault Credentials
CREATE INDEX IF NOT EXISTS idx_vault_credentials_user_id ON vault_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_vault_credentials_category ON vault_credentials(user_id, category);
CREATE INDEX IF NOT EXISTS idx_vault_credentials_favorite ON vault_credentials(user_id, is_favorite);
CREATE INDEX IF NOT EXISTS idx_vault_credentials_expires ON vault_credentials(user_id, expires_at);

-- Password History
CREATE INDEX IF NOT EXISTS idx_password_history_credential ON password_history(user_id, credential_id);
CREATE INDEX IF NOT EXISTS idx_password_history_changed_at ON password_history(changed_at);

-- OTP
CREATE INDEX IF NOT EXISTS idx_otp_user_id ON vault_otp_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_otp_expires ON vault_otp_verifications(expires_at);

-- Audit Log
CREATE INDEX IF NOT EXISTS idx_audit_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_log(action);

-- Security Events
CREATE INDEX IF NOT EXISTS idx_security_user_id ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_created ON security_events(created_at);

-- ==========================================
-- 3. ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_otp_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own profile" ON profiles
    FOR DELETE USING (auth.uid() = user_id);

-- Vault Credentials Policies
CREATE POLICY "Users can view own credentials" ON vault_credentials
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own credentials" ON vault_credentials
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own credentials" ON vault_credentials
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own credentials" ON vault_credentials
    FOR DELETE USING (auth.uid() = user_id);

-- Password History Policies
CREATE POLICY "Users can view own password history" ON password_history
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own password history" ON password_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own password history" ON password_history
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own password history" ON password_history
    FOR DELETE USING (auth.uid() = user_id);

-- OTP Verifications Policies
CREATE POLICY "Users can view own otps" ON vault_otp_verifications
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own otps" ON vault_otp_verifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own otps" ON vault_otp_verifications
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own otps" ON vault_otp_verifications
    FOR DELETE USING (auth.uid() = user_id);

-- Audit Log Policies
CREATE POLICY "Users can view own audit logs" ON audit_log
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own audit logs" ON audit_log
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own audit logs" ON audit_log
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own audit logs" ON audit_log
    FOR DELETE USING (auth.uid() = user_id);

-- Security Events Policies
CREATE POLICY "Users can view own security events" ON security_events
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own security events" ON security_events
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own security events" ON security_events
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own security events" ON security_events
    FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- 4. TRIGGERS
-- ==========================================

-- Auto-update `updated_at` function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to profiles
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Apply to vault_credentials
DROP TRIGGER IF EXISTS trg_vault_credentials_updated_at ON vault_credentials;
CREATE TRIGGER trg_vault_credentials_updated_at BEFORE UPDATE ON vault_credentials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ==========================================
-- RPC: ATOMIC CREDENTIAL RE-ENCRYPTION
-- ==========================================
-- Used by rotateMasterPassword to update all credential rows atomically.
-- If any single row update fails, the entire transaction rolls back,
-- preventing partial-key corruption of the vault.

CREATE OR REPLACE FUNCTION rotate_vault_credentials(
    p_user_id UUID,
    p_updates JSONB   -- array of {id, encrypted_data, iv}
)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER   -- caller's RLS policies remain enforced
AS $$
DECLARE
    rec JSONB;
    row_count INTEGER;
BEGIN
    FOR rec IN SELECT * FROM jsonb_array_elements(p_updates)
    LOOP
        UPDATE vault_credentials
        SET encrypted_data = rec->>'encrypted_data',
            iv = rec->>'iv'
        WHERE id = (rec->>'id')::UUID
          AND user_id = p_user_id;

        GET DIAGNOSTICS row_count = ROW_COUNT;

        IF row_count = 0 THEN
            RAISE EXCEPTION 'Credential % not found or not owned by user %',
                rec->>'id', p_user_id;
        END IF;
    END LOOP;
END;
$$;

-- ==========================================
-- VERIFICATION
-- ==========================================
-- Run these queries individually to verify setup:
-- 1. Check tables: \dt
-- 2. Check RLS policies: select * from pg_policies;
-- 3. Check triggers: select trigger_name, event_manipulation, action_statement from information_schema.triggers;
-- 4. Check functions: select routine_name from information_schema.routines where routine_schema = 'public';
