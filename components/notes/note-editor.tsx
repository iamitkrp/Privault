"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { VaultNote } from "@/types";
import { Check, BookOpen, Bold, Italic, Strikethrough, List, ListTodo, Lock, Unlock, Calendar, Underline as UnderlineIcon, AlignLeft, AlignCenter, AlignRight, Highlighter, Undo2, Redo2, Heading1, Heading2, Quote, Code, LayoutTemplate, X, Search, Tag, CheckSquare, Users, Target, Notebook, CalendarDays, Activity, BookMarked, Contact, Type, ALargeSmall, ChevronDown } from "lucide-react";
import { RichEditor, EditorCommands } from "./rich-editor";
import { NoteAttachments } from "./note-attachments";
const TEMPLATES = [
    {
        id: 'todo',
        name: 'To-Do List',
        description: 'A simple checklist to track your tasks and prioritize daily activities.',
        html: `<h2>To-Do List</h2><ul data-type="taskList"><li data-type="taskItem" data-checked="false"><p>New Task 1</p></li><li data-type="taskItem" data-checked="false"><p>New Task 2</p></li></ul>`
    },
    {
        id: 'meeting',
        name: 'Meeting Notes',
        description: 'Structure for capturing meeting agendas, attendees, and action items.',
        html: `<h2>Meeting Notes</h2><p><strong>Date:</strong> </p><p><strong>Attendees:</strong> </p><h3>Agenda</h3><ul><li><p></p></li></ul><h3>Action Items</h3><ul data-type="taskList"><li data-type="taskItem" data-checked="false"><p></p></li></ul>`
    },
    {
        id: 'project',
        name: 'Project Plan',
        description: 'Outline your project goals, detailed overview, and timeline expectations.',
        html: `<h2>Project Plan</h2><h3>Overview</h3><p></p><h3>Goals</h3><ul><li><p></p></li></ul><h3>Timeline</h3><p></p>`
    },
    {
        id: 'journal',
        name: 'Daily Journal',
        description: 'Reflect on your day, learnings, achievements, and tomorrow\'s goals.',
        html: `<h2>Daily Journal</h2><h3>What did I accomplish today?</h3><p></p><h3>What did I learn?</h3><p></p><h3>What are my goals for tomorrow?</h3><p></p>`
    },
    {
        id: 'weekly',
        name: 'Weekly Planner',
        description: 'Plan out your week, key objectives, and day-by-day focus areas.',
        html: `<h2>Weekly Planner</h2><h3>Objectives</h3><ul><li><p></p></li></ul><h3>Monday</h3><p></p><h3>Tuesday</h3><p></p><h3>Wednesday</h3><p></p><h3>Thursday</h3><p></p><h3>Friday</h3><p></p>`
    },
    {
        id: 'habit',
        name: 'Habit Tracker',
        description: 'Track your daily routines and build positive habits.',
        html: `<h2>Weekly Habit Tracker</h2><ul data-type="taskList"><li data-type="taskItem" data-checked="false"><p>Morning Workout</p></li><li data-type="taskItem" data-checked="false"><p>Read 10 pages</p></li><li data-type="taskItem" data-checked="false"><p>Drink 2L Water</p></li></ul>`
    },
    {
        id: 'reading',
        name: 'Reading Notes',
        description: 'Capture key insights, specific quotes, and actionable takeaways from books or articles.',
        html: `<h2>Reading Notes</h2><p><strong>Title:</strong> </p><p><strong>Author:</strong> </p><h3>Summary</h3><p></p><h3>Key Quotes</h3><blockquote><p></p></blockquote><h3>Actionable Takeaways</h3><ul><li><p></p></li></ul>`
    },
    {
        id: 'crm',
        name: 'Contact Log',
        description: 'Keep track of important conversations, client details, and clear follow-ups.',
        html: `<h2>Contact Log</h2><p><strong>Name:</strong> </p><p><strong>Company/Role:</strong> </p><h3>Last Interaction</h3><p></p><h3>Notes</h3><p></p><h3>Follow-up Action</h3><ul data-type="taskList"><li data-type="taskItem" data-checked="false"><p>Send email regarding...</p></li></ul>`
    }
];

export function NoteEditor({
    note,
    onSave,
}: {
    note: VaultNote | null;
    onSave: (data: { title: string, content: string, color: string, is_locked?: boolean, id?: string, tags?: string[] }) => void;
}) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [editingTag, setEditingTag] = useState(false);
    const [tagInput, setTagInput] = useState("");
    const [isLocked, setIsLocked] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [templateSearchQuery, setTemplateSearchQuery] = useState("");
    const [mounted, setMounted] = useState(false);
    const [, setToolbarTick] = useState(0);
    const [showFontPicker, setShowFontPicker] = useState(false);
    const [showSizePicker, setShowSizePicker] = useState(false);
    const editorRef = useRef<EditorCommands | null>(null);
    const titleRef = useRef<HTMLInputElement>(null);

    const FONT_FAMILIES = [
        { label: 'Default', value: '' },
        { label: 'Inter', value: 'Inter' },
        { label: 'Arial', value: 'Arial' },
        { label: 'Georgia', value: 'Georgia' },
        { label: 'Times New Roman', value: 'Times New Roman' },
        { label: 'Courier New', value: 'Courier New' },
        { label: 'Verdana', value: 'Verdana' },
        { label: 'Trebuchet MS', value: 'Trebuchet MS' },
        { label: 'Garamond', value: 'Garamond' },
        { label: 'Comic Sans MS', value: 'Comic Sans MS' },
        { label: 'Roboto Mono', value: 'Roboto Mono' },
    ];

    const FONT_SIZES = [
        { label: 'Default', value: '' },
        { label: '12px', value: '12px' },
        { label: '14px', value: '14px' },
        { label: '16px', value: '16px' },
        { label: '18px', value: '18px' },
        { label: '20px', value: '20px' },
        { label: '24px', value: '24px' },
        { label: '28px', value: '28px' },
        { label: '32px', value: '32px' },
        { label: '36px', value: '36px' },
    ];

    // Event-driven toolbar refresh — only updates when editor state actually changes
    const handleActiveStatesChange = useCallback(() => {
        setToolbarTick(t => t + 1);
    }, []);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (note) {
            setTitle(note.decrypted?.title || "");
            setContent(note.decrypted?.content || "");
            setIsLocked(note.is_locked || false);
            setTags(note.tags || []);
        } else {
            setTitle("");
            setContent("");
            setIsLocked(false);
            setTags([]);
        }
        setIsSaving(false);
        // Auto-focus title for new/empty notes
        if (note && (!note.decrypted?.content || note.decrypted.content === "")) {
            setTimeout(() => titleRef.current?.focus(), 100);
        }
    }, [note]);

    const handleSave = async () => {
        setIsSaving(true);
        await onSave({ title, content, color: "default", is_locked: isLocked, id: note?.id, tags });
        setIsSaving(false);
    };

    if (!note) {
        return (
            <div className="flex-1 flex flex-col h-full liquid-bg glass items-center justify-center text-fg-secondary p-8 text-center relative overflow-hidden z-20 border-l border-border/50">
                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-24 h-24 mb-8 bg-background/50 flex items-center justify-center transition-all duration-700 rounded-full border border-border/50 text-foreground shadow-glow">
                        <BookOpen className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground uppercase">Ready</h2>
                    <p className="mt-4 text-xs text-fg-secondary max-w-sm tracking-widest uppercase">
                        Select a note or create a new one to begin.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-background/40 backdrop-blur-xl relative z-20 overflow-hidden font-sans border-l border-border/50 shadow-2xl">
            {/* Utility Header */}
            <header className="h-14 flex items-center justify-between px-8 border-b border-border/50 bg-background/40 shrink-0">
                 <div className="flex items-center gap-2">
                     <span className="text-xs font-bold text-fg-secondary uppercase tracking-widest tracking-tight">Editor</span>
                 </div>
                 <div className="flex items-center gap-2">
                     <button onClick={() => setShowTemplateModal(true)} className="px-3 py-1.5 rounded-full text-xs font-bold text-fg-secondary hover:bg-foreground/10 hover:text-foreground transition-colors flex items-center gap-1">
                         <LayoutTemplate className="w-3.5 h-3.5" /> Templates
                     </button>
                 </div>
            </header>

            {/* Rich Text Toolbar */}
            <div className="px-8 py-3 border-b border-border/50 bg-background/20 flex items-center gap-1 shrink-0 overflow-x-auto no-scrollbar">
                <button onClick={() => editorRef.current?.undo()} className={`p-1.5 rounded transition-colors text-on-surface-variant hover:bg-slate-200/50`} title="Undo">
                    <Undo2 className="w-4 h-4" />
                </button>
                <button onClick={() => editorRef.current?.redo()} className={`p-1.5 rounded transition-colors text-on-surface-variant hover:bg-slate-200/50`} title="Redo">
                    <Redo2 className="w-4 h-4" />
                </button>
                
                <div className="w-px h-4 bg-outline-variant/30 mx-2" />

                {/* Font Family Picker */}
                <div className="relative">
                    <button
                        onClick={() => { setShowFontPicker(!showFontPicker); setShowSizePicker(false); }}
                        className="flex items-center gap-1 px-2 py-1 rounded transition-colors text-on-surface-variant hover:bg-slate-200/50 text-xs font-medium min-w-[90px]"
                        title="Font Family"
                    >
                        <Type className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate max-w-[60px]">{editorRef.current?.getFontFamily() || 'Default'}</span>
                        <ChevronDown className="w-3 h-3 shrink-0 opacity-50" />
                    </button>
                    {showFontPicker && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowFontPicker(false)} />
                            <div className="absolute top-full left-0 mt-1.5 z-50 bg-background border border-border/40 rounded-xl shadow-xl py-1 w-48 max-h-64 overflow-y-auto custom-scrollbar">
                                {FONT_FAMILIES.map((font) => (
                                    <button
                                        key={font.value}
                                        onClick={() => {
                                            editorRef.current?.setFontFamily(font.value);
                                            setShowFontPicker(false);
                                        }}
                                        className={`w-full text-left px-3 py-1.5 text-sm transition-colors flex items-center justify-between ${
                                            (editorRef.current?.getFontFamily() || '') === font.value
                                                ? 'bg-primary/10 text-primary font-medium'
                                                : 'text-foreground hover:bg-foreground/5'
                                        }`}
                                        style={font.value ? { fontFamily: font.value } : undefined}
                                    >
                                        {font.label}
                                        {(editorRef.current?.getFontFamily() || '') === font.value && (
                                            <Check className="w-3.5 h-3.5" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Font Size Picker */}
                <div className="relative">
                    <button
                        onClick={() => { setShowSizePicker(!showSizePicker); setShowFontPicker(false); }}
                        className="flex items-center gap-1 px-2 py-1 rounded transition-colors text-on-surface-variant hover:bg-slate-200/50 text-xs font-medium min-w-[70px]"
                        title="Font Size"
                    >
                        <ALargeSmall className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{editorRef.current?.getFontSize() || 'Default'}</span>
                        <ChevronDown className="w-3 h-3 shrink-0 opacity-50" />
                    </button>
                    {showSizePicker && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowSizePicker(false)} />
                            <div className="absolute top-full left-0 mt-1.5 z-50 bg-background border border-border/40 rounded-xl shadow-xl py-1 w-36 max-h-64 overflow-y-auto custom-scrollbar">
                                {FONT_SIZES.map((size) => (
                                    <button
                                        key={size.value}
                                        onClick={() => {
                                            editorRef.current?.setFontSize(size.value);
                                            setShowSizePicker(false);
                                        }}
                                        className={`w-full text-left px-3 py-1.5 text-sm transition-colors flex items-center justify-between ${
                                            (editorRef.current?.getFontSize() || '') === size.value
                                                ? 'bg-primary/10 text-primary font-medium'
                                                : 'text-foreground hover:bg-foreground/5'
                                        }`}
                                    >
                                        {size.label}
                                        {(editorRef.current?.getFontSize() || '') === size.value && (
                                            <Check className="w-3.5 h-3.5" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <div className="w-px h-4 bg-outline-variant/30 mx-2" />

                <button onClick={() => editorRef.current?.toggleHeading(1)} className={`p-1.5 rounded transition-colors ${editorRef.current?.isActive('heading', { level: 1 }) ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-slate-200/50'}`} title="Heading 1">
                    <Heading1 className="w-4 h-4" />
                </button>
                <button onClick={() => editorRef.current?.toggleHeading(2)} className={`p-1.5 rounded transition-colors ${editorRef.current?.isActive('heading', { level: 2 }) ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-slate-200/50'}`} title="Heading 2">
                    <Heading2 className="w-4 h-4" />
                </button>

                <div className="w-px h-4 bg-outline-variant/30 mx-2" />

                <button onClick={() => editorRef.current?.toggleBold()} className={`p-1.5 rounded transition-colors ${editorRef.current?.isActive('bold') ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-slate-200/50'}`} title="Bold">
                    <Bold className="w-4 h-4" />
                </button>
                <button onClick={() => editorRef.current?.toggleItalic()} className={`p-1.5 rounded transition-colors ${editorRef.current?.isActive('italic') ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-slate-200/50'}`} title="Italic">
                    <Italic className="w-4 h-4" />
                </button>
                <button onClick={() => editorRef.current?.toggleUnderline()} className={`p-1.5 rounded transition-colors ${editorRef.current?.isActive('underline') ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-slate-200/50'}`} title="Underline">
                    <UnderlineIcon className="w-4 h-4" />
                </button>
                <button onClick={() => editorRef.current?.toggleStrike()} className={`p-1.5 rounded transition-colors ${editorRef.current?.isActive('strike') ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-slate-200/50'}`} title="Strikethrough">
                    <Strikethrough className="w-4 h-4" />
                </button>
                <button onClick={() => editorRef.current?.toggleHighlight()} className={`p-1.5 rounded transition-colors ${editorRef.current?.isActive('highlight') ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-slate-200/50'}`} title="Highlight">
                    <Highlighter className="w-4 h-4" />
                </button>
                
                <div className="w-px h-4 bg-outline-variant/30 mx-2 hidden sm:block" />
                
                <button onClick={() => editorRef.current?.setTextAlign('left')} className={`p-1.5 rounded transition-colors hidden sm:flex ${editorRef.current?.isActive({ textAlign: 'left' }) ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-slate-200/50'}`} title="Align Left">
                    <AlignLeft className="w-4 h-4" />
                </button>
                <button onClick={() => editorRef.current?.setTextAlign('center')} className={`p-1.5 rounded transition-colors hidden sm:flex ${editorRef.current?.isActive({ textAlign: 'center' }) ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-slate-200/50'}`} title="Align Center">
                    <AlignCenter className="w-4 h-4" />
                </button>
                <button onClick={() => editorRef.current?.setTextAlign('right')} className={`p-1.5 rounded transition-colors hidden sm:flex ${editorRef.current?.isActive({ textAlign: 'right' }) ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-slate-200/50'}`} title="Align Right">
                    <AlignRight className="w-4 h-4" />
                </button>

                <div className="w-px h-4 bg-outline-variant/30 mx-2 hidden sm:block" />
                
                <button onClick={() => editorRef.current?.toggleBulletList()} className={`p-1.5 rounded transition-colors hidden sm:flex ${editorRef.current?.isActive('bulletList') ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-slate-200/50'}`} title="Bullet List">
                    <List className="w-4 h-4" />
                </button>
                <button onClick={() => editorRef.current?.toggleTaskList()} className={`p-1.5 rounded transition-colors hidden sm:flex ${editorRef.current?.isActive('taskList') ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-slate-200/50'}`} title="Task List">
                    <ListTodo className="w-4 h-4" />
                </button>
                <button onClick={() => editorRef.current?.toggleBlockquote()} className={`p-1.5 rounded transition-colors hidden lg:flex ${editorRef.current?.isActive('blockquote') ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-slate-200/50'}`} title="Quote">
                    <Quote className="w-4 h-4" />
                </button>
                <button onClick={() => editorRef.current?.toggleCodeBlock()} className={`p-1.5 rounded transition-colors hidden lg:flex ${editorRef.current?.isActive('codeBlock') ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-slate-200/50'}`} title="Code Block">
                    <Code className="w-4 h-4" />
                </button>
            </div>

            {/* Note Editor Canvas Area */}
            <div className="flex-1 overflow-y-auto px-6 sm:px-10 py-12 relative z-10 w-full flex flex-col no-scrollbar">
                <div className="w-full flex flex-col flex-1 pb-32">
                    
                    {/* Metadata Header */}
                    <div className="mb-8">
                        <input 
                            ref={titleRef}
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Untitled Note"
                            className="w-full bg-transparent text-5xl font-black tracking-tight mb-2 text-foreground placeholder:text-fg-muted/30 leading-tight focus:outline-none focus:ring-0 focus:border-transparent outline-none border-none border-0 ring-0 shadow-none appearance-none"
                            style={{ WebkitAppearance: 'none', boxShadow: 'none', border: 'none', outline: 'none' }}
                        />
                        {/* Thin dynamic separator line */}
                        <div className="w-16 h-1 mt-4 rounded-full bg-brand/50 shadow-glow"></div>
                    </div>

                    <div className="text-lg text-foreground/90 leading-relaxed flex-1">
                        <RichEditor 
                            ref={editorRef}
                            content={content} 
                            onChange={setContent}
                            onActiveStatesChange={handleActiveStatesChange}
                        />
                    </div>

                    {note?.id && <div className="mt-8 border-t glass-border pt-8"><NoteAttachments noteId={note.id} /></div>}
                </div>
            </div>

            {/* Editor Footer */}
            <footer className="h-12 px-8 border-t border-border/50 bg-background/40 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4 text-xs font-medium text-fg-secondary">
                    <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> 
                        {new Date(note?.updated_at || Date.now()).toLocaleDateString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span className="flex items-center gap-1">
                        {isSaving ? "Saving..." : "Saved"}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setIsLocked(!isLocked)}
                        className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase flex items-center gap-1 transition-all border ${isLocked ? 'bg-error/10 text-error border-error/20' : 'bg-secondary/5 text-secondary border-transparent hover:bg-secondary/10'}`}
                        title={isLocked ? "Unlock Note" : "Lock Note behind OTP"}
                    >
                        {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                        {isLocked ? "Locked" : "Unlocked"}
                    </button>
                    <div className="relative">
                        <button
                            onClick={() => { setTagInput(tags[0] || ""); setEditingTag(true); }}
                            className="px-2.5 py-0.5 bg-foreground/10 text-foreground text-[10px] font-bold rounded-full uppercase hover:bg-foreground/15 transition-colors flex items-center gap-1 group"
                            title="Click to edit category"
                        >
                            <Tag className="w-2.5 h-2.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                            {tags[0] || "Untitled"}
                        </button>
                        {editingTag && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => { const val = tagInput.trim(); setTags(val ? [val] : []); setEditingTag(false); }} />
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 z-50 bg-background border border-border/40 rounded-2xl shadow-lg px-3.5 py-3 transform origin-bottom">
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            const val = tagInput.trim();
                                            setTags(val ? [val] : []);
                                            setEditingTag(false);
                                        }}
                                        className="flex flex-col gap-3 relative z-50"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <Tag className="w-3.5 h-3.5 text-fg-muted/70 shrink-0" />
                                            <input
                                                type="text"
                                                value={tagInput}
                                                onChange={(e) => setTagInput(e.target.value)}
                                                onKeyDown={(e) => { if (e.key === 'Escape') { setEditingTag(false); } }}
                                                autoFocus
                                                placeholder="Category name..."
                                                className="flex-1 bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-fg-muted/50"
                                            />
                                        </div>
                                        <div className="h-px bg-border/30" />
                                        <div className="flex justify-end gap-1.5">
                                            <button type="button" onClick={() => setEditingTag(false)} className="px-3 py-1 rounded-full text-[11px] font-semibold text-fg-secondary hover:text-foreground hover:bg-foreground/5 transition-colors">Cancel</button>
                                            <button type="submit" className="px-3 py-1 rounded-full text-[11px] font-bold bg-foreground text-background hover:brightness-110 transition-all">Save</button>
                                        </div>
                                    </form>
                                </div>
                            </>
                        )}
                    </div>
                    
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="ml-2 bg-foreground text-background px-4 py-1.5 rounded-full font-bold text-xs flex items-center gap-1 hover:brightness-110 shadow-sm transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest"
                    >
                        {isSaving ? 'Saving' : <><Check className="w-3.5 h-3.5" /> Save</>}
                    </button>
                </div>
            </footer>

            {/* Template Pop-up Modal */}
            {mounted && showTemplateModal && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-6" onClick={() => setShowTemplateModal(false)}>
                    <div className="bg-background border border-border/40 shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col rounded-2xl slide-in-bottom" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="px-6 py-5 flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-bold text-foreground tracking-tight">Choose a template</h3>
                                <p className="text-xs text-fg-secondary mt-0.5">Start with a pre-built structure</p>
                            </div>
                            <button onClick={() => setShowTemplateModal(false)} className="text-fg-muted hover:text-foreground transition-colors p-2 rounded-full hover:bg-foreground/5">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Search */}
                        <div className="px-6 pb-4">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-fg-muted/60" />
                                <input 
                                    type="text" 
                                    placeholder="Search templates..."
                                    value={templateSearchQuery}
                                    onChange={(e) => setTemplateSearchQuery(e.target.value)}
                                    className="w-full bg-foreground/[0.03] border border-border/30 focus:border-border/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-fg-muted/50 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="h-px bg-border/30 mx-6" />

                        {/* Grid */}
                        <div className="p-5 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[60vh] custom-scrollbar">
                            {(() => {
                                const iconMap: Record<string, React.ReactNode> = {
                                    todo: <CheckSquare className="w-5 h-5" />,
                                    meeting: <Users className="w-5 h-5" />,
                                    project: <Target className="w-5 h-5" />,
                                    journal: <Notebook className="w-5 h-5" />,
                                    weekly: <CalendarDays className="w-5 h-5" />,
                                    habit: <Activity className="w-5 h-5" />,
                                    reading: <BookMarked className="w-5 h-5" />,
                                    crm: <Contact className="w-5 h-5" />,
                                };
                                const filtered = TEMPLATES.filter(t => 
                                    t.name.toLowerCase().includes(templateSearchQuery.toLowerCase()) || 
                                    t.description.toLowerCase().includes(templateSearchQuery.toLowerCase())
                                );
                                return filtered.length > 0 ? (
                                    filtered.map((template) => (
                                        <button 
                                            key={template.id}
                                            onClick={() => {
                                                if (editorRef.current) {
                                                    editorRef.current.setContent(template.html);
                                                    setContent(template.html);
                                                }
                                                setShowTemplateModal(false);
                                                setTemplateSearchQuery("");
                                            }}
                                            className="flex flex-col text-left p-4 rounded-xl border border-border/30 hover:border-border/60 hover:bg-foreground/[0.03] transition-all group"
                                        >
                                            <div className="w-9 h-9 rounded-xl bg-foreground/[0.06] flex items-center justify-center mb-3 text-fg-secondary group-hover:bg-foreground group-hover:text-background transition-all">
                                                {iconMap[template.id] || <LayoutTemplate className="w-5 h-5" />}
                                            </div>
                                            <span className="text-sm font-semibold text-foreground mb-1">{template.name}</span>
                                            <span className="text-xs text-fg-muted leading-relaxed line-clamp-2">{template.description}</span>
                                        </button>
                                    ))
                                ) : (
                                    <div className="col-span-full py-16 text-center flex flex-col items-center">
                                        <div className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center mb-4">
                                            <Search className="w-5 h-5 text-fg-muted/40" />
                                        </div>
                                        <h4 className="text-sm font-semibold text-foreground mb-1">No templates found</h4>
                                        <p className="text-xs text-fg-muted">Try a different search term</p>
                                        <button 
                                            onClick={() => setTemplateSearchQuery("")}
                                            className="mt-3 text-[11px] font-bold text-fg-secondary hover:text-foreground transition-colors"
                                        >
                                            Clear search
                                        </button>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
