"use client";

import { useState, useEffect, useRef } from "react";
import { VaultNote } from "@/types";
import { Check, Palette, BookOpen, Bold, Italic, Strikethrough, Code, List, ListTodo, Quote } from "lucide-react";
import { RichEditor, EditorCommands } from "./rich-editor";
import { NoteAttachments } from "./note-attachments";

// The premium elegant colors for white/glass mode
const COLORS = [
    { id: 'default', value: 'default', css: 'transparent', label: 'Default' },
    { id: 'red', value: '#fee2e2', css: '#fee2e2', label: 'Red' },
    { id: 'blue', value: '#dbeafe', css: '#dbeafe', label: 'Blue' },
    { id: 'green', value: '#d1fae5', css: '#d1fae5', label: 'Green' },
    { id: 'yellow', value: '#fef3c7', css: '#fef3c7', label: 'Yellow' }
];

export function NoteEditor({
    note,
    onSave,
}: {
    note: VaultNote | null;
    onSave: (data: { title: string, content: string, color: string, id?: string }) => void;
}) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [color, setColor] = useState("default");
    const [isSaving, setIsSaving] = useState(false);
    const [updateTrigger, setUpdateTrigger] = useState(0); // Forces re-render for toolbar active states
    const editorRef = useRef<EditorCommands | null>(null);

    // Refresh toolbar active states every second or on manual input
    useEffect(() => {
        const interval = setInterval(() => setUpdateTrigger(prev => prev + 1), 500);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (note) {
            setTitle(note.decrypted?.title || "");
            setContent(note.decrypted?.content || "");
            setColor(note.color || "default");
        } else {
            setTitle("");
            setContent("");
            setColor("default");
        }
        setIsSaving(false);
    }, [note]);

    const handleSave = async () => {
        setIsSaving(true);
        await onSave({ title, content, color, id: note?.id });
        setIsSaving(false);
    };

    if (!note) {
        return (
            <div className="flex-1 flex flex-col h-full bg-background items-center justify-center text-fg-muted font-sans p-8 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-background via-bg-secondary to-background opacity-50 pointer-events-none" />
                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-28 h-28 mb-8 rounded-[2rem] bg-foreground/[0.03] border border-border/50 flex items-center justify-center shadow-inner group transition-all duration-700 hover:bg-foreground/[0.05]">
                        <BookOpen className="w-12 h-12 text-foreground/20 group-hover:scale-110 group-hover:text-foreground/40 transition-all duration-500" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Your Secure Canvas</h2>
                    <p className="mt-4 text-sm max-w-sm text-fg-secondary leading-relaxed">
                        Select an existing page from the left to view it here, or create a brand new page to start securely capturing your thoughts.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-background relative z-10 overflow-hidden">
            {/* Environment tint based on selected color */}
            {color !== 'default' && (
                <div 
                    className="absolute inset-0 opacity-[0.15] pointer-events-none transition-colors duration-500" 
                    style={{ backgroundColor: color }}
                />
            )}

            {/* Simulated OneNote Ribbon Toolbar - Now Fully Actionable */}
            <div className="relative z-20 h-[52px] shrink-0 border-b border-border/20 bg-background flex items-center px-6 gap-2 overflow-x-auto no-scrollbar shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                {/* Formatting Tools */}
                <div className="flex bg-foreground/[0.03] p-1 rounded-lg border border-border/40 gap-1" key={updateTrigger}>
                    <button 
                        onClick={() => editorRef.current?.toggleBold()} 
                        title="Bold"
                        className={`p-1.5 rounded-md transition-colors ${editorRef.current?.isActive('bold') ? 'bg-background shadow-sm text-foreground' : 'text-fg-secondary hover:bg-background/50 hover:text-foreground'}`}
                    >
                        <Bold className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => editorRef.current?.toggleItalic()} 
                        title="Italic"
                        className={`p-1.5 rounded-md transition-colors ${editorRef.current?.isActive('italic') ? 'bg-background shadow-sm text-foreground' : 'text-fg-secondary hover:bg-background/50 hover:text-foreground'}`}
                    >
                        <Italic className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => editorRef.current?.toggleStrike()} 
                        title="Strikethrough"
                        className={`p-1.5 rounded-md transition-colors hidden sm:block ${editorRef.current?.isActive('strike') ? 'bg-background shadow-sm text-foreground' : 'text-fg-secondary hover:bg-background/50 hover:text-foreground'}`}
                    >
                        <Strikethrough className="w-4 h-4" />
                    </button>
                    <div className="w-px h-4 bg-border/40 mx-1 self-center" />
                    <button 
                        onClick={() => editorRef.current?.toggleBulletList()} 
                        title="Bullet List"
                        className={`p-1.5 rounded-md transition-colors ${editorRef.current?.isActive('bulletList') ? 'bg-background shadow-sm text-foreground' : 'text-fg-secondary hover:bg-background/50 hover:text-foreground'}`}
                    >
                        <List className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => editorRef.current?.toggleTaskList()} 
                        title="Checklist"
                        className={`p-1.5 rounded-md transition-colors ${editorRef.current?.isActive('taskList') ? 'bg-background shadow-sm text-brand' : 'text-fg-secondary hover:bg-background/50 hover:text-foreground'}`}
                    >
                        <ListTodo className="w-4 h-4" />
                    </button>
                    <div className="w-px h-4 bg-border/40 mx-1 self-center" />
                    <button 
                        onClick={() => editorRef.current?.toggleBlockquote()} 
                        title="Quote Block"
                        className={`p-1.5 rounded-md transition-colors hidden sm:block ${editorRef.current?.isActive('blockquote') ? 'bg-background shadow-sm text-foreground' : 'text-fg-secondary hover:bg-background/50 hover:text-foreground'}`}
                    >
                        <Quote className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => editorRef.current?.toggleCodeBlock()} 
                        title="Code Snippet"
                        className={`p-1.5 rounded-md transition-colors hidden sm:block ${editorRef.current?.isActive('codeBlock') ? 'bg-background shadow-sm text-foreground' : 'text-fg-secondary hover:bg-background/50 hover:text-foreground'}`}
                    >
                        <Code className="w-4 h-4" />
                    </button>
                </div>
                
                <div className="w-px h-5 bg-border/40 mx-3 shrink-0 hidden sm:block" />
                
                {/* Ribbon Color Picker */}
                <div className="flex items-center gap-2 group relative cursor-pointer px-4 py-2 hover:bg-foreground/5 rounded-lg shrink-0 border border-transparent hover:border-border/30 transition-all">
                    <Palette className="w-4 h-4 text-fg-secondary group-hover:text-foreground transition-colors" />
                    <span className="text-xs font-semibold text-fg-secondary group-hover:text-foreground transition-colors hidden sm:inline">Color</span>
                    <div className="absolute top-[110%] left-0 mt-1 bg-background border border-border/60 shadow-2xl rounded-xl p-3 flex gap-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 transform origin-top scale-95 group-hover:scale-100">
                        {COLORS.map(c => (
                            <button
                                key={c.id}
                                onClick={() => setColor(c.value)}
                                className={`w-7 h-7 rounded-full border border-border/30 transition-all ${color === c.value ? 'scale-110 shadow-md ring-2 ring-foreground/20 ring-offset-2 ring-offset-background' : 'hover:scale-110 hover:shadow-sm'}`}
                                style={{ backgroundColor: c.id === 'default' ? 'var(--color-bg-secondary)' : c.css }}
                                title={c.label}
                            />
                        ))}
                    </div>
                </div>

                <div className="flex-1" />
                
                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="group relative mono text-[10px] tracking-widest uppercase bg-foreground text-background px-6 py-2 rounded-md font-bold flex items-center gap-2 hover:opacity-90 transition-all whitespace-nowrap shrink-0 overflow-hidden shadow-md active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                >
                    <div className="absolute inset-0 w-1/4 bg-white/20 skew-x-12 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                    <Check className="w-3.5 h-3.5" />
                    {isSaving ? 'Encrypting...' : 'Secure Save'}
                </button>
            </div>

            {/* Note Editor Canvas Area */}
            <div className="flex-1 overflow-y-auto px-6 sm:px-12 md:px-24 py-12 relative z-10 w-full flex flex-col no-scrollbar">
                <div className="max-w-[800px] w-full mx-auto flex flex-col flex-1">
                    <input 
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Untitled Page"
                        className="w-full bg-transparent text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground placeholder-fg-muted/30 focus:outline-none tracking-tight font-sans border-none ring-0 outline-none pb-3 border-b-2 border-transparent hover:border-border/20 focus:border-border/40 transition-colors"
                    />
                    
                    <div className="mt-3 text-sm text-fg-muted pb-8 mb-6 border-b border-border/10 font-sans tracking-wide">
                        {new Date(note.updated_at).toLocaleString(undefined, { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                        })}
                    </div>

                    <RichEditor 
                         ref={editorRef}
                         content={content} 
                         onChange={setContent} 
                    />

                    {note?.id && <NoteAttachments noteId={note.id} />}
                </div>
            </div>
        </div>
    );
}
