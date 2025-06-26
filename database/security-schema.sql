-- Security Enhancement Schema for Phase 8
-- Add these tables to your existing Supabase database

-- ==========================================
-- TABLE: security_events
-- Stores comprehensive security event logs
-- ==========================================
CREATE TABLE IF NOT EXISTS security_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    event_type TEXT NOT NULL,
    event_data JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'low',
    source TEXT DEFAULT 'client',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Constraints
    CONSTRAINT security_events_event_type_check CHECK (event_type IN (
        'login', 'logout', 'unlock', 'lock', 'master_password_change', 'failed_unlock_attempt'
    ))
);

-- ==========================================
-- TABLE: security_alerts
-- Stores security alerts and notifications
-- ==========================================
CREATE TABLE IF NOT EXISTS security_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    alert_type TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'low',
    is_resolved BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES auth.users(id),
    
    -- Constraints
    CONSTRAINT security_alerts_resolved_check CHECK (
        (is_resolved = false AND resolved_at IS NULL) OR 
        (is_resolved = true AND resolved_at IS NOT NULL)
    )
);

-- ==========================================
-- TABLE: session_activities
-- Tracks user session activities and device info
-- ==========================================
CREATE TABLE IF NOT EXISTS session_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    session_id TEXT NOT NULL,
    activity_type TEXT NOT NULL,
    activity_data JSONB DEFAULT '{}'::jsonb,
    device_info JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Index for efficient querying
    CONSTRAINT session_activities_session_id_check CHECK (length(session_id) > 0)
);

-- ==========================================
-- TABLE: failed_attempts
-- Tracks failed authentication attempts
-- ==========================================
CREATE TABLE IF NOT EXISTS failed_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT, -- For tracking attempts even when user_id is unknown
    attempt_type TEXT CHECK (attempt_type IN ('login', 'vault_unlock', 'password_change')) NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    attempt_data JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- At least one of user_id or email must be present
    CONSTRAINT failed_attempts_identification_check CHECK (
        user_id IS NOT NULL OR email IS NOT NULL
    )
);

-- ==========================================
-- TABLE: user_sessions
-- Enhanced session management with device tracking
-- ==========================================
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    session_id TEXT UNIQUE NOT NULL,
    device_fingerprint TEXT,
    device_name TEXT,
    device_info JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    user_agent TEXT,
    location_info JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    auto_lock_timeout INTEGER DEFAULT 900000, -- 15 minutes in milliseconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    terminated_at TIMESTAMP WITH TIME ZONE,
    termination_reason TEXT,
    
    -- Constraints
    CONSTRAINT user_sessions_session_id_check CHECK (length(session_id) > 0),
    CONSTRAINT user_sessions_timeout_check CHECK (auto_lock_timeout > 0)
);

-- ==========================================
-- TABLE: security_settings_history
-- Track changes to security settings
-- ==========================================
CREATE TABLE IF NOT EXISTS security_settings_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    setting_name TEXT NOT NULL,
    old_value JSONB,
    new_value JSONB,
    changed_by UUID REFERENCES auth.users(id),
    change_reason TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- INDEXES for Performance
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_timestamp ON security_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);

CREATE INDEX IF NOT EXISTS idx_security_alerts_user_id ON security_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_security_alerts_is_resolved ON security_alerts(is_resolved);
CREATE INDEX IF NOT EXISTS idx_security_alerts_severity ON security_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_security_alerts_created_at ON security_alerts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_session_activities_user_id ON session_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_session_activities_session_id ON session_activities(session_id);
CREATE INDEX IF NOT EXISTS idx_session_activities_timestamp ON session_activities(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_failed_attempts_user_id ON failed_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_failed_attempts_email ON failed_attempts(email);
CREATE INDEX IF NOT EXISTS idx_failed_attempts_timestamp ON failed_attempts(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_failed_attempts_ip_address ON failed_attempts(ip_address);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_activity ON user_sessions(last_activity DESC);

CREATE INDEX IF NOT EXISTS idx_security_settings_history_user_id ON security_settings_history(user_id);
CREATE INDEX IF NOT EXISTS idx_security_settings_history_setting_name ON security_settings_history(setting_name);
CREATE INDEX IF NOT EXISTS idx_security_settings_history_created_at ON security_settings_history(created_at DESC);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) SETUP
-- ==========================================

-- Enable RLS on all new tables
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE failed_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_settings_history ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- RLS POLICIES: security_events table
-- ==========================================
CREATE POLICY "Users can view own security events" ON security_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own security events" ON security_events FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- RLS POLICIES: security_alerts table
-- ==========================================
CREATE POLICY "Users can view own security alerts" ON security_alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own security alerts" ON security_alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own security alerts" ON security_alerts FOR UPDATE USING (auth.uid() = user_id);

-- ==========================================
-- RLS POLICIES: session_activities table
-- ==========================================
CREATE POLICY "Users can view own session activities" ON session_activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own session activities" ON session_activities FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- RLS POLICIES: failed_attempts table
-- ==========================================
CREATE POLICY "Users can view own failed attempts" ON failed_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service can insert failed attempts" ON failed_attempts FOR INSERT WITH CHECK (true); -- Allow service to log attempts

-- ==========================================
-- RLS POLICIES: user_sessions table
-- ==========================================
CREATE POLICY "Users can view own sessions" ON user_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON user_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON user_sessions FOR UPDATE USING (auth.uid() = user_id);

-- ==========================================
-- RLS POLICIES: security_settings_history table
-- ==========================================
CREATE POLICY "Users can view own settings history" ON security_settings_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings history" ON security_settings_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- FUNCTIONS AND TRIGGERS
-- ==========================================

-- Function to automatically clean up old security events (keep last 6 months)
CREATE OR REPLACE FUNCTION cleanup_old_security_events()
RETURNS void AS $$
BEGIN
    DELETE FROM security_events 
    WHERE timestamp < (timezone('utc'::text, now()) - INTERVAL '6 months');
    
    DELETE FROM session_activities 
    WHERE timestamp < (timezone('utc'::text, now()) - INTERVAL '3 months');
    
    DELETE FROM failed_attempts 
    WHERE timestamp < (timezone('utc'::text, now()) - INTERVAL '1 month');
    
    -- Clean up resolved security alerts older than 1 year
    DELETE FROM security_alerts 
    WHERE is_resolved = true 
    AND resolved_at < (timezone('utc'::text, now()) - INTERVAL '1 year');
END;
$$ LANGUAGE plpgsql;

-- Function to automatically expire inactive sessions
CREATE OR REPLACE FUNCTION expire_inactive_sessions()
RETURNS void AS $$
BEGIN
    UPDATE user_sessions 
    SET is_active = false,
        terminated_at = timezone('utc'::text, now()),
        termination_reason = 'auto_expired_inactivity'
    WHERE is_active = true 
    AND last_activity < (timezone('utc'::text, now()) - INTERVAL '24 hours');
END;
$$ LANGUAGE plpgsql;

-- Function to trigger security alerts for suspicious activity
CREATE OR REPLACE FUNCTION check_suspicious_activity()
RETURNS TRIGGER AS $$
DECLARE
    recent_events_count INTEGER;
    recent_failures_count INTEGER;
BEGIN
    -- Check for rapid events (potential bot activity)
    SELECT COUNT(*) INTO recent_events_count
    FROM security_events 
    WHERE user_id = NEW.user_id 
    AND timestamp > (timezone('utc'::text, now()) - INTERVAL '5 minutes');
    
    -- Check for multiple failures
    SELECT COUNT(*) INTO recent_failures_count
    FROM security_events 
    WHERE user_id = NEW.user_id 
    AND event_type = 'failed_unlock_attempt'
    AND timestamp > (timezone('utc'::text, now()) - INTERVAL '15 minutes');
    
    -- Trigger alert if suspicious activity detected
    IF recent_events_count > 10 THEN
        INSERT INTO security_alerts (user_id, alert_type, description, severity)
        VALUES (NEW.user_id, 'rapid_activity', 
                'Rapid security events detected: ' || recent_events_count || ' events in 5 minutes', 
                'medium');
    END IF;
    
    IF recent_failures_count >= 5 THEN
        INSERT INTO security_alerts (user_id, alert_type, description, severity)
        VALUES (NEW.user_id, 'multiple_failures', 
                'Multiple failed attempts detected: ' || recent_failures_count || ' failures in 15 minutes', 
                'high');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to check for suspicious activity on security events
CREATE TRIGGER trigger_check_suspicious_activity
    AFTER INSERT ON security_events
    FOR EACH ROW
    EXECUTE FUNCTION check_suspicious_activity();

-- ==========================================
-- GRANT PERMISSIONS
-- ==========================================

-- Grant permissions on new tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT SELECT, INSERT, UPDATE ON security_events TO authenticated;
GRANT SELECT, INSERT, UPDATE ON security_alerts TO authenticated;
GRANT SELECT, INSERT ON session_activities TO authenticated;
GRANT SELECT, INSERT ON failed_attempts TO authenticated;
GRANT SELECT, INSERT, UPDATE ON user_sessions TO authenticated;
GRANT SELECT, INSERT ON security_settings_history TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION cleanup_old_security_events() TO postgres;
GRANT EXECUTE ON FUNCTION expire_inactive_sessions() TO postgres;

-- ==========================================
-- INITIAL DATA SETUP
-- ==========================================

-- Create default security alert types (for reference)
-- You can customize these based on your needs
INSERT INTO security_alerts (user_id, alert_type, description, severity, is_resolved, created_at)
SELECT 
    '00000000-0000-0000-0000-000000000000'::uuid, -- Placeholder user_id (will be ignored due to RLS)
    'system_maintenance',
    'Security monitoring system initialized',
    'low',
    true,
    timezone('utc'::text, now())
WHERE NOT EXISTS (SELECT 1 FROM security_alerts WHERE alert_type = 'system_maintenance');

-- ==========================================
-- VERIFICATION QUERIES
-- Test these after running the schema
-- ==========================================

-- Verify all security tables exist
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%security%' OR table_name LIKE '%session%' OR table_name LIKE '%failed%';

-- Verify RLS is enabled
-- SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE tablename IN ('security_events', 'security_alerts', 'session_activities', 'failed_attempts', 'user_sessions', 'security_settings_history');

-- Verify policies exist
-- SELECT schemaname, tablename, policyname FROM pg_policies WHERE tablename IN ('security_events', 'security_alerts', 'session_activities', 'failed_attempts', 'user_sessions', 'security_settings_history'); 