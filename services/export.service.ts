import { VaultCredential } from '@/types';

/**
 * Export service — operates entirely on decrypted client-side data.
 * No server round-trip needed. Zero-knowledge architecture preserved.
 */

/**
 * Exports credentials as a JSON file download.
 */
export function exportToJSON(credentials: VaultCredential[]): void {
    const exportData = credentials.map(c => ({
        site_name: c.decrypted.site_name,
        username: c.decrypted.username,
        password: c.decrypted.password,
        url: c.decrypted.url || '',
        notes: c.decrypted.notes || '',
        category: c.category,
        tags: c.tags,
        is_favorite: c.is_favorite,
        created_at: c.created_at,
    }));

    const json = JSON.stringify(exportData, null, 2);
    downloadFile(json, 'privault-export.json', 'application/json');
}

/**
 * Exports credentials as a CSV file download.
 */
export function exportToCSV(credentials: VaultCredential[]): void {
    const headers = ['site_name', 'username', 'password', 'url', 'notes', 'category', 'tags', 'is_favorite'];
    const rows = credentials.map(c => [
        escapeCsv(c.decrypted.site_name),
        escapeCsv(c.decrypted.username),
        escapeCsv(c.decrypted.password),
        escapeCsv(c.decrypted.url || ''),
        escapeCsv(c.decrypted.notes || ''),
        escapeCsv(c.category),
        escapeCsv(c.tags.join('; ')),
        c.is_favorite ? 'true' : 'false',
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadFile(csv, 'privault-export.csv', 'text/csv');
}

function escapeCsv(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
}

function downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
