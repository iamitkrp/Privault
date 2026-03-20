import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

export type AuditAction =
    | 'credential_created'
    | 'credential_read'
    | 'credential_updated'
    | 'credential_deleted'
    | 'vault_unlocked'
    | 'vault_locked'
    | 'master_password_changed'
    | 'data_exported'
    | 'data_imported'
    | 'note_created'
    | 'note_read'
    | 'note_updated'
    | 'note_deleted';

/**
 * Audit logging service — records all significant vault actions
 * into the `audit_log` table for security trail purposes.
 */
export class AuditService {
    constructor(private supabase: SupabaseClient<Database>) { }

    /**
     * Logs an action to the audit trail.
     * Silently fails — audit logging should never block the main operation.
     */
    async logAction(
        userId: string,
        action: AuditAction,
        entityType?: string,
        entityId?: string,
        metadata?: Record<string, unknown>
    ): Promise<void> {
        try {
            await this.supabase
                .from('audit_log')
                // @ts-expect-error - Database types are restrictive
                .insert({
                    user_id: userId,
                    action,
                    entity_type: entityType || null,
                    entity_id: entityId || null,
                    metadata: metadata || {},
                    ip_address: null,     // Client-side — we don't have the IP here
                    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
                });
        } catch (e) {
            // Silently fail — never block the main operation
            console.warn('Audit log failed:', e);
        }
    }
}
