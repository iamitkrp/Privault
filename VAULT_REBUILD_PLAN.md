# Privault Vault Rebuild - Complete SDLC Plan

## Executive Summary

This document outlines the complete Software Development Life Cycle (SDLC) plan for rebuilding the Privault vault system from the ground up. The rebuild addresses fundamental architectural limitations in the current implementation and establishes a robust, scalable, and maintainable vault infrastructure.

### Why a Complete Rebuild?

The current vault implementation suffers from several critical issues:
- **Single-blob storage architecture** - All credentials stored in one encrypted blob, limiting scalability and functionality
- **Missing password expiration** - No lifecycle management for credentials
- **Inconsistent metadata tracking** - Poor audit trail and usage analytics
- **Tightly coupled components** - Difficult to test, maintain, and extend
- **Insufficient error handling** - Poor user experience and debugging capabilities
- **Limited extensibility** - Hard to add new features without breaking existing functionality

### Benefits of the Rebuild

- ✅ **Per-item encryption** - Individual credential storage with full metadata
- ✅ **Password lifecycle management** - Expiration, rotation, and history tracking
- ✅ **Clean architecture** - Proper separation of concerns, testability, and maintainability
- ✅ **Comprehensive error handling** - Better UX and debugging capabilities
- ✅ **Extensible design** - Easy to add features without breaking changes
- ✅ **Performance optimization** - Efficient queries, caching, and lazy loading
- ✅ **Security enhancements** - Better audit trails, access controls, and monitoring

---

## Requirements Analysis

### 1. Functional Requirements

#### FR-1: Credential Management
- **FR-1.1** - Create, read, update, delete individual credentials
- **FR-1.2** - Support multiple credential types (login, card, note, identity)
- **FR-1.3** - Categorize credentials (social, work, shopping, etc.)
- **FR-1.4** - Tag credentials for flexible organization
- **FR-1.5** - Mark credentials as favorites
- **FR-1.6** - Store metadata (URL, notes, custom fields)

#### FR-2: Password Lifecycle Management
- **FR-2.1** - Set expiration dates for passwords (30, 60, 90, 180, 365 days, or custom)
- **FR-2.2** - Automatic expiration status calculation (active, expiring soon, expired)
- **FR-2.3** - Visual indicators for expiration status
- **FR-2.4** - Notifications for expiring passwords (7 days, 3 days, 1 day before)
- **FR-2.5** - Bulk password rotation workflows
- **FR-2.6** - Password history tracking (last 10 changes)

#### FR-3: Security Features
- **FR-3.1** - Password strength analysis (using zxcvbn)
- **FR-3.2** - Weak password detection and warnings
- **FR-3.3** - Reused password detection across vault
- **FR-3.4** - Compromised password checking (Have I Been Pwned)
- **FR-3.5** - Security score calculation for vault health
- **FR-3.6** - Audit log for credential access and changes

#### FR-4: Search and Filtering
- **FR-4.1** - Full-text search across credentials
- **FR-4.2** - Filter by category, tags, favorites, expiration status
- **FR-4.3** - Sort by name, date created, date modified, expiration date
- **FR-4.4** - Advanced filters (weak, reused, expired, expiring soon)
- **FR-4.5** - Saved search queries

#### FR-5: Import/Export
- **FR-5.1** - Import from CSV, JSON formats
- **FR-5.2** - Support popular password managers (1Password, LastPass, Bitwarden, Chrome)
- **FR-5.3** - Export to encrypted JSON, CSV (with warnings)
- **FR-5.4** - Batch import with validation and error reporting
- **FR-5.5** - Import preview and conflict resolution

#### FR-6: Analytics and Reporting
- **FR-6.1** - Vault statistics dashboard
- **FR-6.2** - Password health score visualization
- **FR-6.3** - Category distribution charts
- **FR-6.4** - Expiration timeline view
- **FR-6.5** - Security recommendations

### 2. Non-Functional Requirements

#### NFR-1: Performance
- **NFR-1.1** - Vault unlock time < 500ms
- **NFR-1.2** - Credential list load time < 1s for 1000 items
- **NFR-1.3** - Search results < 300ms for 1000 items
- **NFR-1.4** - Encryption/decryption < 100ms per item
- **NFR-1.5** - UI responsiveness 60fps minimum

#### NFR-2: Security
- **NFR-2.1** - AES-256-GCM encryption for all credentials
- **NFR-2.2** - PBKDF2 key derivation (100,000 iterations minimum)
- **NFR-2.3** - Zero-knowledge architecture (server never sees plaintext)
- **NFR-2.4** - Secure memory handling (clear sensitive data after use)
- **NFR-2.5** - RLS (Row-Level Security) enforcement
- **NFR-2.6** - HTTPS-only communication
- **NFR-2.7** - CSP (Content Security Policy) compliance

#### NFR-3: Reliability
- **NFR-3.1** - 99.9% uptime target
- **NFR-3.2** - Data consistency with transaction support
- **NFR-3.3** - Graceful degradation for offline mode
- **NFR-3.4** - Automatic error recovery
- **NFR-3.5** - Data backup and restore capabilities

#### NFR-4: Usability
- **NFR-4.1** - WCAG 2.1 Level AA compliance
- **NFR-4.2** - Responsive design (mobile, tablet, desktop)
- **NFR-4.3** - Keyboard navigation support
- **NFR-4.4** - Screen reader compatibility
- **NFR-4.5** - Intuitive UI/UX with minimal learning curve

#### NFR-5: Maintainability
- **NFR-5.1** - Comprehensive code documentation
- **NFR-5.2** - 80%+ test coverage (unit + integration)
- **NFR-5.3** - Clear separation of concerns
- **NFR-5.4** - Modular, extensible architecture
- **NFR-5.5** - Automated testing in CI/CD pipeline

#### NFR-6: Scalability
- **NFR-6.1** - Support 10,000+ credentials per user
- **NFR-6.2** - Horizontal scaling capability
- **NFR-6.3** - Efficient pagination for large datasets
- **NFR-6.4** - Optimistic UI updates
- **NFR-6.5** - Lazy loading and virtual scrolling

### 3. Security Requirements

#### SR-1: Encryption
- All credentials encrypted with AES-256-GCM
- Unique IV (Initialization Vector) per credential
- Master key derived from passphrase using PBKDF2
- Automatic key rotation capability

#### SR-2: Authentication & Authorization
- Master passphrase never stored
- OTP verification for critical operations
- Session timeout after inactivity
- Automatic vault locking

#### SR-3: Data Protection
- Zero-knowledge architecture
- No plaintext storage
- Secure memory handling
- Data sanitization before disposal

#### SR-4: Audit & Compliance
- Comprehensive audit logging
- Access tracking
- Change history
- Security event monitoring

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT TIER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Next.js UI  │  │  React Hooks │  │  State Mgmt  │      │
│  │  Components  │  │  & Context   │  │  (Zustand)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Vault     │  │  Expiration  │  │   History    │      │
│  │   Service    │  │   Service    │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Encryption  │  │ Import/Export│  │   Search     │      │
│  │   Service    │  │   Service    │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                    DATA ACCESS LAYER                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Repository  │  │    Cache     │  │  Validators  │      │
│  │   Pattern    │  │   Manager    │  │   & Guards   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                      DATABASE TIER                          │
│                    Supabase PostgreSQL                      │
│                    + Row-Level Security                     │
└─────────────────────────────────────────────────────────────┘
```

### Data Models

#### VaultCredential (Core Entity)
```typescript
interface VaultCredential {
  id: string;
  user_id: string;
  credential_id: string;           // UUID for the credential
  encrypted_data: string;           // AES-256-GCM encrypted JSON
  iv: string;                       // Initialization vector
  
  // Metadata (stored in plaintext for queries)
  category: CredentialCategory;
  tags: string[];
  is_favorite: boolean;
  
  // Lifecycle tracking
  expires_at: Date | null;
  expiration_status: ExpirationStatus;
  last_password_change: Date;
  
  // Access tracking
  access_count: number;
  last_accessed: Date | null;
  
  // Versioning
  version: number;
  
  // Timestamps
  created_at: Date;
  updated_at: Date;
}
```

#### Encrypted Credential Data (Decrypted structure)
```typescript
interface DecryptedCredentialData {
  site: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  custom_fields?: Record<string, string>;
}
```

#### PasswordHistoryEntry
```typescript
interface PasswordHistoryEntry {
  id: string;
  user_id: string;
  credential_id: string;
  encrypted_old_password: string;
  password_hash: string;           // For reuse detection
  change_reason: ChangeReason;
  changed_at: Date;
}
```

#### ExpirationEvent
```typescript
interface ExpirationEvent {
  id: string;
  user_id: string;
  credential_id: string;
  event_type: 'warning' | 'expired' | 'rotated';
  triggered_at: Date;
  acknowledged: boolean;
}
```

### Service Layer Design

#### VaultService
**Responsibilities:**
- CRUD operations for credentials
- Encryption/decryption orchestration
- Access tracking and analytics
- Business logic enforcement

**Key Methods:**
- `createCredential(data: CreateCredentialDTO): Promise<Result<VaultCredential>>`
- `getCredential(id: string): Promise<Result<DecryptedCredential>>`
- `updateCredential(id: string, data: UpdateCredentialDTO): Promise<Result<VaultCredential>>`
- `deleteCredential(id: string, hard?: boolean): Promise<Result<void>>`
- `listCredentials(filters: CredentialFilters): Promise<Result<VaultCredential[]>>`
- `searchCredentials(query: string): Promise<Result<VaultCredential[]>>`
- `getVaultStats(): Promise<Result<VaultStats>>`

#### ExpirationService
**Responsibilities:**
- Password expiration calculation
- Expiration notifications
- Bulk rotation workflows

**Key Methods:**
- `calculateExpirationStatus(credential: VaultCredential): ExpirationStatus`
- `getExpiringCredentials(days: number): Promise<Result<VaultCredential[]>>`
- `setExpirationDate(credentialId: string, expiresAt: Date): Promise<Result<void>>`
- `rotateExpiredPasswords(): Promise<Result<RotationReport>>`

#### HistoryService
**Responsibilities:**
- Password change tracking
- History retrieval and management
- Reuse detection

**Key Methods:**
- `addToHistory(credentialId: string, oldPassword: string, reason: ChangeReason): Promise<Result<void>>`
- `getHistory(credentialId: string): Promise<Result<PasswordHistoryEntry[]>>`
- `checkPasswordReuse(passwordHash: string): Promise<Result<boolean>>`
- `clearHistory(credentialId: string): Promise<Result<void>>`

#### EncryptionService
**Responsibilities:**
- Encryption/decryption operations
- Key management
- IV generation

**Key Methods:**
- `encrypt(data: string, key: CryptoKey): Promise<EncryptionResult>`
- `decrypt(encrypted: string, iv: string, key: CryptoKey): Promise<string>`
- `deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey>`
- `generateIV(): Uint8Array`

#### ImportExportService
**Responsibilities:**
- Format detection and parsing
- Data validation and sanitization
- Import/export workflows

**Key Methods:**
- `importCredentials(file: File, format: ImportFormat): Promise<Result<ImportReport>>`
- `exportCredentials(credentials: VaultCredential[], format: ExportFormat): Promise<Result<Blob>>`
- `detectFormat(file: File): Promise<ImportFormat>`
- `validateImportData(data: unknown, format: ImportFormat): Result<ValidatedData>`

### Database Schema

See `database/vault-schema-v2.sql` for complete schema with:
- Normalized tables for credentials, history, and expiration
- Comprehensive indexes for performance
- RLS policies for security
- Triggers for automation
- Functions for common operations

---

## Implementation Plan

### Phase 1: Infrastructure Setup (Week 1, Days 1-2)

**Tasks:**
1. Set up new directory structure (`lib/vault-v2`)
2. Create core type definitions
3. Create error hierarchy
4. Set up testing infrastructure (Jest, React Testing Library, Playwright)
5. Configure CI/CD pipeline updates

**Deliverables:**
- `lib/vault-v2/core/types.ts`
- `lib/vault-v2/core/errors.ts`
- `lib/vault-v2/core/constants.ts`
- `lib/vault-v2/core/validators.ts`
- `tests/vault-v2/setup.ts`

**Success Criteria:**
- All types compile without errors
- Test infrastructure runs successfully
- CI/CD pipeline validates new structure

### Phase 2: Database Layer (Week 1, Days 3-5)

**Tasks:**
1. Create new database schema (`vault-schema-v2.sql`)
2. Write migration script from old to new schema
3. Implement repository pattern
4. Add database utilities and helpers
5. Create indexes and optimize queries

**Deliverables:**
- `database/vault-schema-v2.sql`
- `database/migrate-v1-to-v2.sql`
- `lib/vault-v2/storage/repository.ts`
- `lib/vault-v2/storage/queries.ts`

**Success Criteria:**
- Schema creates successfully in test environment
- Migration script validated with sample data
- Repository pattern tested with mock data
- Query performance benchmarked

### Phase 3: Encryption Layer (Week 2, Days 1-3)

**Tasks:**
1. Implement encryption/decryption utilities
2. Create key management system
3. Build secure memory handling
4. Add encryption validation and testing

**Deliverables:**
- `lib/vault-v2/encryption/encryptor.ts`
- `lib/vault-v2/encryption/decryptor.ts`
- `lib/vault-v2/encryption/key-manager.ts`
- `tests/vault-v2/unit/encryption.test.ts`

**Success Criteria:**
- Encryption/decryption roundtrip successful
- Performance meets NFR-1.4 (<100ms per item)
- Security audit passes
- 100% test coverage for encryption

### Phase 4: Core Services (Week 2, Days 4-5 + Week 3, Days 1-2)

**Tasks:**
1. Build VaultService with CRUD operations
2. Implement ExpirationService
3. Create HistoryService
4. Add SearchService

**Deliverables:**
- `lib/vault-v2/services/vault.service.ts`
- `lib/vault-v2/services/expiration.service.ts`
- `lib/vault-v2/services/history.service.ts`
- `lib/vault-v2/services/search.service.ts`
- Unit tests for all services

**Success Criteria:**
- All CRUD operations functional
- Expiration logic tested with edge cases
- History tracking verified
- Search performance meets requirements

### Phase 5: Import/Export (Week 3, Days 3-4)

**Tasks:**
1. Implement import parsers (CSV, JSON, 1Password, etc.)
2. Build export formatters
3. Add validation and error handling
4. Create preview and conflict resolution

**Deliverables:**
- `lib/vault-v2/services/import-export.service.ts`
- `lib/vault-v2/utils/parsers.ts`
- `lib/vault-v2/utils/formatters.ts`
- Integration tests

**Success Criteria:**
- Support for 5+ import formats
- Validation catches malformed data
- Export preserves data integrity
- Large file handling tested (10,000+ items)

### Phase 6: Utilities & Helpers (Week 3, Day 5)

**Tasks:**
1. Password strength utilities
2. Expiration calculation utilities
3. Search and filter helpers
4. Validation utilities

**Deliverables:**
- `lib/vault-v2/utils/password.ts`
- `lib/vault-v2/utils/expiration.ts`
- `lib/vault-v2/utils/search.ts`
- `lib/vault-v2/utils/validation.ts`

**Success Criteria:**
- All utilities unit tested
- Performance optimized
- Edge cases handled

### Phase 7: UI Components (Week 4, Days 1-4)

**Tasks:**
1. Create component library structure
2. Build credential list/grid components
3. Implement forms and modals
4. Add expiration indicators
5. Create analytics dashboard components

**Deliverables:**
- `components/vault-v2/credentials/*`
- `components/vault-v2/expiration/*`
- `components/vault-v2/stats/*`
- `components/vault-v2/search/*`
- Component tests

**Success Criteria:**
- All components accessible (WCAG 2.1 AA)
- Responsive design validated
- Storybook documentation complete
- Component tests >80% coverage

### Phase 8: Next.js Pages (Week 4, Day 5 + Week 5, Days 1-2)

**Tasks:**
1. Create new vault routes (`app/vault-v2`)
2. Implement main vault page
3. Add detail/edit pages
4. Build import/export pages
5. Create settings page

**Deliverables:**
- `app/vault-v2/page.tsx`
- `app/vault-v2/[id]/*`
- `app/vault-v2/import/page.tsx`
- `app/vault-v2/export/page.tsx`
- E2E tests

**Success Criteria:**
- All routes functional
- SSR/CSR optimized
- Loading states implemented
- Error boundaries working

### Phase 9: Testing & Documentation (Week 5, Days 3-5)

**Tasks:**
1. Complete integration test suite
2. Run E2E test scenarios
3. Performance testing and optimization
4. Security audit
5. Documentation completion

**Deliverables:**
- Complete test suite
- Performance benchmarks
- Security audit report
- API documentation
- User guide updates

**Success Criteria:**
- >80% test coverage
- All performance NFRs met
- Security audit passed
- Documentation complete

---

## Testing Strategy

### Unit Testing

**Framework:** Jest + React Testing Library

**Coverage Areas:**
- All service methods
- Utility functions
- Encryption/decryption
- Validators and guards
- React hooks
- Error handling

**Coverage Target:** >80%

**Example Test Structure:**
```typescript
describe('VaultService', () => {
  describe('createCredential', () => {
    it('should encrypt and store credential', async () => {
      // Arrange
      const mockRepo = createMockRepository();
      const service = new VaultService(mockRepo, ...);
      
      // Act
      const result = await service.createCredential(validDTO);
      
      // Assert
      expect(result.success).toBe(true);
      expect(mockRepo.save).toHaveBeenCalled();
    });
    
    it('should return error for invalid data', async () => {
      // Test error cases
    });
  });
});
```

### Integration Testing

**Framework:** Jest

**Coverage Areas:**
- Service interactions
- Database operations
- Encryption workflows
- Import/export flows
- Complete user workflows

**Example Scenarios:**
- Create credential → Read → Update → Delete flow
- Import CSV → Validate → Save → Export flow
- Password expiration → Notification → Rotation flow

### End-to-End Testing

**Framework:** Playwright

**Coverage Areas:**
- Critical user paths
- UI interactions
- Cross-browser testing
- Mobile responsiveness
- Accessibility

**Example Scenarios:**
1. **Create Credential Flow**
   - Navigate to vault
   - Click "Add Credential"
   - Fill form
   - Submit
   - Verify in list

2. **Search & Filter**
   - Enter search query
   - Apply filters
   - Verify results
   - Clear filters

3. **Import Credentials**
   - Select file
   - Preview import
   - Confirm
   - Verify imported items

### Performance Testing

**Tools:** Lighthouse, WebPageTest, Custom benchmarks

**Metrics:**
- Time to Interactive (TTI)
- First Contentful Paint (FCP)
- Encryption/decryption speed
- Database query performance
- Memory usage

**Benchmarks:**
- Vault unlock: <500ms
- List 1000 items: <1s
- Search 1000 items: <300ms
- Encrypt/decrypt: <100ms per item

### Security Testing

**Activities:**
- Penetration testing
- Encryption validation
- XSS/CSRF protection
- SQL injection prevention
- Authentication bypass attempts
- Session hijacking tests

**Tools:**
- OWASP ZAP
- Burp Suite
- Custom security scripts

---

## Risk Management

### High-Priority Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Data loss during migration | Critical | Low | Comprehensive backups, phased rollout, rollback plan |
| Performance degradation | High | Medium | Extensive benchmarking, optimization phase, caching |
| Breaking changes in API | High | Low | Versioning strategy, gradual migration, feature flags |
| Security vulnerabilities | Critical | Low | Security audits, penetration testing, code review |
| User adoption issues | Medium | Medium | Training materials, gradual rollout, feedback loops |

### Mitigation Strategies

1. **Data Protection**
   - Automated backups before migration
   - Point-in-time recovery capability
   - Data validation at every step
   - Comprehensive audit logging

2. **Performance**
   - Load testing before production
   - Progressive enhancement approach
   - Caching strategies
   - Database query optimization

3. **Security**
   - Multiple security audits
   - Peer code reviews
   - Automated security scanning
   - Penetration testing

4. **User Experience**
   - Beta testing program
   - Gradual feature rollout
   - In-app guidance
   - Support documentation

---

## Success Criteria

### Technical Success Metrics

- ✅ All functional requirements implemented
- ✅ All non-functional requirements met
- ✅ >80% test coverage (unit + integration)
- ✅ Security audit passed
- ✅ Performance benchmarks achieved
- ✅ Zero critical bugs in production
- ✅ <1% error rate

### Business Success Metrics

- ✅ 100% data migration success rate
- ✅ <5% increase in support tickets
- ✅ User satisfaction >8/10
- ✅ Feature adoption >70% within 30 days
- ✅ Zero security incidents

### User Experience Metrics

- ✅ Page load time <2s
- ✅ Time to complete common tasks reduced by 30%
- ✅ Accessibility score >95
- ✅ Mobile usability score >90
- ✅ User engagement increased by 20%

---

## Deployment Plan

### Phase 1: Preparation (Week 6, Days 1-2)

1. **Code Freeze**
   - Freeze current vault features
   - Final testing of new system
   - Documentation review

2. **Infrastructure**
   - Database backup
   - Staging environment setup
   - Production deployment plan

3. **Communication**
   - User notification (7 days advance)
   - Internal team briefing
   - Support team training

### Phase 2: Staging Deployment (Week 6, Day 3)

1. Deploy to staging environment
2. Run full test suite
3. Performance validation
4. Security scan
5. Stakeholder review

### Phase 3: Production Rollout (Week 6, Days 4-5)

**Strategy:** Gradual rollout with feature flags

1. **10% Rollout** (Day 4 morning)
   - Enable for 10% of users
   - Monitor metrics closely
   - Gather initial feedback

2. **50% Rollout** (Day 4 afternoon, if 10% successful)
   - Expand to 50% of users
   - Continue monitoring
   - Address any issues

3. **100% Rollout** (Day 5, if 50% successful)
   - Enable for all users
   - Final monitoring
   - Celebration! 🎉

**Rollback Triggers:**
- Error rate >2%
- Performance degradation >20%
- Critical security issue
- Data inconsistency detected

### Phase 4: Post-Deployment (Week 7)

1. **Monitoring** (Days 1-3)
   - Error tracking
   - Performance monitoring
   - User behavior analytics

2. **Support** (Days 1-7)
   - Enhanced support availability
   - Issue tracking and resolution
   - User feedback collection

3. **Optimization** (Days 4-7)
   - Performance tuning based on real data
   - Bug fixes for edge cases
   - UI/UX refinements

---

## Maintenance Plan

### Regular Maintenance

**Daily:**
- Error log monitoring
- Performance metrics review
- Security event monitoring

**Weekly:**
- Dependency updates
- Performance optimization
- Bug triage and fixes

**Monthly:**
- Security audit
- Database optimization
- Feature usage analysis
- User feedback review

### Long-Term Roadmap

**Quarter 1 (Post-Launch):**
- Stability and performance optimization
- User feedback incorporation
- Minor feature additions

**Quarter 2:**
- Advanced search features
- Credential sharing (encrypted)
- Mobile app optimization

**Quarter 3:**
- Browser extension enhancements
- API for third-party integrations
- Enterprise features

**Quarter 4:**
- AI-powered password suggestions
- Advanced security analytics
- Biometric authentication

---

## Appendix

### A. Technology Stack

**Frontend:**
- Next.js 14 (App Router)
- React 18
- TypeScript 5
- Tailwind CSS
- Radix UI / Headless UI

**Backend:**
- Supabase (PostgreSQL + Auth)
- Row-Level Security (RLS)
- Edge Functions (if needed)

**Testing:**
- Jest (Unit/Integration)
- React Testing Library
- Playwright (E2E)
- MSW (API Mocking)

**DevOps:**
- Vercel (Hosting)
- GitHub Actions (CI/CD)
- Sentry (Error Tracking)
- Plausible/PostHog (Analytics)

### B. References

- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [NIST Digital Identity Guidelines](https://pages.nist.gov/800-63-3/)
- [Web Crypto API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [React Accessibility Guidelines](https://reactjs.org/docs/accessibility.html)

### C. Team & Contacts

**Development Team:**
- Technical Lead: [Name]
- Backend Developer: [Name]
- Frontend Developer: [Name]
- QA Engineer: [Name]

**Stakeholders:**
- Product Manager: [Name]
- Security Officer: [Name]
- UX Designer: [Name]

**Support:**
- Email: support@privault.app
- Slack: #privault-rebuild
- Documentation: docs.privault.app

---

## Document Control

- **Version:** 1.0
- **Last Updated:** October 9, 2025
- **Next Review:** November 9, 2025
- **Owner:** Engineering Team
- **Status:** Approved ✅

---

*This is a living document. Updates will be made as the project progresses.*

