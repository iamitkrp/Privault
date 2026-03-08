import { DecryptedCredential } from '@/types';

/**
 * Import service — parses CSV or JSON text into DecryptedCredential arrays.
 * Validates required fields before returning.
 */

export interface ImportResult {
    credentials: DecryptedCredential[];
    errors: string[];
    skipped: number;
}

/**
 * Parses a JSON string into an array of DecryptedCredentials.
 */
export function parseJSON(text: string): ImportResult {
    const errors: string[] = [];
    let skipped = 0;
    const credentials: DecryptedCredential[] = [];

    try {
        const parsed = JSON.parse(text);
        if (!Array.isArray(parsed)) {
            return { credentials: [], errors: ['JSON must be an array of objects.'], skipped: 0 };
        }

        for (let i = 0; i < parsed.length; i++) {
            const item = parsed[i];
            if (!item.site_name || typeof item.site_name !== 'string') {
                errors.push(`Row ${i + 1}: Missing or invalid site_name.`);
                skipped++;
                continue;
            }

            credentials.push({
                site_name: item.site_name,
                username: item.username || '',
                password: item.password || '',
                url: item.url || undefined,
                notes: item.notes || undefined,
            });
        }
    } catch (e) {
        return { credentials: [], errors: ['Invalid JSON format.'], skipped: 0 };
    }

    return { credentials, errors, skipped };
}

/**
 * Parses a CSV string into an array of DecryptedCredentials.
 * Expects headers: site_name, username, password, url, notes
 */
export function parseCSV(text: string): ImportResult {
    const errors: string[] = [];
    let skipped = 0;
    const credentials: DecryptedCredential[] = [];

    const lines = text.trim().split('\n');
    if (lines.length < 2) {
        return { credentials: [], errors: ['CSV must have a header row and at least one data row.'], skipped: 0 };
    }

    const headers = lines[0]!.split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
    const siteIdx = headers.indexOf('site_name');
    const nameIdx = siteIdx === -1 ? headers.indexOf('name') : siteIdx;
    const userIdx = headers.indexOf('username');
    const passIdx = headers.indexOf('password');
    const urlIdx = headers.indexOf('url');
    const notesIdx = headers.indexOf('notes');

    if (nameIdx === -1) {
        const altName = headers.indexOf('title') !== -1 ? headers.indexOf('title') : headers.indexOf('website');
        if (altName === -1) {
            return { credentials: [], errors: ['CSV must have a "site_name", "name", "title", or "website" column.'], skipped: 0 };
        }
    }

    const resolvedNameIdx = nameIdx !== -1 ? nameIdx : (headers.indexOf('title') !== -1 ? headers.indexOf('title') : headers.indexOf('website'));

    for (let i = 1; i < lines.length; i++) {
        const values = parseCsvLine(lines[i]!);
        const siteName = (values[resolvedNameIdx] || '').trim();

        if (!siteName) {
            errors.push(`Row ${i + 1}: Missing site_name.`);
            skipped++;
            continue;
        }

        credentials.push({
            site_name: siteName,
            username: (values[userIdx] || '').trim(),
            password: (values[passIdx] || '').trim(),
            url: (values[urlIdx] || '').trim() || undefined,
            notes: (values[notesIdx] || '').trim() || undefined,
        });
    }

    return { credentials, errors, skipped };
}

/**
 * Basic CSV line parser that handles quoted fields.
 */
function parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    return result;
}
