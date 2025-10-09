-- Privault Vault V2 Database Schema
-- Complete rebuild with per-item storage, lifecycle management, and comprehensive metadata
-- Run this script in your Supabase SQL Editor

-- ==========================================
-- ENABLE EXTENSIONS
-- ==========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search

-- ==========================================
-- TABLE: vault_credentials
-- Main table for storing individual encrypted credentials
-- ==========================================
CREATE TABLE IF NOT EXISTS vault_credentials (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    credential_id UUID NOT NULL DEFAULT uuid_generate_v4(), -- Business identifier
    
    -- Encrypted data
    encrypted_data TEXT NOT NULL, -- AES-256-GCM encrypted JSON
    iv TEXT NOT NULL, -- Initialization vector for encryption
    
    -- Metadata (stored in plaintext for queries and filtering)
    category TEXT NOT NULL CHECK (category IN (
        'social', 'work', 'shopping', 'entertainment', 
        'utilities', 'development', 'personal', 'other'
    )),
    tags TEXT[] DEFAULT '{}', -- Array of tags for flexible organization
    is_favorite BOOLEAN DEFAULT FALSE NOT NULL,
    
    -- Lifecycle tracking
    expires_at TIMESTAMP WITH TIME ZONE, -- When password expires
    expiration_status TEXT NOT NULL DEFAULT 'active' CHECK (expiration_status IN (
        'active', 'expiring_soon', 'expired'
    )),
    last_password_change TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Access tracking
    access_count INTEGER DEFAULT 0 NOT NULL,
    last_accessed TIMESTAMP WITH TIME ZONE,
    
    -- Versioning for optimistic locking
    version INTEGER DEFAULT 1 NOT NULL,
    
    -- Soft delete support
    deleted_at TIMESTAMP WITH TIME ZONE,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Constraints
    CONSTRAINT vault_credentials_user_credential_unique UNIQUE (user_id, credential_id),
    CONSTRAINT vault_credentials_encrypted_data_check CHECK (length(encrypted_data) > 0),
    CONSTRAINT vault_credentials_iv_check CHECK (length(iv) > 0),
    CONSTRAINT vault_credentials_access_count_check CHECK (access_count >= 0),
    CONSTRAINT vault_credentials_version_check CHECK (version >= 1)
);

-- Add comment to table
COMMENT ON TABLE vault_credentials IS 'Stores individual encrypted credentials with full metadata and lifecycle tracking';
COMMENT ON COLUMN vault_credentials.encrypted_data IS 'Contains encrypted JSON with site, username, password, url, notes, custom_fields';
COMMENT ON COLUMN vault_credentials.expiration_status IS 'Calculated based on expires_at: active (>7 days), expiring_soon (<=7 days), expired (past)';
COMMENT ON COLUMN vault_credentials.version IS 'Optimistic locking version - incremented on each update';

-- ==========================================
-- TABLE: password_history
-- Tracks password changes for audit and reuse detection
-- ==========================================
CREATE TABLE IF NOT EXISTS password_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    credential_id UUID NOT NULL,
    
    -- Password tracking
    encrypted_old_password TEXT NOT NULL, -- Encrypted old password for potential recovery
    password_hash TEXT NOT NULL, -- SHA-256 hash for reuse detection (without encryption key)
    
    -- Change metadata
    change_reason TEXT NOT NULL CHECK (change_reason IN (
        'manual_update', 'expiration_rotation', 'security_breach', 
        'weak_password', 'scheduled_rotation', 'user_request'
    )),
    changed_by TEXT, -- 'user' or 'system' or specific action
    
    -- Timestamps
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Constraints
    CONSTRAINT password_history_hash_check CHECK (length(password_hash) = 64), -- SHA-256 hex length
    CONSTRAINT password_history_credential_fk FOREIGN KEY (user_id, credential_id) 
        REFERENCES vault_credentials(user_id, credential_id) ON DELETE CASCADE
);

COMMENT ON TABLE password_history IS 'Maintains history of password changes for audit trail and reuse detection';
COMMENT ON COLUMN password_history.password_hash IS 'SHA-256 hash of password for detecting reuse without storing plaintext';
COMMENT ON COLUMN password_history.encrypted_old_password IS 'Encrypted old password for potential recovery scenarios';

-- ==========================================
-- TABLE: expiration_events
-- Logs expiration-related events for notifications and audit
-- ==========================================
CREATE TABLE IF NOT EXISTS expiration_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    credential_id UUID NOT NULL,
    
    -- Event details
    event_type TEXT NOT NULL CHECK (event_type IN (
        'expiration_warning_7d', 'expiration_warning_3d', 'expiration_warning_1d',
        'expired', 'rotated', 'expiration_set', 'expiration_extended'
    )),
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Notification tracking
    notification_sent BOOLEAN DEFAULT FALSE NOT NULL,
    notification_sent_at TIMESTAMP WITH TIME ZONE,
    
    -- User interaction
    acknowledged BOOLEAN DEFAULT FALSE NOT NULL,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    
    -- Additional context
    metadata JSONB DEFAULT '{}',
    
    -- Constraints
    CONSTRAINT expiration_events_credential_fk FOREIGN KEY (user_id, credential_id)
        REFERENCES vault_credentials(user_id, credential_id) ON DELETE CASCADE
);

COMMENT ON TABLE expiration_events IS 'Audit log for password expiration events and notifications';

-- ==========================================
-- TABLE: vault_tags
-- Master list of tags used across credentials
-- ==========================================
CREATE TABLE IF NOT EXISTS vault_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    tag_name TEXT NOT NULL,
    color TEXT, -- Hex color for UI display
    usage_count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Constraints
    CONSTRAINT vault_tags_user_tag_unique UNIQUE (user_id, tag_name),
    CONSTRAINT vault_tags_name_check CHECK (length(tag_name) >= 1 AND length(tag_name) <= 50),
    CONSTRAINT vault_tags_usage_count_check CHECK (usage_count >= 0)
);

COMMENT ON TABLE vault_tags IS 'Master list of tags with usage statistics';

-- ==========================================
-- TABLE: credential_tags (Junction table)
-- Many-to-many relationship between credentials and tags
-- ==========================================
CREATE TABLE IF NOT EXISTS credential_tags (
    credential_id UUID NOT NULL,
    tag_id UUID REFERENCES vault_tags(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    PRIMARY KEY (credential_id, tag_id),
    
    -- Foreign key to vault_credentials (composite key)
    CONSTRAINT credential_tags_credential_fk FOREIGN KEY (user_id, credential_id)
        REFERENCES vault_credentials(user_id, credential_id) ON DELETE CASCADE
);

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================

-- vault_credentials indexes
CREATE INDEX IF NOT EXISTS idx_vault_credentials_user_id ON vault_credentials(user_id) 
    WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_vault_credentials_credential_id ON vault_credentials(credential_id);
CREATE INDEX IF NOT EXISTS idx_vault_credentials_category ON vault_credentials(category) 
    WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_vault_credentials_is_favorite ON vault_credentials(is_favorite) 
    WHERE is_favorite = TRUE AND is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_vault_credentials_expiration_status ON vault_credentials(expiration_status) 
    WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_vault_credentials_expires_at ON vault_credentials(expires_at) 
    WHERE expires_at IS NOT NULL AND is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_vault_credentials_tags ON vault_credentials USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_vault_credentials_created_at ON vault_credentials(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vault_credentials_updated_at ON vault_credentials(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_vault_credentials_last_accessed ON vault_credentials(last_accessed DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_vault_credentials_deleted ON vault_credentials(is_deleted, deleted_at);

-- password_history indexes
CREATE INDEX IF NOT EXISTS idx_password_history_user_id ON password_history(user_id);
CREATE INDEX IF NOT EXISTS idx_password_history_credential_id ON password_history(credential_id);
CREATE INDEX IF NOT EXISTS idx_password_history_changed_at ON password_history(changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_password_history_password_hash ON password_history(password_hash);
CREATE INDEX IF NOT EXISTS idx_password_history_user_credential ON password_history(user_id, credential_id);

-- expiration_events indexes
CREATE INDEX IF NOT EXISTS idx_expiration_events_user_id ON expiration_events(user_id);
CREATE INDEX IF NOT EXISTS idx_expiration_events_credential_id ON expiration_events(credential_id);
CREATE INDEX IF NOT EXISTS idx_expiration_events_event_type ON expiration_events(event_type);
CREATE INDEX IF NOT EXISTS idx_expiration_events_triggered_at ON expiration_events(triggered_at DESC);
CREATE INDEX IF NOT EXISTS idx_expiration_events_acknowledged ON expiration_events(acknowledged) 
    WHERE acknowledged = FALSE;
CREATE INDEX IF NOT EXISTS idx_expiration_events_notification_sent ON expiration_events(notification_sent) 
    WHERE notification_sent = FALSE;

-- vault_tags indexes
CREATE INDEX IF NOT EXISTS idx_vault_tags_user_id ON vault_tags(user_id);
CREATE INDEX IF NOT EXISTS idx_vault_tags_usage_count ON vault_tags(usage_count DESC);

-- credential_tags indexes
CREATE INDEX IF NOT EXISTS idx_credential_tags_credential_id ON credential_tags(credential_id);
CREATE INDEX IF NOT EXISTS idx_credential_tags_tag_id ON credential_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_credential_tags_user_id ON credential_tags(user_id);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) SETUP
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE vault_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE expiration_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE credential_tags ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- RLS POLICIES: vault_credentials
-- ==========================================
CREATE POLICY "Users can view own credentials" ON vault_credentials 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own credentials" ON vault_credentials 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own credentials" ON vault_credentials 
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own credentials" ON vault_credentials 
    FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- RLS POLICIES: password_history
-- ==========================================
CREATE POLICY "Users can view own password history" ON password_history 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own password history" ON password_history 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own password history" ON password_history 
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own password history" ON password_history 
    FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- RLS POLICIES: expiration_events
-- ==========================================
CREATE POLICY "Users can view own expiration events" ON expiration_events 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expiration events" ON expiration_events 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expiration events" ON expiration_events 
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own expiration events" ON expiration_events 
    FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- RLS POLICIES: vault_tags
-- ==========================================
CREATE POLICY "Users can view own tags" ON vault_tags 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tags" ON vault_tags 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tags" ON vault_tags 
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tags" ON vault_tags 
    FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- RLS POLICIES: credential_tags
-- ==========================================
CREATE POLICY "Users can view own credential tags" ON credential_tags 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own credential tags" ON credential_tags 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own credential tags" ON credential_tags 
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own credential tags" ON credential_tags 
    FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- FUNCTIONS
-- ==========================================

-- Function to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION update_vault_credentials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update expiration status based on expires_at
CREATE OR REPLACE FUNCTION update_expiration_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.expires_at IS NULL THEN
        NEW.expiration_status := 'active';
    ELSIF NEW.expires_at < timezone('utc'::text, now()) THEN
        NEW.expiration_status := 'expired';
    ELSIF NEW.expires_at < timezone('utc'::text, now()) + interval '7 days' THEN
        NEW.expiration_status := 'expiring_soon';
    ELSE
        NEW.expiration_status := 'active';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to increment tag usage count
CREATE OR REPLACE FUNCTION increment_tag_usage()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE vault_tags 
    SET usage_count = usage_count + 1 
    WHERE id = NEW.tag_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement tag usage count
CREATE OR REPLACE FUNCTION decrement_tag_usage()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE vault_tags 
    SET usage_count = GREATEST(usage_count - 1, 0)
    WHERE id = OLD.tag_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Function to get credentials expiring soon
CREATE OR REPLACE FUNCTION get_expiring_credentials(user_uuid UUID, days_ahead INTEGER DEFAULT 7)
RETURNS TABLE (
    credential_id UUID,
    expires_at TIMESTAMP WITH TIME ZONE,
    days_until_expiration INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        vc.credential_id,
        vc.expires_at,
        EXTRACT(DAY FROM (vc.expires_at - timezone('utc'::text, now())))::INTEGER as days_until_expiration
    FROM vault_credentials vc
    WHERE vc.user_id = user_uuid
        AND vc.is_deleted = FALSE
        AND vc.expires_at IS NOT NULL
        AND vc.expires_at > timezone('utc'::text, now())
        AND vc.expires_at <= timezone('utc'::text, now()) + (days_ahead || ' days')::interval
    ORDER BY vc.expires_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate vault statistics
CREATE OR REPLACE FUNCTION get_vault_statistics(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
    stats JSON;
BEGIN
    SELECT json_build_object(
        'total_credentials', COUNT(*),
        'active_credentials', COUNT(*) FILTER (WHERE expiration_status = 'active'),
        'expiring_soon', COUNT(*) FILTER (WHERE expiration_status = 'expiring_soon'),
        'expired', COUNT(*) FILTER (WHERE expiration_status = 'expired'),
        'favorites', COUNT(*) FILTER (WHERE is_favorite = TRUE),
        'by_category', (
            SELECT json_object_agg(category, count)
            FROM (
                SELECT category, COUNT(*) as count
                FROM vault_credentials
                WHERE user_id = user_uuid AND is_deleted = FALSE
                GROUP BY category
            ) category_counts
        ),
        'total_access_count', COALESCE(SUM(access_count), 0),
        'most_accessed', (
            SELECT json_build_object(
                'credential_id', credential_id,
                'access_count', access_count
            )
            FROM vault_credentials
            WHERE user_id = user_uuid AND is_deleted = FALSE
            ORDER BY access_count DESC
            LIMIT 1
        )
    ) INTO stats
    FROM vault_credentials
    WHERE user_id = user_uuid AND is_deleted = FALSE;
    
    RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- TRIGGERS
-- ==========================================

-- Trigger to automatically update updated_at
CREATE TRIGGER update_vault_credentials_updated_at_trigger
    BEFORE UPDATE ON vault_credentials
    FOR EACH ROW
    EXECUTE FUNCTION update_vault_credentials_updated_at();

-- Trigger to automatically update expiration_status
CREATE TRIGGER update_expiration_status_trigger
    BEFORE INSERT OR UPDATE OF expires_at ON vault_credentials
    FOR EACH ROW
    EXECUTE FUNCTION update_expiration_status();

-- Trigger to increment tag usage count
CREATE TRIGGER increment_tag_usage_trigger
    AFTER INSERT ON credential_tags
    FOR EACH ROW
    EXECUTE FUNCTION increment_tag_usage();

-- Trigger to decrement tag usage count
CREATE TRIGGER decrement_tag_usage_trigger
    AFTER DELETE ON credential_tags
    FOR EACH ROW
    EXECUTE FUNCTION decrement_tag_usage();

-- ==========================================
-- GRANT PERMISSIONS
-- ==========================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- Grant permissions on tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT SELECT, INSERT, UPDATE, DELETE ON vault_credentials TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON password_history TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON expiration_events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON vault_tags TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON credential_tags TO authenticated;

-- Grant permissions on sequences
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION get_expiring_credentials(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_vault_statistics(UUID) TO authenticated;

-- ==========================================
-- VERIFICATION QUERIES
-- ==========================================

-- Verify RLS is enabled
-- SELECT schemaname, tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE tablename IN ('vault_credentials', 'password_history', 'expiration_events', 'vault_tags', 'credential_tags');

-- Verify policies exist
-- SELECT schemaname, tablename, policyname 
-- FROM pg_policies 
-- WHERE tablename IN ('vault_credentials', 'password_history', 'expiration_events', 'vault_tags', 'credential_tags');

-- Verify indexes
-- SELECT tablename, indexname 
-- FROM pg_indexes 
-- WHERE schemaname = 'public' 
-- AND tablename LIKE 'vault_%' OR tablename LIKE '%_history' OR tablename LIKE '%_events' OR tablename LIKE '%_tags';

-- ==========================================
-- SAMPLE DATA FOR TESTING (Optional)
-- ==========================================

-- Uncomment to insert sample data for testing
/*
-- Sample credential (replace user_id with actual auth.uid())
INSERT INTO vault_credentials (
    user_id, 
    credential_id,
    encrypted_data, 
    iv, 
    category,
    tags,
    expires_at
) VALUES (
    'your-user-uuid-here',
    uuid_generate_v4(),
    'encrypted_sample_data',
    'sample_iv',
    'work',
    ARRAY['important', 'work'],
    timezone('utc'::text, now()) + interval '90 days'
);
*/

-- Success message
SELECT 'Privault Vault V2 schema created successfully! 🚀' as message,
       'Total tables created: 5' as tables,
       'Total indexes created: 24+' as indexes,
       'RLS policies: Enabled on all tables' as security,
       'Functions: 5 helper functions' as functions;

