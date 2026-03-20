-- Create note_attachments table for E2EE Universal Files
CREATE TABLE IF NOT EXISTS note_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    
    -- Encrypted metadata allows quick listing without pulling heavy binaries
    encrypted_metadata TEXT NOT NULL, -- JSON { name, size, type }
    metadata_iv TEXT NOT NULL,
    
    -- Encrypted file payload
    encrypted_data TEXT NOT NULL,
    data_iv TEXT NOT NULL,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_note_attachments_note_id ON note_attachments(note_id);
CREATE INDEX IF NOT EXISTS idx_note_attachments_user_id ON note_attachments(user_id);

-- RLS Policies
ALTER TABLE note_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own note attachments." ON note_attachments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own note attachments." ON note_attachments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own note attachments." ON note_attachments
    FOR DELETE USING (auth.uid() = user_id);
