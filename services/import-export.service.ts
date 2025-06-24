import { vaultService } from './vault.service';
import { cryptoService } from './crypto.service';
import type { Credential } from '@/types';

export interface ExportData {
  version: string;
  timestamp: string;
  source: string;
  credentials: Credential[];
}

export interface ExportOptions {
  format: 'json' | 'csv';
  includePasswords: boolean;
  encrypted: boolean;
}

export interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors: string[];
  duplicates: number;
}

class ImportExportService {
  private readonly EXPORT_VERSION = '1.0.0';
  private readonly SUPPORTED_FORMATS = ['json', 'csv'] as const;

  /**
   * Export vault data in the specified format
   */
  async exportVault(
    userId: string, 
    options: ExportOptions
  ): Promise<{ success: boolean; data?: string; error?: string }> {
    try {
      // Load current vault data
      const vaultResult = await vaultService.loadVault(userId);
      if (!vaultResult.success) {
        return { success: false, error: 'Failed to load vault data' };
      }

      const credentials = vaultResult.credentials || [];
      
      // Prepare export data
      const exportData: ExportData = {
        version: this.EXPORT_VERSION,
        timestamp: new Date().toISOString(),
        source: 'Privault',
        credentials: options.includePasswords 
          ? credentials 
          : credentials.map(cred => ({ ...cred, password: '[HIDDEN]' }))
      };

      let exportString: string;
      
      if (options.format === 'json') {
        exportString = JSON.stringify(exportData, null, 2);
      } else if (options.format === 'csv') {
        exportString = this.convertToCSV(exportData.credentials);
      } else {
        return { success: false, error: 'Unsupported export format' };
      }

      // Encrypt if requested
      if (options.encrypted) {
        // For export encryption, we'll use the raw encryption without vault items structure
        // This feature can be implemented later when needed
        return { success: false, error: 'Encrypted export feature not yet implemented' };
      }

      return { success: true, data: exportString };
    } catch (error) {
      console.error('Export error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown export error' 
      };
    }
  }

  /**
   * Import vault data from various formats
   */
  async importVault(
    userId: string, 
    data: string, 
    format: 'json' | 'csv' | 'auto' = 'auto'
  ): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      imported: 0,
      skipped: 0,
      errors: [],
      duplicates: 0
    };

    try {
      let credentials: Partial<Credential>[] = [];
      
      // Auto-detect format if needed
      if (format === 'auto') {
        format = this.detectFormat(data);
      }

      // Parse data based on format
      if (format === 'json') {
        credentials = await this.parseJSON(data);
      } else if (format === 'csv') {
        credentials = this.parseCSV(data);
      } else {
        result.errors.push('Unsupported import format');
        return result;
      }

      if (credentials.length === 0) {
        result.errors.push('No valid credentials found in import data');
        return result;
      }

      // Load existing vault to check for duplicates
      const existingVault = await vaultService.loadVault(userId);
      const existingCredentials = existingVault.success ? (existingVault.credentials || []) : [];
      const existingSites = new Set(existingCredentials.map(c => c.site.toLowerCase()));

      // Process each credential
      for (const credentialData of credentials) {
        try {
          // Validate required fields
          if (!credentialData.site || !credentialData.username) {
            result.skipped++;
            result.errors.push(`Skipped credential: missing required fields (site: ${credentialData.site}, username: ${credentialData.username})`);
            continue;
          }

          // Check for duplicates
          const siteKey = credentialData.site.toLowerCase();
          if (existingSites.has(siteKey)) {
            result.duplicates++;
            result.skipped++;
            continue;
          }

          // Create credential object
          const credential: Omit<Credential, 'id' | 'vault_id' | 'created_at' | 'updated_at'> = {
            site: credentialData.site,
            username: credentialData.username,
            password: credentialData.password || this.generateTemporaryPassword(),
            url: credentialData.url || '',
            notes: credentialData.notes || '',
            category: this.validateCategory(credentialData.category),
            isFavorite: credentialData.isFavorite || false,
            tags: Array.isArray(credentialData.tags) ? credentialData.tags : [],
            passwordStrength: credentialData.passwordStrength || 0,
            lastPasswordChange: credentialData.lastPasswordChange || new Date().toISOString(),
            accessCount: credentialData.accessCount || 0
          };

          // Add to vault
          const addResult = await vaultService.addCredential(userId, credential);
          if (addResult.success) {
            result.imported++;
            existingSites.add(siteKey); // Track for duplicate checking
          } else {
            result.skipped++;
            result.errors.push(`Failed to import ${credential.site}: ${addResult.error}`);
          }
        } catch (error) {
          result.skipped++;
          result.errors.push(`Error processing credential: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      result.success = result.imported > 0;
      return result;
    } catch (error) {
      console.error('Import error:', error);
      result.errors.push(error instanceof Error ? error.message : 'Unknown import error');
      return result;
    }
  }

  /**
   * Parse JSON import data (supports multiple formats)
   */
  private async parseJSON(data: string): Promise<Partial<Credential>[]> {
    try {
      const parsed = JSON.parse(data);
      
      // Check if it's encrypted
      if (parsed.encrypted) {
        throw new Error('Encrypted imports are not yet supported');
      }

      // Privault format
      if (parsed.source === 'Privault' && Array.isArray(parsed.credentials)) {
        return parsed.credentials;
      }

      // Generic array format
      if (Array.isArray(parsed)) {
        return parsed;
      }

      // Single credential object
      if (parsed.site || parsed.name || parsed.title) {
        return [this.normalizeCredential(parsed)];
      }

      // Common password manager formats
      if (parsed.logins && Array.isArray(parsed.logins)) {
        return parsed.logins.map((login: any) => this.normalizeCredential(login));
      }

      throw new Error('Unrecognized JSON format');
    } catch (error) {
      throw new Error(`JSON parsing error: ${error instanceof Error ? error.message : 'Invalid JSON'}`);
    }
  }

  /**
   * Parse CSV import data
   */
  private parseCSV(data: string): Partial<Credential>[] {
    const lines = data.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];

    // Parse header to determine column mapping
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
    const credentials: Partial<Credential>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      if (values.length !== headers.length) continue;

      const credential: Partial<Credential> = {};
      
      headers.forEach((header, index) => {
        const value = values[index]?.replace(/"/g, '').trim();
        if (!value) return;

        // Map common column names to our fields
        switch (header) {
          case 'name':
          case 'title':
          case 'site':
          case 'website':
          case 'domain':
            credential.site = value;
            break;
          case 'username':
          case 'user':
          case 'email':
          case 'login':
            credential.username = value;
            break;
          case 'password':
          case 'pass':
            credential.password = value;
            break;
          case 'url':
          case 'website_url':
          case 'link':
            credential.url = value;
            break;
          case 'notes':
          case 'note':
          case 'comments':
            credential.notes = value;
            break;
          case 'category':
          case 'folder':
            credential.category = this.validateCategory(value);
            break;
        }
      });

      if (credential.site && credential.username) {
        credentials.push(credential);
      }
    }

    return credentials;
  }

  /**
   * Parse a single CSV line handling quotes and commas
   */
  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
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

  /**
   * Convert credentials to CSV format
   */
  private convertToCSV(credentials: Credential[]): string {
    const headers = ['Site', 'Username', 'Password', 'URL', 'Notes', 'Category', 'Favorite', 'Tags'];
    const csvLines = [headers.join(',')];

    credentials.forEach(cred => {
      const row = [
        this.escapeCSV(cred.site),
        this.escapeCSV(cred.username),
        this.escapeCSV(cred.password),
        this.escapeCSV(cred.url || ''),
        this.escapeCSV(cred.notes || ''),
        this.escapeCSV(cred.category || ''),
        cred.isFavorite ? 'Yes' : 'No',
        this.escapeCSV((cred.tags || []).join('; '))
      ];
      csvLines.push(row.join(','));
    });

    return csvLines.join('\n');
  }

  /**
   * Escape CSV values
   */
  private escapeCSV(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  /**
   * Detect import format
   */
  private detectFormat(data: string): 'json' | 'csv' {
    const trimmed = data.trim();
    return (trimmed.startsWith('{') || trimmed.startsWith('[')) ? 'json' : 'csv';
  }

  /**
   * Normalize credential data from various formats
   */
  private normalizeCredential(data: any): Partial<Credential> {
    return {
      site: data.site || data.name || data.title || data.hostname || '',
      username: data.username || data.user || data.email || data.login || '',
      password: data.password || data.pass || '',
      url: data.url || data.website || data.uri || '',
      notes: data.notes || data.note || data.comments || '',
      category: this.validateCategory(data.category || data.folder),
      isFavorite: Boolean(data.favorite || data.isFavorite),
      tags: Array.isArray(data.tags) ? data.tags : []
    };
  }

  /**
   * Validate and normalize category
   */
  private validateCategory(category?: string): string {
    if (!category) return 'OTHER';
    
    const validCategories = ['SOCIAL', 'WORK', 'SHOPPING', 'ENTERTAINMENT', 'UTILITIES', 'DEVELOPMENT', 'PERSONAL', 'OTHER'];
    const normalized = category.toUpperCase();
    
    return validCategories.includes(normalized) ? normalized : 'OTHER';
  }

  /**
   * Generate a temporary password for import entries without passwords
   */
  private generateTemporaryPassword(): string {
    return `TEMP_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Create a backup filename
   */
  createBackupFilename(format: 'json' | 'csv', encrypted: boolean = false): string {
    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const suffix = encrypted ? '.encrypted' : '';
    return `privault-backup-${timestamp}${suffix}.${format}`;
  }
}

export const importExportService = new ImportExportService(); 