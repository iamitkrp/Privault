import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

export type SecurityEventType =
    | 'login_success'
    | 'login_failure'
    | 'vault_unlocked'
    | 'vault_locked'
    | 'session_timeout'
    | 'master_password_changed'
    | 'suspicious_activity'
    | 'account_deletion_attempt'
    | 'otp_verified'
    | 'otp_failed';

export type EventSeverity = 'info' | 'warning' | 'critical';

/**
 * Security event service — records security-relevant events to the
 * `security_events` table for monitoring and suspicious activity detection.
 */
export class SecurityService {
    private static disabled = false;

    constructor(private supabase: SupabaseClient<Database>) { }

    /**
     * Logs a security event. Silently fails to never block auth flow.
     * Auto-disables itself if the table is inaccessible (403/404).
     */
    async logEvent(
        userId: string,
        eventType: SecurityEventType,
        severity: EventSeverity = 'info',
        details: Record<string, unknown> = {}
    ): Promise<void> {
        if (SecurityService.disabled) return;

        try {
            const { error } = await this.supabase
                .from('security_events')
                // @ts-expect-error
                .insert({
                    user_id: userId,
                    event_type: eventType,
                    severity,
                    details,
                    ip_address: null,
                    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
                });

            // If table doesn't exist or RLS blocks, disable for session
            if (error && (error.code === '42P01' || error.message?.includes('403') || error.code === 'PGRST204')) {
                SecurityService.disabled = true;
            }
        } catch {
            SecurityService.disabled = true;
        }
    }

    /**
     * Tracks a login attempt. If there are too many recent failures,
     * flags the event as suspicious.
     */
    async trackLoginAttempt(
        userId: string,
        success: boolean,
        email: string
    ): Promise<{ blocked: boolean; failureCount: number }> {
        const eventType: SecurityEventType = success ? 'login_success' : 'login_failure';
        const severity: EventSeverity = success ? 'info' : 'warning';

        await this.logEvent(userId, eventType, severity, { email });

        if (success) {
            return { blocked: false, failureCount: 0 };
        }

        // Check recent failures (last 30 minutes)
        try {
            const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
            const { data, error } = await this.supabase
                .from('security_events')
                .select('id')
                .eq('user_id', userId)
                .eq('event_type', 'login_failure')
                .gte('created_at', thirtyMinutesAgo);

            if (error || !data) return { blocked: false, failureCount: 0 };

            const failureCount = data.length;

            // Block after 5 failed attempts
            if (failureCount >= 5) {
                await this.logEvent(userId, 'suspicious_activity', 'critical', {
                    reason: 'Too many failed login attempts',
                    failure_count: failureCount,
                    email,
                });
                return { blocked: true, failureCount };
            }

            return { blocked: false, failureCount };
        } catch {
            return { blocked: false, failureCount: 0 };
        }
    }

    /**
     * Fetches recent security events for a user (for the settings/security page).
     */
    async getRecentEvents(
        userId: string,
        limit: number = 20
    ): Promise<Array<{
        event_type: string;
        severity: string;
        details: Record<string, unknown>;
        created_at: string;
    }>> {
        try {
            const { data, error } = await this.supabase
                .from('security_events')
                .select('event_type, severity, details, created_at')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error || !data) return [];
            return data as any[];
        } catch {
            return [];
        }
    }
}
