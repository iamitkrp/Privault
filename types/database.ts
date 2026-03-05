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
};

import type { UserProfile, EncryptedCredential } from "./index";

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: UserProfile;
                Insert: Partial<UserProfile> & { user_id: string, email: string, salt: string };
                Update: Partial<UserProfile>;
            };
            vault_credentials: {
                Row: EncryptedCredential;
                Insert: any;
                Update: any;
            };
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
