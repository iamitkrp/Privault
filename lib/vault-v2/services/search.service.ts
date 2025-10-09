/**
 * Privault Vault V2 - Search Service
 * 
 * Client-side fuzzy search implementation using Fuse.js.
 * Provides privacy-preserving search without server-side indexing.
 * 
 * TODO: Install fuse.js package to enable this service
 * npm install fuse.js
 * npm install --save-dev @types/fuse.js
 */

import { DecryptedCredential } from '../core/types';

// Uncomment when fuse.js is installed
// import Fuse from 'fuse.js';

export interface SearchOptions {
  threshold?: number; // 0.0 = perfect match, 1.0 = match anything
  limit?: number;
  includeScore?: boolean;
}

export interface SearchResult<T> {
  item: T;
  score?: number;
}

/**
 * Search Service for client-side credential search
 */
export class SearchService {
  // private searchIndex: Fuse<DecryptedCredential> | null = null;
  private credentials: DecryptedCredential[] = [];

  /**
   * Build search index from decrypted credentials
   * Call this after vault unlock or when credentials change
   */
  buildIndex(credentials: DecryptedCredential[]): void {
    this.credentials = credentials;

    // TODO: Uncomment when fuse.js is installed
    // this.searchIndex = new Fuse(credentials, {
    //   keys: [
    //     { name: 'decrypted_data.site', weight: 0.5 },
    //     { name: 'decrypted_data.username', weight: 0.3 },
    //     { name: 'decrypted_data.url', weight: 0.1 },
    //     { name: 'decrypted_data.notes', weight: 0.1 },
    //     { name: 'tags', weight: 0.2 },
    //   ],
    //   threshold: 0.3,
    //   includeScore: true,
    //   minMatchCharLength: 2,
    //   ignoreLocation: true,
    // });
  }

  /**
   * Search credentials using fuzzy matching
   */
  search(query: string, options: SearchOptions = {}): SearchResult<DecryptedCredential>[] {
    if (!query || query.trim().length === 0) {
      return this.credentials.map(item => ({ item }));
    }

    // TODO: Use Fuse.js when available
    // if (this.searchIndex) {
    //   const fuseResults = this.searchIndex.search(query, {
    //     limit: options.limit,
    //   });
    //   
    //   return fuseResults.map(result => ({
    //     item: result.item,
    //     score: options.includeScore ? result.score : undefined,
    //   }));
    // }

    // Fallback: Simple substring search
    const searchLower = query.toLowerCase();
    const results: SearchResult<DecryptedCredential>[] = [];

    for (const credential of this.credentials) {
      const { site, username, url, notes } = credential.decrypted_data;
      
      const matchesSite = site.toLowerCase().includes(searchLower);
      const matchesUsername = username.toLowerCase().includes(searchLower);
      const matchesUrl = url?.toLowerCase().includes(searchLower) || false;
      const matchesNotes = notes?.toLowerCase().includes(searchLower) || false;
      const matchesTags = credential.tags.some(tag => tag.toLowerCase().includes(searchLower));

      if (matchesSite || matchesUsername || matchesUrl || matchesNotes || matchesTags) {
        results.push({ item: credential });
      }
    }

    if (options.limit) {
      return results.slice(0, options.limit);
    }

    return results;
  }

  /**
   * Refresh index after credential changes
   */
  updateCredential(credential: DecryptedCredential): void {
    const index = this.credentials.findIndex(c => c.id === credential.id);
    if (index !== -1) {
      this.credentials[index] = credential;
    } else {
      this.credentials.push(credential);
    }
    
    // Rebuild index with updated credentials
    this.buildIndex(this.credentials);
  }

  /**
   * Remove credential from index
   */
  removeCredential(credentialId: string): void {
    this.credentials = this.credentials.filter(c => c.id !== credentialId);
    this.buildIndex(this.credentials);
  }

  /**
   * Clear search index (on vault lock)
   */
  clearIndex(): void {
    this.credentials = [];
    // this.searchIndex = null;
  }

  /**
   * Get index status
   */
  getIndexStatus(): { isBuilt: boolean; credentialCount: number } {
    return {
      isBuilt: this.credentials.length > 0,
      credentialCount: this.credentials.length,
    };
  }
}

/**
 * Factory function to create a search service instance
 */
export function createSearchService(): SearchService {
  return new SearchService();
}

