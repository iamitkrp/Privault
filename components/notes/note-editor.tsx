"use client";

import { useState, useEffect, useRef } from "react";
import { VaultNote } from "@/types";
import { Check, BookOpen, Bold, Italic, Strikethrough, Code, List, ListTodo, Quote, Lock, Unlock, Calendar, Clock, Share2, History, Eye, MoreVertical, ShieldCheck } from "lucide-react";
import { RichEditor, EditorCommands } from "./rich-editor";
import { NoteAttachments } from "./note-attachments";

export function NoteEditor({
    note,
    onSave,
}: {
    note: VaultNote | null;
    onSave: (data: { title: string, content: string, color: string, is_locked?: boolean, id?: string }) => void;
}) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isLocked, setIsLocked] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [updateTrigger, setUpdateTrigger] = useState(0); 
    const editorRef = useRef<EditorCommands | null>(null);

    useEffect(() => {
        const interval = setInterval(() => setUpdateTrigger(prev => prev + 1), 500);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (note) {
            setTitle(note.decrypted?.title || "");
            setContent(note.decrypted?.content || "");
            setIsLocked(note.is_locked || false);
        } else {
            setTitle("");
            setContent("");
            setIsLocked(false);
        }
        setIsSaving(false);
    }, [note]);

    const handleSave = async () => {
        setIsSaving(true);
        await onSave({ title, content, color: "default", is_locked: isLocked, id: note?.id });
        setIsSaving(false);
    };

    if (!note) {
        return (
            <div className="flex-1 flex flex-col h-full bg-[#0c0e12] items-center justify-center text-[#aaabb0] font-sans p-8 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-28 h-28 mb-8 rounded-none bg-[#111318] border border-[#1d2025] flex items-center justify-center group transition-all duration-700 hover:bg-[#1d2025]">
                        <BookOpen className="w-12 h-12 text-[#46484d] group-hover:scale-110 group-hover:text-[#b8fd4b] transition-all duration-500" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-[#f6f6fc] font-headline">[[ WAITING FOR INPUT ]]</h2>
                    <p className="mt-4 text-xs font-mono max-w-sm text-[#aaabb0]/60 leading-relaxed uppercase">
                        Select an existing trace or initialize a new sequence to begin.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-[#0c0e12] relative z-10 overflow-hidden">
            {/* Header Toolbar matching Stitch layout */}
            <header className="h-16 flex items-center justify-between px-10 border-b border-[#1d2025] shrink-0 bg-[#0c0e12]">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 font-mono text-[10px] text-[#aaabb0]/60 tracking-tighter uppercase">
                        <span className="hover:text-[#b8fd4b] cursor-pointer transition-colors">[[ VAULT ]]</span>
                        <span className="text-[10px]">&gt;</span>
                        <span className="hover:text-[#b8fd4b] cursor-pointer transition-colors">[[ NOTEBOOKS ]]</span>
                        <span className="text-[10px]">&gt;</span>
                        <span className="text-[#48e4ff]">[[ {note.tags && note.tags.length > 0 ? note.tags[0] : "UNCATEGORIZED"} ]]</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center border border-[#1d2025] divide-x divide-[#1d2025]">
                        <button className="flex items-center gap-2 px-4 py-1.5 hover:bg-[#111318] transition-colors text-[#aaabb0] hover:text-[#f6f6fc]">
                            <Share2 className="w-3.5 h-3.5" />
                            <span className="font-sans text-[10px] font-bold uppercase tracking-widest hidden lg:inline">Share</span>
                        </button>
                        <button className="flex items-center gap-2 px-4 py-1.5 hover:bg-[#111318] transition-colors text-[#aaabb0] hover:text-[#f6f6fc]">
                            <History className="w-3.5 h-3.5" />
                            <span className="font-sans text-[10px] font-bold uppercase tracking-widest hidden lg:inline">History</span>
                        </button>
                        <button className="flex items-center gap-2 px-4 py-1.5 hover:bg-[#111318] transition-colors text-[#aaabb0] hover:text-[#f6f6fc]">
                            <Eye className="w-3.5 h-3.5" />
                            <span className="font-sans text-[10px] font-bold uppercase tracking-widest hidden lg:inline">View</span>
                        </button>
                    </div>
                    <div className="bg-[#b8fd4b]/10 px-3 py-1.5 flex items-center gap-2 border border-[#b8fd4b]/20">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#b8fd4b]" />
                        <span className="font-mono text-[10px] font-bold text-[#b8fd4b] tracking-tighter uppercase">[[ ENCRYPTED_EDIT ]]</span>
                    </div>
                    <button className="p-2 text-[#aaabb0] hover:text-[#f6f6fc] hover:bg-[#111318] transition-all">
                        <MoreVertical className="w-4 h-4" />
                    </button>
                </div>
            </header>

            {/* Note Editor Canvas Area */}
            <div className="flex-1 overflow-y-auto px-6 sm:px-12 md:px-24 py-12 relative z-10 w-full flex flex-col no-scrollbar">
                <div className="max-w-[800px] w-full mx-auto flex flex-col flex-1 pb-32">
                    
                    {/* Metadata Header */}
                    <div className="mb-12 border-b-2 border-[#1d2025] pb-8">
                        <input 
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="[ Untitled Phase ]"
                            className="w-full bg-transparent text-4xl sm:text-5xl font-bold tracking-tight mb-6 text-[#f6f6fc] font-headline placeholder-[#46484d] border-none ring-0 outline-none"
                        />
                        <div className="flex flex-wrap items-center gap-6 text-[#aaabb0]">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5" />
                                <span className="font-mono text-xs uppercase tracking-tight">
                                    {new Date(note.updated_at || Date.now()).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5" />
                                <span className="font-mono text-xs uppercase tracking-tight">
                                    {new Date(note.updated_at || Date.now()).toLocaleTimeString('en-US', { hour12: false })} UTC
                                </span>
                            </div>
                            <div className="flex gap-2">
                                {(note.tags || []).map(t => (
                                    <span key={t} className="px-2 py-0.5 bg-[#48e4ff]/10 text-[#48e4ff] font-mono text-[10px] border border-[#48e4ff]/20">
                                        #{t}
                                    </span>
                                ))}
                                {isLocked && (
                                    <span className="px-2 py-0.5 bg-[#ff7351]/10 text-[#ff7351] font-mono text-[10px] border border-[#ff7351]/20">
                                        #Confidential
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8 font-mono text-sm text-[#f6f6fc]/90 leading-relaxed">
                        <div className="opacity-80 text-[#b8fd4b] flex gap-2">
                            <span>&gt;&gt;&gt;</span> <span>INIT_PROCESS: EDIT_MODE</span>
                        </div>
                        <RichEditor 
                            ref={editorRef}
                            content={content} 
                            onChange={setContent} 
                        />
                    </div>

                    {note?.id && <div className="mt-8"><NoteAttachments noteId={note.id} /></div>}
                </div>
            </div>

            {/* Bottom Formatting Toolbar */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-fit px-2 h-14 bg-[#1d2025]/90 backdrop-blur-xl border border-[#46484d] flex items-center gap-1 shadow-2xl z-20 overflow-x-auto no-scrollbar max-w-[95%]">
                <div className="flex items-center px-2 flex-nowrap" key={updateTrigger}>
                    <button 
                        onClick={() => editorRef.current?.toggleBold()} 
                        className={`w-8 h-8 flex shrink-0 items-center justify-center transition-colors ${editorRef.current?.isActive('bold') ? 'text-[#b8fd4b]' : 'hover:bg-[#292c33] text-[#aaabb0] hover:text-[#b8fd4b]'}`}
                    >
                        <Bold className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => editorRef.current?.toggleItalic()} 
                        className={`w-8 h-8 flex shrink-0 items-center justify-center transition-colors ${editorRef.current?.isActive('italic') ? 'text-[#b8fd4b]' : 'hover:bg-[#292c33] text-[#aaabb0] hover:text-[#b8fd4b]'}`}
                    >
                        <Italic className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => editorRef.current?.toggleStrike()} 
                        className={`w-8 h-8 flex shrink-0 items-center justify-center transition-colors ${editorRef.current?.isActive('strike') ? 'text-[#b8fd4b]' : 'hover:bg-[#292c33] text-[#aaabb0] hover:text-[#b8fd4b]'}`}
                    >
                        <Strikethrough className="w-4 h-4" />
                    </button>
                    <div className="w-px h-6 bg-[#46484d] mx-2 self-center shrink-0" />
                    <button 
                        onClick={() => editorRef.current?.toggleBulletList()} 
                        className={`w-8 h-8 flex shrink-0 items-center justify-center transition-colors ${editorRef.current?.isActive('bulletList') ? 'text-[#b8fd4b]' : 'hover:bg-[#292c33] text-[#aaabb0] hover:text-[#b8fd4b]'}`}
                    >
                        <List className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => editorRef.current?.toggleTaskList()} 
                        className={`w-8 h-8 flex shrink-0 items-center justify-center transition-colors ${editorRef.current?.isActive('taskList') ? 'text-[#b8fd4b]' : 'hover:bg-[#292c33] text-[#aaabb0] hover:text-[#b8fd4b]'}`}
                    >
                        <ListTodo className="w-4 h-4" />
                    </button>
                    <div className="w-px h-6 bg-[#46484d] mx-2 self-center shrink-0 hidden sm:block" />
                    <button 
                        onClick={() => editorRef.current?.toggleCodeBlock()} 
                        className={`w-8 h-8 flex shrink-0 items-center justify-center transition-colors hidden sm:flex ${editorRef.current?.isActive('codeBlock') ? 'text-[#b8fd4b]' : 'hover:bg-[#292c33] text-[#aaabb0] hover:text-[#b8fd4b]'}`}
                    >
                        <Code className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => editorRef.current?.toggleBlockquote()} 
                        className={`w-8 h-8 flex shrink-0 items-center justify-center transition-colors hidden sm:flex ${editorRef.current?.isActive('blockquote') ? 'text-[#b8fd4b]' : 'hover:bg-[#292c33] text-[#aaabb0] hover:text-[#b8fd4b]'}`}
                    >
                        <Quote className="w-4 h-4" />
                    </button>
                </div>
                
                <div className="w-px h-6 bg-[#46484d] mx-2 shrink-0 hidden lg:block" />
                
                <button 
                    onClick={() => setIsLocked(!isLocked)}
                    className={`flex items-center shrink-0 gap-1.5 px-3 py-1.5 mx-1 text-[10px] font-sans font-bold transition-all ${isLocked ? 'text-[#ff7351]' : 'hover:bg-[#292c33] text-[#aaabb0] hover:text-[#f6f6fc]'}`}
                    title={isLocked ? "Unlock Note" : "Lock Note behind OTP"}
                >
                    {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline uppercase tracking-widest">{isLocked ? "Locked" : "Unlocked"}</span>
                </button>
                
                <div className="flex items-center gap-4 px-4 border-l border-[#46484d] shrink-0">
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-[#b8fd4b]/10 px-4 py-2 border border-[#b8fd4b]/30 text-[#b8fd4b] font-sans text-[10px] font-bold tracking-widest hover:bg-[#b8fd4b]/20 transition-all uppercase flex items-center gap-2 disabled:opacity-50 shrink-0"
                    >
                        {isSaving ? (
                            'Encrypting...'
                        ) : (
                            <>
                                <Check className="w-3 h-3" />
                                Save_To_Vault
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
