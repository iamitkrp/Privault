# Privault Vault Migration Guide
## From V1 (Single-Blob) to V2 (Per-Item Storage)

**Version:** 1.0  
**Last Updated:** October 9, 2025  
**Status:** Ready for Implementation

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [What's Changing](#whats-changing)
3. [Breaking Changes](#breaking-changes)
4. [Migration Process](#migration-process)
5. [Data Migration](#data-migration)
6. [Code Migration](#code-migration)
7. [Testing Strategy](#testing-strategy)
8. [Rollback Procedures](#rollback-procedures)
9. [FAQ](#faq)
10. [Timeline](#timeline)
11. [Support](#support)

---

## Executive Summary

This guide provides step-by-step instructions for migrating from the current Privault vault implementation (V1) to the completely rebuilt system (V2). The migration involves database schema changes, code updates, and data transformation.

### Why Migrate?

**Current Issues (V1):**
- Single-blob storage limits scalability
- No password expiration management
- Poor query performance for large vaults
- Difficult to implement advanced features
- Inconsistent metadata tracking

**Benefits of V2:**
- ✅ Per-item encryption with full metadata
- ✅ Password expiration and lifecycle management
- ✅ Better search and filtering
- ✅ Improved performance and scalability
- ✅ Clean, maintainable architecture
- ✅ Comprehensive error handling

### Migration Impact

- **Downtime:** Minimal (~5-10 minutes during migration)
- **Data Loss Risk:** Very low (comprehensive backups)
- **User Impact:** Transparent (users may need to re-unlock vault)
- **Developer Impact:** Moderate (API changes, new patterns)

---

## What's Changing

### Database Schema

#### V1 (Current)
```sql
CREATE TABLE vaults (
    id UUID PRIMARY KEY,
    user_id UUID,
    encrypted_data TEXT,  -- Single blob for all credentials
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

#### V2 (New)
```sql
CREATE TABLE vault_credentials (
    id UUID PRIMARY KEY,
    user_id UUID,
    credential_id UUID,
    encrypted_data TEXT,  -- Individual credential
    iv TEXT,
    category TEXT,
    tags TEXT[],
    is_favorite BOOLEAN,
    expires_at TIMESTAMP,
    expiration_status TEXT,
    version INTEGER,
    -- ... more fields
);

-- Additional tables
CREATE TABLE password_history (...);
CREATE TABLE expiration_events (...);
CREATE TABLE vault_tags (...);
```

### API Changes

#### V1 API
```typescript
// Old service
vaultService.getVault(userId)           // Returns entire vault
vaultService.saveVault(userId, data)    // Saves entire vault
```

#### V2 API
```typescript
// New service
vaultService.getCredential(id)                    // Returns single credential
vaultService.createCredential(data)                // Creates credential
vaultService.updateCredential(id, data)            // Updates credential
vaultService.deleteCredential(id)                  // Deletes credential
vaultService.listCredentials(filters)              // Lists with filters
```

### Component Changes

#### V1 Components
- `components/vault/*` (removed)
- Single monolithic vault component
- Tightly coupled logic

#### V2 Components
- `components/vault-v2/*` (new)
- Modular, reusable components
- Clean separation of concerns
- Better accessibility

---

## Breaking Changes

### 1. Service Layer Changes

#### ❌ Removed
```typescript
// Old imports - NO LONGER AVAILABLE
import { VaultService } from '@/services/vault.service';
import { importExportService } from '@/services/import-export.service';
```

#### ✅ New
```typescript
// New imports
import { VaultService } from '@/lib/vault-v2/services/vault.service';
import { IImportExportService } from '@/lib/vault-v2/core/types';
```

### 2. Data Model Changes

#### ❌ Old Credential Type
```typescript
interface Credential {
  id: string;
  site: string;
  username: string;
  password: string;
  // Stored in single encrypted blob
}
```

#### ✅ New Credential Type
```typescript
interface VaultCredential {
  id: string;
  credential_id: string;
  encrypted_data: string;  // Per-item encryption
  iv: string;
  category: CredentialCategory;
  expires_at: Date | null;
  expiration_status: ExpirationStatus;
  version: number;
  // ... more fields
}
```

### 3. Component API Changes

#### ❌ Old Component Usage
```tsx
import { PasswordList } from '@/components/vault/password-list';

<PasswordList 
  passwords={allPasswords} 
  onEdit={handleEdit}
/>
```

#### ✅ New Component Usage
```tsx
import { CredentialList } from '@/components/vault-v2';

<CredentialList
  credentials={credentials}
  filters={filters}
  onEdit={handleEdit}
/>
```

### 4. Hook Changes

#### ❌ Removed
```typescript
import { usePassphraseSession } from '@/hooks/use-passphrase-session';
```

#### ✅ New
```typescript
import { useVaultSession } from '@/lib/vault-v2/hooks/use-vault-session';
import { useCredentials } from '@/lib/vault-v2/hooks/use-credentials';
```

---

## Migration Process

### Overview

The migration follows a **4-phase approach** with built-in safety measures and rollback capabilities.

```
Phase 1: Preparation → Phase 2: Database → Phase 3: Deployment → Phase 4: Cleanup
```

### Phase 1: Preparation (Week 1)

#### 1.1 Backup Current System
```bash
# Backup database
pg_dump privault_db > backup_v1_$(date +%Y%m%d).sql

# Backup code
git tag v1-final
git push origin v1-final
```

#### 1.2 Verify Backup
```bash
# Restore to test database
psql privault_test < backup_v1_$(date +%Y%m%d).sql

# Verify data integrity
SELECT COUNT(*) FROM vaults;
SELECT COUNT(*) FROM profiles;
```

#### 1.3 Communicate to Users
- Email notification (7 days before)
- In-app banner (3 days before)
- Status page update

#### 1.4 Set Up Staging Environment
```bash
# Deploy V2 to staging
npm run deploy:staging

# Run migration on test data
npm run migrate:test
```

### Phase 2: Database Migration (Week 2, Day 1-2)

#### 2.1 Create New Schema
```bash
# Run V2 schema creation
psql privault_db < database/vault-schema-v2.sql
```

#### 2.2 Migrate Data

**Migration Script:** `database/migrate-v1-to-v2.sql`

```sql
-- Migration from vaults (blob) to vault_credentials (per-item)
DO $$
DECLARE
    vault_record RECORD;
    credential_record JSONB;
    new_credential_id UUID;
BEGIN
    -- Loop through all vaults
    FOR vault_record IN 
        SELECT id, user_id, encrypted_data, created_at, updated_at 
        FROM vaults
    LOOP
        -- Parse encrypted blob (would be decrypted and re-encrypted in practice)
        -- This is a simplified example
        FOR credential_record IN 
            SELECT * FROM jsonb_array_elements(vault_record.encrypted_data::jsonb)
        LOOP
            new_credential_id := uuid_generate_v4();
            
            -- Insert into new vault_credentials table
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
                created_at,
                updated_at
            ) VALUES (
                vault_record.user_id,
                new_credential_id,
                credential_record->>'encrypted_data',
                credential_record->>'iv',
                COALESCE(credential_record->>'category', 'other'),
                COALESCE((credential_record->>'tags')::text[], '{}'),
                COALESCE((credential_record->>'isFavorite')::boolean, false),
                NULL,  -- No expiration in V1
                'active',
                vault_record.created_at,
                COALESCE((credential_record->>'accessCount')::integer, 0),
                1,
                vault_record.created_at,
                vault_record.updated_at
            );
        END LOOP;
        
        RAISE NOTICE 'Migrated vault for user: %', vault_record.user_id;
    END LOOP;
END $$;
```

#### 2.3 Verify Migration
```sql
-- Check record counts
SELECT 
    (SELECT COUNT(*) FROM vaults) as old_vaults,
    (SELECT COUNT(*) FROM vault_credentials) as new_credentials;

-- Verify user data
SELECT user_id, COUNT(*) as credential_count
FROM vault_credentials
GROUP BY user_id
ORDER BY credential_count DESC;

-- Check for orphaned records
SELECT v.user_id 
FROM vaults v
LEFT JOIN vault_credentials vc ON v.user_id = vc.user_id
WHERE vc.user_id IS NULL;
```

### Phase 3: Application Deployment (Week 2, Day 3-5)

#### 3.1 Deploy V2 Code with Feature Flag
```typescript
// config/features.ts
export const FEATURES = {
  USE_VAULT_V2: process.env.NEXT_PUBLIC_VAULT_V2_ENABLED === 'true',
};

// Conditional routing
if (FEATURES.USE_VAULT_V2) {
  router.push('/vault-v2');
} else {
  router.push('/vault');
}
```

#### 3.2 Gradual Rollout
```bash
# 10% of users
UPDATE user_features SET vault_v2_enabled = true 
WHERE id IN (SELECT id FROM users ORDER BY RANDOM() LIMIT (SELECT COUNT(*) * 0.1 FROM users));

# Monitor for 24 hours

# 50% of users (if successful)
UPDATE user_features SET vault_v2_enabled = true 
WHERE id IN (SELECT id FROM users ORDER BY RANDOM() LIMIT (SELECT COUNT(*) * 0.5 FROM users));

# 100% of users (if successful)
UPDATE user_features SET vault_v2_enabled = true;
```

#### 3.3 Monitor Metrics
```javascript
// Track migration success
analytics.track('vault_v2_access', {
  user_id: userId,
  success: true,
  load_time: duration,
});

// Error tracking
if (error) {
  sentry.captureException(error, {
    tags: { migration: 'vault_v2' },
  });
}
```

### Phase 4: Cleanup (Week 3)

#### 4.1 Deprecation Warnings
```typescript
// Add warnings to old code
console.warn('⚠️ VaultService V1 is deprecated. Please migrate to V2.');

// Log usage for tracking
logger.info('v1_vault_access', { user_id, timestamp });
```

#### 4.2 Remove Old Code (After 30 Days)
```bash
# Remove old files
rm -rf services/vault.service.ts
rm -rf components/vault
rm -rf hooks/use-passphrase-session.ts

# Drop old tables (AFTER FULL VERIFICATION)
# DROP TABLE vaults;  -- Keep for 90 days as backup
```

---

## Data Migration

### Client-Side Re-encryption (Recommended)

For maximum security, credentials should be decrypted on the client and re-encrypted individually:

```typescript
/**
 * Client-side migration utility
 */
async function migrateUserVault(masterKey: CryptoKey) {
  // 1. Fetch old vault blob
  const oldVault = await fetchOldVault();
  
  // 2. Decrypt blob
  const decryptedCredentials = await decryptVaultBlob(
    oldVault.encrypted_data, 
    masterKey
  );
  
  // 3. Re-encrypt each credential individually
  const migratedCredentials = [];
  for (const cred of decryptedCredentials) {
    const newCred = await vaultServiceV2.createCredential({
      site: cred.site,
      username: cred.username,
      password: cred.password,
      url: cred.url,
      notes: cred.notes,
      category: mapCategory(cred.folder),
      tags: cred.tags || [],
      is_favorite: cred.isFavorite || false,
    });
    
    migratedCredentials.push(newCred);
  }
  
  // 4. Mark old vault as migrated
  await markVaultMigrated(oldVault.id);
  
  return migratedCredentials;
}
```

### Server-Side Migration (Alternative)

For bulk migration without user interaction:

```javascript
// Server script
async function bulkMigrate() {
  const users = await db.getAllUsers();
  
  for (const user of users) {
    try {
      const vault = await db.getUserVault(user.id);
      
      // Note: Can't decrypt without master key
      // Store encrypted blob as-is, will re-encrypt on first access
      await migrateVaultData(user.id, vault);
      
      console.log(`✓ Migrated user: ${user.id}`);
    } catch (error) {
      console.error(`✗ Failed for user ${user.id}:`, error);
      // Log for manual intervention
      await logMigrationError(user.id, error);
    }
  }
}
```

---

## Code Migration

### Service Migration

#### Before (V1)
```typescript
import { vaultService } from '@/services/vault.service';

// Get all credentials
const vault = await vaultService.getVault(userId);
const credentials = vault.credentials;

// Add credential
await vaultService.addCredential(userId, newCredential);

// Update credential
await vaultService.updateCredential(userId, credentialId, updates);
```

#### After (V2)
```typescript
import { VaultService } from '@/lib/vault-v2/services/vault.service';

const vaultService = new VaultService(...deps);

// Get all credentials
const result = await vaultService.listCredentials();
const credentials = result.success ? result.data : [];

// Add credential
const createResult = await vaultService.createCredential(newCredential);

// Update credential (with optimistic locking)
const updateResult = await vaultService.updateCredential(credentialId, {
  ...updates,
  version: credential.version,
});
```

### Component Migration

#### Before (V1)
```tsx
import { PasswordList } from '@/components/vault/password-list';

function VaultPage() {
  const [passwords, setPasswords] = useState([]);
  
  useEffect(() => {
    loadPasswords();
  }, []);
  
  return <PasswordList passwords={passwords} />;
}
```

#### After (V2)
```tsx
import { CredentialList } from '@/components/vault-v2';
import { useCredentials } from '@/lib/vault-v2/hooks/use-credentials';

function VaultPage() {
  const { credentials, loading, error } = useCredentials();
  
  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  
  return <CredentialList credentials={credentials} />;
}
```

### Route Migration

#### Before (V1)
```
/vault           → Main vault page
/vault?id=123    → View credential (query param)
```

#### After (V2)
```
/vault-v2              → Main vault page
/vault-v2/[id]         → View credential
/vault-v2/[id]/edit    → Edit credential
/vault-v2/new          → Add credential
/vault-v2/import       → Import credentials
```

---

## Testing Strategy

### Pre-Migration Testing

#### 1. Test Data Preparation
```sql
-- Create test users with various vault scenarios
INSERT INTO test_users (email) VALUES 
    ('user_empty@test.com'),           -- Empty vault
    ('user_small@test.com'),           -- 5 credentials
    ('user_medium@test.com'),          -- 100 credentials
    ('user_large@test.com');           -- 1000+ credentials
```

#### 2. Migration Dry Run
```bash
# Run migration on test database
npm run migrate:dry-run

# Verify results
npm run migrate:verify
```

#### 3. Performance Testing
```javascript
// Load test with varying vault sizes
const sizes = [10, 100, 1000, 10000];

for (const size of sizes) {
  const startTime = performance.now();
  await vaultService.listCredentials();
  const duration = performance.now() - startTime;
  
  console.log(`Size: ${size}, Duration: ${duration}ms`);
}
```

### Post-Migration Testing

#### 1. Data Integrity Checks
```sql
-- Verify all credentials migrated
SELECT 
    COUNT(DISTINCT v.user_id) as users_with_old_vaults,
    COUNT(DISTINCT vc.user_id) as users_with_new_credentials
FROM vaults v
FULL OUTER JOIN vault_credentials vc ON v.user_id = vc.user_id;

-- Check for data loss
SELECT user_id, 
       jsonb_array_length(encrypted_data::jsonb) as old_count,
       (SELECT COUNT(*) FROM vault_credentials WHERE user_id = v.user_id) as new_count
FROM vaults v
WHERE jsonb_array_length(encrypted_data::jsonb) != 
      (SELECT COUNT(*) FROM vault_credentials WHERE user_id = v.user_id);
```

#### 2. Functionality Testing
```typescript
// Test suite for critical paths
describe('Vault V2 Migration', () => {
  it('should preserve all credential data', async () => {
    const v1Data = await getV1Credentials(userId);
    const v2Data = await getV2Credentials(userId);
    
    expect(v2Data.length).toBe(v1Data.length);
  });
  
  it('should decrypt credentials correctly', async () => {
    const credential = await vaultService.getCredential(credId);
    expect(credential.decrypted_data.password).toBeDefined();
  });
  
  it('should handle expiration correctly', async () => {
    const expired = await vaultService.listCredentials({
      expiration_status: ExpirationStatus.EXPIRED,
    });
    // Verify logic
  });
});
```

---

## Rollback Procedures

### When to Rollback

Trigger rollback if:
- Error rate > 2%
- Data inconsistency detected
- Critical security issue found
- Performance degradation > 30%
- User complaints exceed threshold

### Rollback Steps

#### 1. Immediate Rollback (< 1 hour)
```bash
# Revert to V1 code
git revert HEAD
git push origin main
npm run deploy:production

# Re-enable V1 routing
UPDATE feature_flags SET vault_v2_enabled = false;
```

#### 2. Database Rollback
```bash
# Restore from backup
psql privault_db < backup_v1_YYYYMMDD.sql

# Verify restoration
SELECT COUNT(*) FROM vaults;
```

#### 3. User Communication
```
Subject: Vault System Update - Temporary Rollback

We've temporarily rolled back to the previous vault system 
due to [reason]. Your data is safe and no action is required.

We're working on the issue and will provide updates soon.
```

#### 4. Post-Rollback Analysis
- Review error logs
- Identify root cause
- Fix issues in staging
- Prepare for retry

---

## FAQ

### General Questions

**Q: Will I lose any data during migration?**  
A: No. We create backups before migration and verify data integrity at each step. The migration is designed to be lossless.

**Q: Do I need to do anything?**  
A: No action required. The migration is automatic. You may need to unlock your vault again after the migration.

**Q: How long will the migration take?**  
A: The actual migration window is 5-10 minutes. We'll schedule this during low-traffic hours.

**Q: What if something goes wrong?**  
A: We have comprehensive rollback procedures. Your data is backed up and can be restored within minutes.

### Technical Questions

**Q: How is encryption handled?**  
A: Each credential is individually encrypted with AES-256-GCM. Your master key never leaves your device.

**Q: What about password history?**  
A: V1 didn't track history, so existing credentials start fresh. New changes will be tracked.

**Q: Are there API breaking changes?**  
A: Yes, see [Breaking Changes](#breaking-changes) section. We provide migration helpers and documentation.

**Q: How does versioning work?**  
A: We use optimistic locking. Each update increments a version number to prevent conflicts.

### Troubleshooting

**Q: My vault is empty after migration!**  
A: 
1. Try refreshing the page
2. Check if you need to unlock vault again
3. Contact support with your user ID

**Q: I get "Version mismatch" errors**  
A: This happens when the credential was updated elsewhere. Refresh and try again.

**Q: Some credentials won't decrypt**  
A: Ensure you're using the correct master password. Contact support if issue persists.

---

## Timeline

### Week-by-Week Breakdown

#### Week 1: Preparation
- **Day 1-2:** Create backups, set up staging
- **Day 3-4:** Test migration on staging
- **Day 5:** User communication, final reviews

#### Week 2: Migration & Deployment
- **Day 1:** Run database migration (off-peak hours)
- **Day 2:** Verify migration, fix any issues
- **Day 3:** Deploy V2 code with feature flag (10% rollout)
- **Day 4:** Expand to 50% rollout
- **Day 5:** 100% rollout (if successful)

#### Week 3: Monitoring & Cleanup
- **Day 1-3:** Monitor metrics, address issues
- **Day 4-5:** Begin deprecation of V1 code
- **Ongoing:** Collect user feedback

#### Week 4+: Optimization
- Performance tuning
- Feature additions
- Documentation updates

---

## Success Criteria

### Migration Success Metrics

- ✅ 100% data migration success rate
- ✅ 0% data loss
- ✅ Error rate < 1%
- ✅ Performance improvement or maintained
- ✅ User satisfaction > 8/10
- ✅ < 5% increase in support tickets
- ✅ Feature adoption > 70% within 30 days

### Validation Checklist

- [ ] All vaults migrated successfully
- [ ] No orphaned credentials
- [ ] Encryption/decryption working
- [ ] Search and filtering functional
- [ ] Import/export working
- [ ] Expiration features active
- [ ] Performance benchmarks met
- [ ] Mobile responsiveness verified
- [ ] Accessibility compliance maintained
- [ ] Security audit passed

---

## Support

### During Migration

**Support Team:**
- Email: support@privault.app
- Slack: #vault-migration
- Emergency: +1-XXX-XXX-XXXX

**Documentation:**
- Migration Guide (this document)
- [Vault Rebuild Plan](./VAULT_REBUILD_PLAN.md)
- [API Documentation](./docs/api.md)

### After Migration

**Resources:**
- User Guide: [docs.privault.app/vault-v2](https://docs.privault.app/vault-v2)
- Video Tutorials: [youtube.com/privault](https://youtube.com/privault)
- Community Forum: [community.privault.app](https://community.privault.app)

**Reporting Issues:**
1. Check FAQ above
2. Search existing issues
3. Create new issue with:
   - User ID
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable

---

## Appendix

### A. Migration Checklist

```markdown
## Pre-Migration
- [ ] Database backup created
- [ ] Code backup (git tag)
- [ ] Staging environment tested
- [ ] User communication sent
- [ ] Support team briefed
- [ ] Monitoring dashboards ready

## During Migration
- [ ] Maintenance mode enabled
- [ ] Database migration executed
- [ ] Data verification passed
- [ ] V2 code deployed
- [ ] Feature flag configured
- [ ] Smoke tests passed

## Post-Migration
- [ ] Monitoring active
- [ ] Error tracking configured
- [ ] User feedback collected
- [ ] Performance metrics reviewed
- [ ] Support tickets triaged
- [ ] Success criteria evaluated
```

### B. Emergency Contacts

| Role | Name | Contact |
|------|------|---------|
| Tech Lead | [Name] | [Email/Phone] |
| DBA | [Name] | [Email/Phone] |
| DevOps | [Name] | [Email/Phone] |
| Support Lead | [Name] | [Email/Phone] |
| Security | [Name] | [Email/Phone] |

### C. Useful Commands

```bash
# Check migration status
npm run migration:status

# Verify data integrity
npm run migration:verify

# Rollback migration
npm run migration:rollback

# Generate migration report
npm run migration:report
```

---

**Document Version:** 1.0  
**Last Updated:** October 9, 2025  
**Next Review:** November 9, 2025  
**Owner:** Engineering Team

---

*For questions or clarifications, contact the migration team at vault-migration@privault.app*

