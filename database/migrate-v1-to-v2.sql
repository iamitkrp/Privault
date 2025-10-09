-- Privault Vault Migration: V1 (Single-Blob) to V2 (Per-Item)
-- This script safely migrates data from the vaults table (blob storage) 
-- to vault_credentials table (per-item storage)
--
-- IMPORTANT: This migration preserves encrypted data as-is.
-- Client-side re-encryption will happen on first access.
--
-- Usage:
--   psql -d privault_db -f database/migrate-v1-to-v2.sql
--
-- Rollback:
--   See MIGRATION_GUIDE.md for rollback procedures

-- ==========================================
-- PRE-MIGRATION VALIDATION
-- ==========================================

DO $$ 
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Privault V1 to V2 Migration Started';
    RAISE NOTICE 'Timestamp: %', now();
    RAISE NOTICE '========================================';
    
    -- Check if V2 schema exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vault_credentials') THEN
        RAISE EXCEPTION 'V2 schema not found. Please run vault-schema-v2.sql first.';
    END IF;
    
    -- Check if V1 data exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vaults') THEN
        RAISE EXCEPTION 'V1 vaults table not found. Nothing to migrate.';
    END IF;
    
    RAISE NOTICE 'Pre-migration validation passed ✓';
END $$;

-- ==========================================
-- CREATE MIGRATION TRACKING TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS vault_migration_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    old_vault_id UUID,
    migration_status TEXT NOT NULL CHECK (migration_status IN ('pending', 'in_progress', 'completed', 'failed')),
    credentials_migrated INTEGER DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    completed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'
);

COMMENT ON TABLE vault_migration_log IS 'Tracks migration progress for each user vault';

-- ==========================================
-- MIGRATION CONFIGURATION
-- ==========================================

-- Set to true for dry-run mode (no actual data changes)
DO $$ 
DECLARE
    dry_run BOOLEAN := false;  -- Set to true for testing
    total_vaults INTEGER;
    migrated_count INTEGER := 0;
    failed_count INTEGER := 0;
    vault_record RECORD;
    migration_log_id UUID;
BEGIN
    -- Count total vaults to migrate
    SELECT COUNT(*) INTO total_vaults FROM vaults;
    
    RAISE NOTICE 'Found % vaults to migrate', total_vaults;
    
    IF total_vaults = 0 THEN
        RAISE NOTICE 'No vaults to migrate. Exiting.';
        RETURN;
    END IF;
    
    -- ==========================================
    -- MAIN MIGRATION LOOP
    -- ==========================================
    
    FOR vault_record IN 
        SELECT id, user_id, encrypted_data, created_at, updated_at 
        FROM vaults
        ORDER BY created_at ASC
    LOOP
        BEGIN
            -- Create migration log entry
            INSERT INTO vault_migration_log (user_id, old_vault_id, migration_status)
            VALUES (vault_record.user_id, vault_record.id, 'in_progress')
            RETURNING id INTO migration_log_id;
            
            RAISE NOTICE 'Migrating vault for user: % (vault_id: %)', vault_record.user_id, vault_record.id;
            
            -- Check if vault blob is valid JSON (for debugging)
            IF NOT (vault_record.encrypted_data::text ~ '^[\[\{]') THEN
                -- This is an encrypted blob, not JSON - that's expected
                -- We'll migrate it as a single credential that needs client-side re-encryption
                
                -- Create a single "legacy vault" credential that will be split on first access
                IF NOT dry_run THEN
                    INSERT INTO vault_credentials (
                        user_id,
                        credential_id,
                        encrypted_data,
                        iv,
                        category,
                        tags,
                        is_favorite,
                        expires_at,
                        expiration_status,
                        last_password_change,
                        access_count,
                        version,
                        is_deleted,
                        created_at,
                        updated_at
                    ) VALUES (
                        vault_record.user_id,
                        uuid_generate_v4(),
                        vault_record.encrypted_data,  -- Legacy encrypted blob
                        'legacy',  -- Marker for client-side re-encryption needed
                        'other',
                        ARRAY['legacy-migration']::text[],
                        false,
                        NULL,
                        'active',
                        vault_record.created_at,
                        0,
                        1,
                        false,
                        vault_record.created_at,
                        vault_record.updated_at
                    );
                    
                    -- Update migration log
                    UPDATE vault_migration_log
                    SET migration_status = 'completed',
                        credentials_migrated = 1,
                        completed_at = timezone('utc'::text, now()),
                        metadata = jsonb_build_object(
                            'migration_type', 'legacy_blob',
                            'requires_client_reencryption', true
                        )
                    WHERE id = migration_log_id;
                    
                    migrated_count := migrated_count + 1;
                    RAISE NOTICE '✓ Migrated legacy vault for user % (requires client re-encryption)', vault_record.user_id;
                END IF;
            ELSE
                -- If it happens to be parseable JSON (unlikely in production), handle it
                RAISE NOTICE '⚠ Found JSON-formatted vault data for user % - this is unexpected', vault_record.user_id;
                
                -- Update migration log as failed for manual review
                UPDATE vault_migration_log
                SET migration_status = 'failed',
                    error_message = 'Unexpected JSON format - requires manual migration',
                    completed_at = timezone('utc'::text, now())
                WHERE id = migration_log_id;
                
                failed_count := failed_count + 1;
            END IF;
            
        EXCEPTION WHEN OTHERS THEN
            -- Log error and continue with next vault
            RAISE WARNING 'Failed to migrate vault for user %: %', vault_record.user_id, SQLERRM;
            
            UPDATE vault_migration_log
            SET migration_status = 'failed',
                error_message = SQLERRM,
                completed_at = timezone('utc'::text, now())
            WHERE id = migration_log_id;
            
            failed_count := failed_count + 1;
        END;
    END LOOP;
    
    -- ==========================================
    -- MIGRATION SUMMARY
    -- ==========================================
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Migration Summary';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total vaults: %', total_vaults;
    RAISE NOTICE 'Successfully migrated: %', migrated_count;
    RAISE NOTICE 'Failed: %', failed_count;
    RAISE NOTICE '========================================';
    
    IF dry_run THEN
        RAISE NOTICE 'DRY RUN MODE - No changes were made';
        RAISE NOTICE 'Set dry_run = false to execute actual migration';
    END IF;
END $$;

-- ==========================================
-- POST-MIGRATION VERIFICATION
-- ==========================================

DO $$
DECLARE
    v1_user_count INTEGER;
    v2_user_count INTEGER;
    orphaned_users INTEGER;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Post-Migration Verification';
    RAISE NOTICE '========================================';
    
    -- Count users with V1 vaults
    SELECT COUNT(DISTINCT user_id) INTO v1_user_count FROM vaults;
    
    -- Count users with V2 credentials
    SELECT COUNT(DISTINCT user_id) INTO v2_user_count FROM vault_credentials;
    
    -- Find users who didn't migrate
    SELECT COUNT(DISTINCT v.user_id) INTO orphaned_users
    FROM vaults v
    LEFT JOIN vault_credentials vc ON v.user_id = vc.user_id
    WHERE vc.user_id IS NULL;
    
    RAISE NOTICE 'V1 users with vaults: %', v1_user_count;
    RAISE NOTICE 'V2 users with credentials: %', v2_user_count;
    RAISE NOTICE 'Users not migrated: %', orphaned_users;
    
    IF orphaned_users > 0 THEN
        RAISE WARNING '⚠ % users were not migrated. Check vault_migration_log for details.', orphaned_users;
    ELSE
        RAISE NOTICE '✓ All users successfully migrated';
    END IF;
    
    -- Show migration statistics
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Migration Log Summary:';
    
    FOR rec IN 
        SELECT migration_status, COUNT(*) as count
        FROM vault_migration_log
        GROUP BY migration_status
        ORDER BY migration_status
    LOOP
        RAISE NOTICE '  %: %', rec.migration_status, rec.count;
    END LOOP;
    
    RAISE NOTICE '========================================';
END $$;

-- ==========================================
-- VERIFICATION QUERIES
-- ==========================================

-- Uncomment these to run manual verification queries:

-- Check migration log for failed migrations
-- SELECT user_id, error_message, started_at, metadata
-- FROM vault_migration_log
-- WHERE migration_status = 'failed'
-- ORDER BY started_at DESC;

-- Compare V1 and V2 data
-- SELECT 
--     v.user_id,
--     v.id as v1_vault_id,
--     COUNT(vc.id) as v2_credential_count,
--     ml.migration_status
-- FROM vaults v
-- LEFT JOIN vault_credentials vc ON v.user_id = vc.user_id
-- LEFT JOIN vault_migration_log ml ON v.user_id = ml.user_id
-- GROUP BY v.user_id, v.id, ml.migration_status
-- ORDER BY v2_credential_count DESC;

-- Find users who need client-side re-encryption
-- SELECT DISTINCT user_id 
-- FROM vault_credentials 
-- WHERE iv = 'legacy';

-- ==========================================
-- NOTES FOR POST-MIGRATION
-- ==========================================

/*
IMPORTANT: After migration, users will need to:

1. The encrypted blobs have been migrated as-is
2. On first vault access, the client will:
   - Detect the 'legacy' IV marker
   - Decrypt the blob with user's master key
   - Split into individual credentials
   - Re-encrypt each credential with new IV
   - Replace the legacy credential with new per-item credentials

3. Old vaults table should be kept for 90 days as backup:
   - DO NOT drop the vaults table immediately
   - After 90 days: DROP TABLE vaults;

4. To rename vaults table (keep as backup):
   ALTER TABLE vaults RENAME TO vaults_v1_backup;

5. To check migration progress:
   SELECT * FROM vault_migration_log ORDER BY started_at DESC;
*/

-- ==========================================
-- FINAL MESSAGE
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Migration Complete!';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Review vault_migration_log for any failures';
    RAISE NOTICE '2. Deploy V2 client code for re-encryption';
    RAISE NOTICE '3. Monitor first vault access for each user';
    RAISE NOTICE '4. Keep vaults table for 90 days as backup';
    RAISE NOTICE '========================================';
END $$;