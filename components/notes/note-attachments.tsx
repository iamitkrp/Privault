"use client";

import { useState, useEffect } from "react";
import { Paperclip, Download, Trash2, Loader2, FileIcon, FileText } from "lucide-react";
import { NotesService } from "@/services/notes.service";
import { createClient } from "@/lib/supabase/client";

interface AttachmentMeta {
    id: string;
    name: string;
    size: number;
    type: string;
    created_at: string;
}

export function NoteAttachments({ noteId }: { noteId: string }) {
    const [attachments, setAttachments] = useState<AttachmentMeta[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    const supabase = createClient();
    const service = new NotesService(supabase);

    const loadAttachments = async () => {
        setIsLoading(true);
        const result = await service.getAttachmentMetadata(noteId);
        if (result.success && result.data) {
            setAttachments(result.data);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        if (noteId) {
            loadAttachments();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [noteId]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !noteId) return;

        setIsUploading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return setIsUploading(false);

        const result = await service.uploadAttachment(user.id, noteId, file);
        if (result.success && result.data) {
            await loadAttachments();
        }
        setIsUploading(false);
        // Reset input
        e.target.value = '';
    };

    const handleDownload = async (id: string, fileName: string) => {
        setDownloadingId(id);
        const result = await service.downloadAttachment(id);
        if (result.success && result.data) {
            const blob = new Blob([result.data.buffer], { type: result.data.type });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }
        setDownloadingId(null);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Remove this attachment?")) return;
        const result = await service.deleteAttachment(id);
        if (result.success) {
            setAttachments(prev => prev.filter(a => a.id !== id));
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    return (
        <div className="mt-8 border-t border-border/20 pt-6 px-4 pb-8 max-w-[800px] mx-auto w-full">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-fg-secondary flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-brand" />
                    Secure Attachments
                </h3>
                
                <label className="cursor-pointer bg-brand/10 hover:bg-brand/20 text-brand px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors">
                    {isUploading ? <Loader2 className="w-3 h-3 animate-spin"/> : <Paperclip className="w-3 h-3"/>}
                    {isUploading ? 'Encrypting...' : 'Add File'}
                    <input 
                        type="file" 
                        className="hidden" 
                        onChange={handleUpload}
                        disabled={isUploading}
                    />
                </label>
            </div>

            {isLoading ? (
                <div className="text-xs text-fg-muted animate-pulse py-2">Loading secure payload...</div>
            ) : attachments.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-border/40 text-center text-xs text-fg-muted/60 bg-foreground/[0.01]">
                    No files attached. Upload a file to safely store it encrypted natively inside this note.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {attachments.map(att => (
                        <div key={att.id} className="flex items-center justify-between p-3 rounded-xl border border-border/30 bg-background shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="p-2 bg-brand/10 text-brand rounded-lg shrink-0">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <div className="truncate">
                                    <div className="text-sm font-medium text-foreground truncate" title={att.name}>
                                        {att.name}
                                    </div>
                                    <div className="text-[10px] text-fg-muted font-mono mt-0.5">
                                        {formatSize(att.size)}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                                <button 
                                    onClick={() => handleDownload(att.id, att.name)}
                                    disabled={downloadingId === att.id}
                                    className="p-1.5 hover:bg-foreground/5 text-fg-secondary hover:text-foreground rounded-md transition-colors"
                                    title="Download and Decrypt"
                                >
                                    {downloadingId === att.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin text-brand" />
                                    ) : (
                                        <Download className="w-4 h-4" />
                                    )}
                                </button>
                                <button 
                                    onClick={() => handleDelete(att.id)}
                                    className="p-1.5 hover:bg-red-500/10 text-fg-secondary hover:text-red-500 rounded-md transition-colors"
                                    title="Delete Attachment"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
