/**
 * Unit tests for import/export services.
 * These are pure functions that can be tested without mocking Supabase.
 */
import { parseJSON, parseCSV } from '@/services/import.service';

describe('Import Service', () => {
    describe('parseJSON', () => {
        it('should parse a valid JSON array of credentials', () => {
            const input = JSON.stringify([
                { site_name: 'GitHub', username: 'user1', password: 'pass1' },
                { site_name: 'Twitter', username: 'user2', password: 'pass2', url: 'https://twitter.com' },
            ]);
            const result = parseJSON(input);
            expect(result.credentials).toHaveLength(2);
            expect(result.errors).toHaveLength(0);
            expect(result.skipped).toBe(0);
            expect(result.credentials[0]!.site_name).toBe('GitHub');
            expect(result.credentials[1]!.url).toBe('https://twitter.com');
        });

        it('should skip entries missing site_name', () => {
            const input = JSON.stringify([
                { username: 'user1', password: 'pass1' },
                { site_name: 'Valid', username: 'u', password: 'p' },
            ]);
            const result = parseJSON(input);
            expect(result.credentials).toHaveLength(1);
            expect(result.skipped).toBe(1);
            expect(result.errors).toHaveLength(1);
        });

        it('should return error for non-array JSON', () => {
            const input = JSON.stringify({ site_name: 'Test' });
            const result = parseJSON(input);
            expect(result.credentials).toHaveLength(0);
            expect(result.errors[0]).toContain('array');
        });

        it('should return error for invalid JSON', () => {
            const result = parseJSON('not-valid-json}]{');
            expect(result.credentials).toHaveLength(0);
            expect(result.errors[0]).toContain('Invalid JSON');
        });

        it('should handle empty password and username gracefully', () => {
            const input = JSON.stringify([
                { site_name: 'NoPass' },
            ]);
            const result = parseJSON(input);
            expect(result.credentials).toHaveLength(1);
            expect(result.credentials[0]!.username).toBe('');
            expect(result.credentials[0]!.password).toBe('');
        });
    });

    describe('parseCSV', () => {
        it('should parse a valid CSV string', () => {
            const input = 'site_name,username,password,url,notes\nGitHub,user1,pass1,https://github.com,My notes\nTwitter,user2,pass2,,';
            const result = parseCSV(input);
            expect(result.credentials).toHaveLength(2);
            expect(result.errors).toHaveLength(0);
            expect(result.credentials[0]!.site_name).toBe('GitHub');
            expect(result.credentials[0]!.url).toBe('https://github.com');
            expect(result.credentials[0]!.notes).toBe('My notes');
        });

        it('should handle quoted CSV fields', () => {
            const input = 'site_name,username,password\n"My, Site",user1,"pass,word"';
            const result = parseCSV(input);
            expect(result.credentials).toHaveLength(1);
            expect(result.credentials[0]!.site_name).toBe('My, Site');
            expect(result.credentials[0]!.password).toBe('pass,word');
        });

        it('should skip rows with missing site_name', () => {
            const input = 'site_name,username,password\n,user1,pass1\nValid,user2,pass2';
            const result = parseCSV(input);
            expect(result.credentials).toHaveLength(1);
            expect(result.skipped).toBe(1);
        });

        it('should return error for header-only CSV', () => {
            const result = parseCSV('site_name,username,password');
            expect(result.credentials).toHaveLength(0);
            expect(result.errors[0]).toContain('header row');
        });

        it('should accept "name" as alternative to "site_name"', () => {
            const input = 'name,username,password\nGitHub,user1,pass1';
            const result = parseCSV(input);
            expect(result.credentials).toHaveLength(1);
            expect(result.credentials[0]!.site_name).toBe('GitHub');
        });
    });
});
