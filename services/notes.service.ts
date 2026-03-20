import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import {
    Result,
    EncryptedNote,
    DecryptedNote,
    VaultNote
} from '@/types';
import { encryptData, decryptData } from '@/lib/crypto/engine';
import { passphraseManager } from '@/lib/crypto/passphrase';
import { AuditService } from './audit.service';

export class NotesService {
    private audit: AuditService;
    constructor(private supabase: SupabaseClient<Database>) {
        this.audit = new AuditService(supabase);
    }

    private getActiveKey(): CryptoKey {
        try {
            return passphraseManager.getKey();
        } catch {
            throw new Error("Vault is locked");
        }
    }

    private async decryptNoteRow(row: EncryptedNote, key: CryptoKey): Promise<VaultNote> {
        const decryptedJsonStr = await decryptData(row.encrypted_data, row.iv, key);
        const decrypted: DecryptedNote = JSON.parse(decryptedJsonStr);

        return {
            id: row.id,
            decrypted,
            color: row.color,
            tags: row.tags,
            is_pinned: row.is_pinned,
            is_locked: row.is_locked,
            created_at: row.created_at,
            updated_at: row.updated_at
        };
    }

    async getNotes(): Promise<Result<VaultNote[]>> {
        try {
            const key = this.getActiveKey();

            const { data, error } = await this.supabase
                .from('notes')
                .select('*')
                .order('is_pinned', { ascending: false })
                .order('updated_at', { ascending: false });

            if (error) {
                console.error("Fetch DB Error. Code:", error?.code);
                return { success: false, error: new Error("Unable to load notes.") };
            }

            if (!data) return { success: true, data: [] };

            const decryptedRows = await Promise.all(
                data.map(row => this.decryptNoteRow(row as unknown as EncryptedNote, key))
            );

            try {
                const { data: { user } } = await this.supabase.auth.getUser();
                if (user?.id) {
                    this.audit.logAction(user.id, 'note_read', 'notes', undefined, { count: decryptedRows.length });
                }
            } catch { /* non-blocking */ }

            return { success: true, data: decryptedRows };

        } catch (e) {
            console.error('Failed to get notes.', e);
            return { success: false, error: new Error("Unable to load notes.") };
        }
    }

    async addNote(
        userId: string,
        decrypted: DecryptedNote,
        metadata: {
            color?: string,
            tags?: string[],
            is_pinned?: boolean,
            is_locked?: boolean,
        } = {}
    ): Promise<Result<VaultNote>> {
        try {
            const key = this.getActiveKey();

            const plaintext = JSON.stringify(decrypted);
            const { encryptedData, iv } = await encryptData(plaintext, key);

            const { data, error } = await this.supabase
                .from('notes')
                .insert({
                    user_id: userId,
                    encrypted_data: encryptedData,
                    iv: iv,
                    color: metadata.color || 'default',
                    tags: metadata.tags || [],
                    is_pinned: metadata.is_pinned || false,
                    is_locked: metadata.is_locked || false,
                } as any)
                .select()
                .single();

            if (error) {
                console.error("Insert error. Code:", error?.code);
                return { success: false, error: new Error("Unable to save note.") };
            }

            const newNote = await this.decryptNoteRow(data as unknown as EncryptedNote, key);

            this.audit.logAction(userId, 'note_created', 'note', newNote.id);

            return { success: true, data: newNote };

        } catch (e) {
            console.error('Failed to add note.', e);
            return { success: false, error: new Error("Unable to save note.") };
        }
    }

    async updateNote(
        id: string,
        decrypted: DecryptedNote,
        metadata: {
            color?: string,
            tags?: string[],
            is_pinned?: boolean,
            is_locked?: boolean,
        } = {}
    ): Promise<Result<VaultNote>> {
        try {
            const key = this.getActiveKey();

            const plaintext = JSON.stringify(decrypted);
            const { encryptedData, iv } = await encryptData(plaintext, key);

            const { data, error } = await this.supabase
                .from('notes')
                // @ts-expect-error
                .update({
                    encrypted_data: encryptedData,
                    iv: iv,
                    color: metadata.color,
                    tags: metadata.tags,
                    is_pinned: metadata.is_pinned,
                    is_locked: metadata.is_locked,
                })
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error("Update error. Code:", error?.code);
                return { success: false, error: new Error("Unable to save note.") };
            }

            const updatedNote = await this.decryptNoteRow(data as unknown as EncryptedNote, key);

            try {
                const { data: { user } } = await this.supabase.auth.getUser();
                if (user?.id) {
                    this.audit.logAction(user.id, 'note_updated', 'note', id);
                }
            } catch { /* non-blocking */ }

            return { success: true, data: updatedNote };

        } catch (e) {
            console.error('Failed to update note.', e);
            return { success: false, error: new Error("Unable to save note.") };
        }
    }

    async deleteNote(id: string): Promise<Result<void>> {
        try {
            this.getActiveKey();

            const { data: { user } } = await this.supabase.auth.getUser();
            if (!user?.id) {
                return { success: false, error: new Error('Authentication session expired. Please log in again.') };
            }

            const { error } = await this.supabase
                .from('notes')
                .delete()
                .eq('id', id);

            if (error) {
                return { success: false, error: new Error("Unable to delete note.") };
            }

            this.audit.logAction(user.id, 'note_deleted', 'note', id);

            return { success: true, data: undefined };
        } catch (e) {
            console.error('Failed to delete note.', e);
            return { success: false, error: new Error("Unable to delete note.") };
        }
    }
}
