/**
 * Privault Vault V2 - Expiration Service
 * 
 * Manages password expiration logic and events.
 */

import { supabase } from '@/lib/supabase/client';
import { IExpirationService } from './vault.service';
import { ExpirationStatus } from '../core/types';

/**
 * Expiration Service Implementation
 */
export class ExpirationService implements IExpirationService {
  constructor(private readonly userId: string) {}

  /**
   * Calculate expiration date from days
   */
  calculateExpirationDate(days: number | null): Date | null {
    if (days === null || days <= 0) {
      return null;
    }

    const now = new Date();
    const expirationDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    return expirationDate;
  }

  /**
   * Calculate expiration status based on expiration date
   */
  calculateExpirationStatus(expiresAt: Date | null): ExpirationStatus {
    if (!expiresAt) {
      return ExpirationStatus.ACTIVE;
    }

    const now = new Date();
    const timeUntilExpiry = expiresAt.getTime() - now.getTime();
    const daysUntilExpiry = timeUntilExpiry / (24 * 60 * 60 * 1000);

    if (daysUntilExpiry < 0) {
      return ExpirationStatus.EXPIRED;
    } else if (daysUntilExpiry <= 7) {
      return ExpirationStatus.EXPIRING_SOON;
    } else {
      return ExpirationStatus.ACTIVE;
    }
  }

  /**
   * Log an expiration event
   */
  async logExpirationEvent(
    credentialId: string,
    eventType: 'expiration_warning_7d' | 'expiration_warning_3d' | 'expiration_warning_1d' | 'expired' | 'rotated' | 'expiration_set' | 'expiration_extended',
    metadata?: Record<string, unknown>
  ): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client not configured');
    }

    try {
      const { error } = await supabase
        .from('expiration_events')
        .insert({
          user_id: this.userId,
          credential_id: credentialId,
          event_type: eventType,
          metadata: metadata || {},
        });

      if (error) {
        throw new Error(`Failed to log expiration event: ${error.message}`);
      }
    } catch (error) {
      console.error('Failed to log expiration event:', error);
      // Don't throw - logging is non-critical
    }
  }

  /**
   * Get credentials expiring within a certain number of days
   */
  async getExpiringCredentials(days: number = 7): Promise<string[]> {
    if (!supabase) {
      throw new Error('Supabase client not configured');
    }

    try {
      const now = new Date();
      const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

      const { data, error } = await supabase
        .from('vault_credentials')
        .select('credential_id')
        .eq('user_id', this.userId)
        .eq('is_deleted', false)
        .not('expires_at', 'is', null)
        .gte('expires_at', now.toISOString())
        .lte('expires_at', futureDate.toISOString());

      if (error) {
        throw new Error(`Failed to get expiring credentials: ${error.message}`);
      }

      return (data || []).map(item => item.credential_id);
    } catch (error) {
      throw new Error(
        `Failed to get expiring credentials: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get unacknowledged expiration events
   */
  async getUnacknowledgedEvents(): Promise<any[]> {
    if (!supabase) {
      throw new Error('Supabase client not configured');
    }

    try {
      const { data, error } = await supabase
        .from('expiration_events')
        .select('*')
        .eq('user_id', this.userId)
        .eq('acknowledged', false)
        .order('triggered_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to get unacknowledged events: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      throw new Error(
        `Failed to get unacknowledged events: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Acknowledge an expiration event
   */
  async acknowledgeEvent(eventId: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client not configured');
    }

    try {
      const { error } = await supabase
        .from('expiration_events')
        .update({
          acknowledged: true,
          acknowledged_at: new Date().toISOString(),
        })
        .eq('id', eventId)
        .eq('user_id', this.userId);

      if (error) {
        throw new Error(`Failed to acknowledge event: ${error.message}`);
      }
    } catch (error) {
      throw new Error(
        `Failed to acknowledge expiration event: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

/**
 * Factory function to create an expiration service instance
 */
export function createExpirationService(userId: string): IExpirationService {
  return new ExpirationService(userId);
}

