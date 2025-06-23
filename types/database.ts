// Supabase Database Types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          created_at: string;
          updated_at: string;
          salt: string;
          security_settings: Record<string, any> | null;
          vault_verification_data: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          email: string;
          created_at?: string;
          updated_at?: string;
          salt: string;
          security_settings?: Record<string, any> | null;
          vault_verification_data?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          email?: string;
          created_at?: string;
          updated_at?: string;
          salt?: string;
          security_settings?: Record<string, any> | null;
          vault_verification_data?: string | null;
        };
      };
      vaults: {
        Row: {
          id: string;
          user_id: string;
          encrypted_data: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          encrypted_data: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          encrypted_data?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      vault_items: {
        Row: {
          id: string;
          user_id: string;
          credential_id: string;
          encrypted_credential: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          credential_id: string;
          encrypted_credential: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          credential_id?: string;
          encrypted_credential?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      password_history: {
        Row: {
          id: string;
          user_id: string;
          credential_id: string;
          old_password_hash: string;
          changed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          credential_id: string;
          old_password_hash: string;
          changed_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          credential_id?: string;
          old_password_hash?: string;
          changed_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Helper types for easier access
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type Vault = Database['public']['Tables']['vaults']['Row'];
export type VaultInsert = Database['public']['Tables']['vaults']['Insert'];
export type VaultUpdate = Database['public']['Tables']['vaults']['Update'];

export type VaultItem = Database['public']['Tables']['vault_items']['Row'];
export type VaultItemInsert = Database['public']['Tables']['vault_items']['Insert'];
export type VaultItemUpdate = Database['public']['Tables']['vault_items']['Update'];

export type PasswordHistory = Database['public']['Tables']['password_history']['Row'];
export type PasswordHistoryInsert = Database['public']['Tables']['password_history']['Insert'];
export type PasswordHistoryUpdate = Database['public']['Tables']['password_history']['Update']; 