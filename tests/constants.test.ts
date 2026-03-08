/**
 * Unit tests for constants and validation rules.
 */
import { CRYPTO_CONFIG, SESSION_CONFIG, VALIDATION, CATEGORIES, STRENGTH_LABELS, AUDIT_ACTIONS, ERROR_MESSAGES } from '@/constants';

describe('Constants', () => {
    describe('CRYPTO_CONFIG', () => {
        it('should use AES-GCM algorithm', () => {
            expect(CRYPTO_CONFIG.algorithm).toBe('AES-GCM');
        });

        it('should use 256-bit key length', () => {
            expect(CRYPTO_CONFIG.keyLength).toBe(256);
        });

        it('should use 12-byte IV (NIST recommended)', () => {
            expect(CRYPTO_CONFIG.ivLength).toBe(12);
        });

        it('should use 128-bit tag length', () => {
            expect(CRYPTO_CONFIG.tagLength).toBe(128);
        });

        it('should use at least 100,000 PBKDF2 iterations', () => {
            expect(CRYPTO_CONFIG.iterations).toBeGreaterThanOrEqual(100_000);
        });

        it('should use SHA-256 for hashing', () => {
            expect(CRYPTO_CONFIG.hashAlgorithm).toBe('SHA-256');
        });

        it('should use 32-byte salt', () => {
            expect(CRYPTO_CONFIG.saltLength).toBe(32);
        });
    });

    describe('SESSION_CONFIG', () => {
        it('should auto-lock after 15 minutes', () => {
            expect(SESSION_CONFIG.timeoutMs).toBe(15 * 60 * 1000);
        });

        it('should show warning 2 minutes before timeout', () => {
            expect(SESSION_CONFIG.warningBeforeTimeoutMs).toBe(2 * 60 * 1000);
        });

        it('should clear clipboard after 30 seconds', () => {
            expect(SESSION_CONFIG.clipboardClearMs).toBe(30 * 1000);
        });

        it('should listen to essential activity events', () => {
            expect(SESSION_CONFIG.activityEvents).toContain('mousedown');
            expect(SESSION_CONFIG.activityEvents).toContain('keydown');
        });
    });

    describe('VALIDATION', () => {
        it('should require minimum 8 character passwords', () => {
            expect(VALIDATION.password.minLength).toBe(8);
        });

        it('should set 6-digit OTP length', () => {
            expect(VALIDATION.otp.length).toBe(6);
        });

        it('should set 10-minute OTP expiry', () => {
            expect(VALIDATION.otp.expiryMs).toBe(10 * 60 * 1000);
        });

        it('should limit imports to 10MB', () => {
            expect(VALIDATION.import.maxFileSize).toBe(10 * 1024 * 1024);
        });
    });

    describe('CATEGORIES', () => {
        it('should have 10 categories', () => {
            expect(CATEGORIES).toHaveLength(10);
        });

        it('should include "social" and "work"', () => {
            const values = CATEGORIES.map(c => c.value);
            expect(values).toContain('social');
            expect(values).toContain('work');
        });
    });

    describe('STRENGTH_LABELS', () => {
        it('should have 5 strength levels (0-4)', () => {
            expect(STRENGTH_LABELS).toHaveLength(5);
            expect(STRENGTH_LABELS[0].score).toBe(0);
            expect(STRENGTH_LABELS[4].score).toBe(4);
        });
    });

    describe('ERROR_MESSAGES', () => {
        it('should have vague auth error messages (security)', () => {
            expect(ERROR_MESSAGES.auth.invalidCredentials).not.toContain('password is wrong');
            expect(ERROR_MESSAGES.auth.invalidCredentials).toContain('Invalid');
        });

        it('should have generic vault errors', () => {
            expect(ERROR_MESSAGES.vault.unlockFailed).toBeDefined();
            expect(ERROR_MESSAGES.vault.encryptionFailed).toBeDefined();
        });
    });

    describe('AUDIT_ACTIONS', () => {
        it('should define all CRUD actions', () => {
            expect(AUDIT_ACTIONS.CREDENTIAL_CREATED).toBe('credential_created');
            expect(AUDIT_ACTIONS.CREDENTIAL_UPDATED).toBe('credential_updated');
            expect(AUDIT_ACTIONS.CREDENTIAL_DELETED).toBe('credential_deleted');
        });

        it('should define master password change action', () => {
            expect(AUDIT_ACTIONS.MASTER_PASSWORD_CHANGED).toBe('master_password_changed');
        });
    });
});
