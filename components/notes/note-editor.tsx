"use client";

import { useState, useEffect, useRef } from "react";
import { VaultNote } from "@/types";
import { Check, BookOpen, Bold, Italic, Strikethrough, List, ListTodo, Lock, Unlock, Calendar, Clock, Underline as UnderlineIcon, AlignLeft, AlignCenter, AlignRight, Highlighter, Undo2, Redo2, Heading1, Heading2, Quote, Code, LayoutTemplate } from "lucide-react";
import { RichEditor, EditorCommands } from "./rich-editor";
import { NoteAttachments } from "./note-attachments";

const TEMPLATES: Record<string, string> = {
    todo: `<h2>To-Do List</h2><ul data-type="taskList"><li data-type="taskItem" data-checked="false"><p>New Task 1</p></li><li data-type="taskItem" data-checked="false"><p>New Task 2</p></li></ul>`,
    meeting: `<h2>Meeting Notes</h2><p><strong>Date:</strong> </p><p><strong>Attendees:</strong> </p><h3>Agenda</h3><ul><li><p></p></li></ul><h3>Action Items</h3><ul data-type="taskList"><li data-type="taskItem" data-checked="false"><p></p></li></ul>`,
    project: `<h2>Project Plan</h2><h3>Overview</h3><p></p><h3>Goals</h3><ul><li><p></p></li></ul><h3>Timeline</h3><p></p>`,
    journal: `<h2>Daily Journal</h2><h3>What did I accomplish today?</h3><p></p><h3>What did I learn?</h3><p></p><h3>What are my goals for tomorrow?</h3><p></p>`
};

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
            <div className="flex-1 flex flex-col h-full bg-background items-center justify-center text-fg-muted p-8 text-center relative overflow-hidden glass">
                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-24 h-24 mb-8 bg-foreground/5 flex items-center justify-center transition-all duration-700 rounded-full border border-border">
                        <BookOpen className="w-10 h-10 text-fg-secondary" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground uppercase">Ready</h2>
                    <p className="mt-4 text-xs mono text-fg-secondary max-w-sm uppercase tracking-widest">
                        Select a note or create a new one to begin.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-background relative z-10 overflow-hidden">
            {/* Editing Toolbar */}
            <header className="h-16 flex items-center border-b border-border shrink-0 bg-background/50 backdrop-blur-md px-10">
                <div className="flex-1 flex justify-center items-center overflow-x-auto no-scrollbar" key={updateTrigger}>
                    <div className="flex items-center gap-0.5">
                        <button onClick={() => editorRef.current?.undo()} className={`w-7 h-7 flex shrink-0 items-center justify-center rounded-sm transition-colors text-fg-secondary hover:text-foreground hover:bg-foreground/5`} title="Undo">
                            <Undo2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => editorRef.current?.redo()} className={`w-7 h-7 flex shrink-0 items-center justify-center rounded-sm transition-colors text-fg-secondary hover:text-foreground hover:bg-foreground/5`} title="Redo">
                            <Redo2 className="w-3.5 h-3.5" />
                        </button>
                        
                        <div className="w-px h-4 bg-border mx-1" />

                        <button onClick={() => editorRef.current?.toggleHeading(1)} className={`w-7 h-7 flex shrink-0 items-center justify-center rounded-sm transition-colors ${editorRef.current?.isActive('heading', { level: 1 }) ? 'bg-foreground/10 text-foreground' : 'text-fg-secondary hover:text-foreground hover:bg-foreground/5'}`} title="Heading 1">
                            <Heading1 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => editorRef.current?.toggleHeading(2)} className={`w-7 h-7 flex shrink-0 items-center justify-center rounded-sm transition-colors ${editorRef.current?.isActive('heading', { level: 2 }) ? 'bg-foreground/10 text-foreground' : 'text-fg-secondary hover:text-foreground hover:bg-foreground/5'}`} title="Heading 2">
                            <Heading2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="w-px h-4 bg-border mx-1" />

                        <button onClick={() => editorRef.current?.toggleBold()} className={`w-7 h-7 flex shrink-0 items-center justify-center rounded-sm transition-colors ${editorRef.current?.isActive('bold') ? 'bg-foreground/10 text-foreground' : 'text-fg-secondary hover:text-foreground hover:bg-foreground/5'}`} title="Bold">
                            <Bold className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => editorRef.current?.toggleItalic()} className={`w-7 h-7 flex shrink-0 items-center justify-center rounded-sm transition-colors ${editorRef.current?.isActive('italic') ? 'bg-foreground/10 text-foreground' : 'text-fg-secondary hover:text-foreground hover:bg-foreground/5'}`} title="Italic">
                            <Italic className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => editorRef.current?.toggleUnderline()} className={`w-7 h-7 flex shrink-0 items-center justify-center rounded-sm transition-colors ${editorRef.current?.isActive('underline') ? 'bg-foreground/10 text-foreground' : 'text-fg-secondary hover:text-foreground hover:bg-foreground/5'}`} title="Underline">
                            <UnderlineIcon className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => editorRef.current?.toggleStrike()} className={`w-7 h-7 flex shrink-0 items-center justify-center rounded-sm transition-colors ${editorRef.current?.isActive('strike') ? 'bg-foreground/10 text-foreground' : 'text-fg-secondary hover:text-foreground hover:bg-foreground/5'}`} title="Strikethrough">
                            <Strikethrough className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => editorRef.current?.toggleHighlight()} className={`w-7 h-7 flex shrink-0 items-center justify-center rounded-sm transition-colors ${editorRef.current?.isActive('highlight') ? 'bg-foreground/10 text-foreground' : 'text-fg-secondary hover:text-foreground hover:bg-foreground/5'}`} title="Highlight">
                            <Highlighter className="w-3.5 h-3.5" />
                        </button>
                        
                        <div className="w-px h-4 bg-border mx-1 hidden sm:block" />
                        
                        <button onClick={() => editorRef.current?.setTextAlign('left')} className={`w-7 h-7 flex shrink-0 items-center justify-center rounded-sm transition-colors hidden sm:flex ${editorRef.current?.isActive({ textAlign: 'left' }) ? 'bg-foreground/10 text-foreground' : 'text-fg-secondary hover:text-foreground hover:bg-foreground/5'}`} title="Align Left">
                            <AlignLeft className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => editorRef.current?.setTextAlign('center')} className={`w-7 h-7 flex shrink-0 items-center justify-center rounded-sm transition-colors hidden sm:flex ${editorRef.current?.isActive({ textAlign: 'center' }) ? 'bg-foreground/10 text-foreground' : 'text-fg-secondary hover:text-foreground hover:bg-foreground/5'}`} title="Align Center">
                            <AlignCenter className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => editorRef.current?.setTextAlign('right')} className={`w-7 h-7 flex shrink-0 items-center justify-center rounded-sm transition-colors hidden sm:flex ${editorRef.current?.isActive({ textAlign: 'right' }) ? 'bg-foreground/10 text-foreground' : 'text-fg-secondary hover:text-foreground hover:bg-foreground/5'}`} title="Align Right">
                            <AlignRight className="w-3.5 h-3.5" />
                        </button>

                        <div className="w-px h-4 bg-border mx-1 hidden sm:block" />
                        
                        <button onClick={() => editorRef.current?.toggleBulletList()} className={`w-7 h-7 flex shrink-0 items-center justify-center rounded-sm transition-colors hidden sm:flex ${editorRef.current?.isActive('bulletList') ? 'bg-foreground/10 text-foreground' : 'text-fg-secondary hover:text-foreground hover:bg-foreground/5'}`} title="Bullet List">
                            <List className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => editorRef.current?.toggleTaskList()} className={`w-7 h-7 flex shrink-0 items-center justify-center rounded-sm transition-colors hidden sm:flex ${editorRef.current?.isActive('taskList') ? 'bg-foreground/10 text-foreground' : 'text-fg-secondary hover:text-foreground hover:bg-foreground/5'}`} title="Task List">
                            <ListTodo className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => editorRef.current?.toggleBlockquote()} className={`w-7 h-7 flex shrink-0 items-center justify-center rounded-sm transition-colors hidden lg:flex ${editorRef.current?.isActive('blockquote') ? 'bg-foreground/10 text-foreground' : 'text-fg-secondary hover:text-foreground hover:bg-foreground/5'}`} title="Quote">
                            <Quote className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => editorRef.current?.toggleCodeBlock()} className={`w-7 h-7 flex shrink-0 items-center justify-center rounded-sm transition-colors hidden lg:flex ${editorRef.current?.isActive('codeBlock') ? 'bg-foreground/10 text-foreground' : 'text-fg-secondary hover:text-foreground hover:bg-foreground/5'}`} title="Code Block">
                            <Code className="w-3.5 h-3.5" />
                        </button>
                        
                        <div className="w-px h-4 bg-border mx-1 hidden md:block" />

                        <div className="relative hidden md:flex items-center group">
                            <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none text-fg-secondary group-hover:text-foreground">
                                <LayoutTemplate className="w-3.5 h-3.5" />
                            </div>
                            <select 
                                className="appearance-none bg-transparent text-fg-secondary hover:text-foreground hover:bg-foreground/5 cursor-pointer text-[11px] font-bold uppercase tracking-widest pl-8 pr-4 py-1.5 rounded-sm outline-none transition-colors border-none"
                                value=""
                                onChange={(e) => {
                                    if (e.target.value && editorRef.current) {
                                        const html = TEMPLATES[e.target.value];
                                        if (html) {
                                            editorRef.current.setContent(html);
                                            setContent(html);
                                        }
                                    }
                                }}
                            >
                                <option value="" disabled hidden>Templates</option>
                                <option className="text-foreground bg-background lowercase normal-case text-sm font-normal" value="todo">To-Do List</option>
                                <option className="text-foreground bg-background lowercase normal-case text-sm font-normal" value="meeting">Meeting Notes</option>
                                <option className="text-foreground bg-background lowercase normal-case text-sm font-normal" value="project">Project Plan</option>
                                <option className="text-foreground bg-background lowercase normal-case text-sm font-normal" value="journal">Daily Journal</option>
                            </select>
                        </div>
                    </div>
                </div>
            </header>

            {/* Note Editor Canvas Area */}
            <div className="flex-1 overflow-y-auto px-6 sm:px-12 md:px-24 py-12 relative z-10 w-full flex flex-col no-scrollbar">
                <div className="max-w-[800px] w-full mx-auto flex flex-col flex-1 pb-32">
                    
                    {/* Metadata Header */}
                    <div className="mb-12 border-b-2 border-border/50 pb-8">
                        <input 
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Untitled Note"
                            className="w-full bg-transparent text-4xl sm:text-5xl font-bold tracking-tight mb-6 text-foreground placeholder-fg-muted/50 border-none ring-0 outline-none"
                        />
                        <div className="flex flex-wrap items-center gap-6 text-fg-secondary">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5" />
                                <span className="mono text-xs uppercase tracking-widest">
                                    {new Date(note.updated_at || Date.now()).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5" />
                                <span className="mono text-xs uppercase tracking-widest">
                                    {new Date(note.updated_at || Date.now()).toLocaleTimeString('en-US', { hour12: false })}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                {(note.tags || []).map((t: string) => (
                                    <span key={t} className="px-2 py-0.5 bg-foreground/5 text-foreground mono text-[10px] uppercase border border-border">
                                        {t}
                                    </span>
                                ))}
                                {isLocked && (
                                    <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 mono text-[10px] border border-rose-500/20 uppercase">
                                        Confidential
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8 mono text-sm text-foreground/90 leading-relaxed">
                        <RichEditor 
                            ref={editorRef}
                            content={content} 
                            onChange={setContent} 
                        />
                    </div>

                    {note?.id && <div className="mt-8"><NoteAttachments noteId={note.id} /></div>}
                </div>
            </div>

            {/* Floating Actions Overlay (Lock/Save) */}
            <div className="absolute bottom-8 right-8 flex items-center gap-2 z-20">
                <button 
                    onClick={() => setIsLocked(!isLocked)}
                    className={`flex items-center shrink-0 gap-2 px-4 py-3 border bg-background/80 backdrop-blur-md transition-all shadow-sm ${isLocked ? 'text-rose-400 border-rose-500/20' : 'border-border text-fg-secondary hover:text-foreground'}`}
                    title={isLocked ? "Unlock Note" : "Lock Note behind OTP"}
                >
                    {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    <span className="hidden sm:inline text-xs font-bold uppercase tracking-widest">{isLocked ? "Locked" : "Unlocked"}</span>
                </button>
                
                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-foreground text-background px-6 py-3 font-bold text-xs tracking-widest hover:opacity-90 transition-all uppercase flex items-center gap-2 disabled:opacity-50 shadow-sm"
                >
                    {isSaving ? 'Saving...' : <><Check className="w-4 h-4" /> Save</>}
                </button>
            </div>
        </div>
    );
}
