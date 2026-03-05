// ============================================
// PRIVAULT — Database Types (Supabase)
// ============================================
// This file will be auto-generated or manually updated
// to reflect the Supabase database schema.
//
// For now, it re-exports the core types that map to
// database tables. In Phase 1, this will be replaced
// with proper Supabase-generated types.

export type {
    EncryptedCredential,
    UserProfile,
    AuditLogEntry,
    SecurityEvent,
    OTPVerification,
    PasswordHistoryEntry,
} from "./index";

export interface Database {
    public: {
        Tables: {
            [key: string]: {
                Row: any;
                Insert: any;
                Update: any;
            };
        };
        Views: {
            [key: string]: {
                Row: any;
                Insert: any;
                Update: any;
            };
        };
        Functions: {
            [key: string]: {
                Args: any;
                Returns: any;
            };
        };
        Enums: {
            [key: string]: any;
        };
        CompositeTypes: {
            [key: string]: any;
        };
    };
}
