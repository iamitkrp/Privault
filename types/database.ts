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
        };
        Insert: {
          id?: string;
          user_id: string;
          email: string;
          created_at?: string;
          updated_at?: string;
          salt: string;
          security_settings?: Record<string, any> | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          email?: string;
          created_at?: string;
          updated_at?: string;
          salt?: string;
          security_settings?: Record<string, any> | null;
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