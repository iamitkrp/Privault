"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { Plus, Trash2, ImageIcon, X, Maximize2, Copy, Check, Tag, Hash } from "lucide-react";

/* ─── Types ─── */

interface PromptVariant {
    main: string;
    negative: string;
    notes: string;
}

export interface PromptSection {
    title: string;
    packName: string;
    tags: string[];
    images: (string | null)[];
    variants: { V1: PromptVariant; V2: PromptVariant; V3: PromptVariant };
}

export interface PromptBoardData {
    sections: PromptSection[];
}

const MARKER = "<!--PROMPT_BOARD_V2-->";

function emptyVariant(): PromptVariant {
    return { main: "", negative: "", notes: "" };
}

function emptySection(title: string): PromptSection {
    return {
        title,
        packName: "",
        tags: [],
        images: [null, null, null, null],
        variants: { V1: emptyVariant(), V2: emptyVariant(), V3: emptyVariant() },
    };
}

function defaultBoard(): PromptBoardData {
    return { sections: [emptySection("Section 1")] };
}

export function serializePromptBoard(data: PromptBoardData): string {
    return `${MARKER}\n${JSON.stringify(data)}`;
}

export function parsePromptBoard(content: string): PromptBoardData | null {
    if (!content.includes(MARKER)) return null;
    const jsonStr = content.replace(MARKER, "").trim();
    if (!jsonStr) return defaultBoard();
    try {
        const parsed = JSON.parse(jsonStr) as PromptBoardData;
        parsed.sections = parsed.sections.map((s) => ({
            ...s,
            tags: s.tags || [],
            packName: s.packName || (s as any).model || "",
        }));
        return parsed;
    } catch {
        return defaultBoard();
    }
}

/* ─── Copy button ─── */

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(() => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }, [text]);

    if (!text) return null;

    return (
        <button
            type="button"
            onClick={handleCopy}
            className={`p-1 rounded-md transition-all shrink-0 ${copied ? "text-brand" : "text-fg-muted/40 hover:text-fg-secondary hover:bg-foreground/5"}`}
            title="Copy to clipboard"
        >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
    );
}

/* ─── Tag input ─── */

function TagInput({
    tags,
    onChange,
}: {
    tags: string[];
    onChange: (tags: string[]) => void;
}) {
    const [input, setInput] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const addTag = (raw: string) => {
        const val = raw.trim().toLowerCase();
        if (val && !tags.includes(val)) onChange([...tags, val]);
        setInput("");
    };

    return (
        <div
            className="flex flex-wrap items-center gap-1.5 min-h-[32px] bg-foreground/[0.02] border border-border/20 rounded-lg px-2.5 py-1.5 cursor-text transition-colors focus-within:border-brand/40"
            onClick={() => inputRef.current?.focus()}
        >
            {tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-foreground/[0.06] text-[11px] font-medium text-fg-secondary">
                    <Hash className="w-2.5 h-2.5 opacity-50" />
                    {tag}
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onChange(tags.filter((t) => t !== tag)); }}
                        className="ml-0.5 text-fg-muted hover:text-foreground transition-colors"
                    >
                        <X className="w-2.5 h-2.5" />
                    </button>
                </span>
            ))}
            <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                    if ((e.key === "Enter" || e.key === ",") && input.trim()) {
                        e.preventDefault();
                        addTag(input);
                    }
                    if (e.key === "Backspace" && !input && tags.length > 0) {
                        onChange(tags.slice(0, -1));
                    }
                }}
                onBlur={() => { if (input.trim()) addTag(input); }}
                placeholder={tags.length === 0 ? "Add tags..." : ""}
                className="bg-transparent outline-none text-xs text-foreground placeholder:text-fg-muted/35 min-w-[60px] flex-1 py-0.5"
            />
        </div>
    );
}

/* ─── Image slot ─── */

function ImageSlot({
    src,
    onSet,
    onRemove,
    size = "md",
}: {
    src: string | null;
    onSet: (dataUrl: string) => void;
    onRemove: () => void;
    size?: "sm" | "md" | "lg";
}) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = useCallback(
        (file: File) => {
            if (!file.type.startsWith("image/")) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) onSet(e.target.result as string);
            };
            reader.readAsDataURL(file);
        },
        [onSet]
    );

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
        },
        [handleFile]
    );

    if (src) {
        return (
            <div className="relative group aspect-square rounded-lg overflow-hidden bg-black/5 border border-border/20">
                <img src={src} alt="" className="w-full h-full object-cover" draggable={false} />
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onRemove(); }}
                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                >
                    <X className="w-3 h-3" />
                </button>
            </div>
        );
    }

    const iconSize = size === "lg" ? "w-7 h-7" : size === "md" ? "w-5 h-5" : "w-3.5 h-3.5";

    return (
        <div
            className="aspect-square rounded-lg border-2 border-dashed border-border/35 hover:border-brand/50 flex flex-col items-center justify-center cursor-pointer transition-all bg-foreground/[0.01] hover:bg-brand/[0.03] gap-1"
            onClick={() => inputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            tabIndex={0}
        >
            <ImageIcon className={`text-fg-muted/25 ${iconSize}`} />
            {size !== "sm" && <span className="text-[9px] text-fg-muted/30 font-medium">Drop / Click</span>}
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                    e.target.value = "";
                }}
            />
        </div>
    );
}

/* ─── Section detail modal ─── */

function SectionModal({
    section,
    onChange,
    onClose,
}: {
    section: PromptSection;
    onChange: (updated: PromptSection) => void;
    onClose: () => void;
}) {
    const [activeVariant, setActiveVariant] = useState<"V1" | "V2" | "V3">("V1");
    const variant = section.variants[activeVariant];
    const [mounted, setMounted] = useState(false);
    const [showNegative, setShowNegative] = useState(!!variant.negative);
    const [showNotes, setShowNotes] = useState(!!variant.notes);

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        setShowNegative(!!section.variants[activeVariant].negative);
        setShowNotes(!!section.variants[activeVariant].notes);
    }, [activeVariant, section.variants]);

    const setImage = (idx: number, dataUrl: string | null) => {
        const images = [...section.images];
        images[idx] = dataUrl;
        onChange({ ...section, images });
    };

    const setVariantField = (field: keyof PromptVariant, value: string) => {
        onChange({
            ...section,
            variants: {
                ...section.variants,
                [activeVariant]: { ...variant, [field]: value },
            },
        });
    };

    if (!mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 sm:p-6" onClick={onClose}>
            <div
                className="bg-background border border-border/50 shadow-2xl w-[95vw] max-w-[1280px] h-[90vh] overflow-hidden flex flex-col rounded-2xl slide-in-bottom"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="shrink-0 border-b border-border/30">
                    <div className="flex items-start justify-between px-8 pt-6 pb-4">
                        <div className="flex-1 min-w-0 mr-6">
                            <input
                                type="text"
                                value={section.title}
                                onChange={(e) => onChange({ ...section, title: e.target.value })}
                                className="bg-transparent text-2xl font-bold text-foreground outline-none placeholder:text-fg-muted/30 w-full tracking-tight"
                                placeholder="Section title..."
                            />
                        </div>
                        <button onClick={onClose} className="p-2.5 rounded-xl text-fg-muted hover:text-foreground hover:bg-foreground/5 border border-transparent hover:border-border/30 transition-all shrink-0">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex items-center gap-4 px-8 pb-4">
                        <div className="flex items-center gap-2 shrink-0">
                            <Tag className="w-3.5 h-3.5 text-fg-muted/40" />
                            <input
                                type="text"
                                value={section.packName}
                                onChange={(e) => onChange({ ...section, packName: e.target.value })}
                                placeholder="Pack name (e.g. Russia)"
                                className="bg-foreground/[0.03] border border-border/25 rounded-lg px-3 py-1.5 text-xs font-medium text-foreground placeholder:text-fg-muted/30 outline-none focus:border-brand/40 transition-colors w-52"
                            />
                        </div>
                        <div className="h-5 w-px bg-border/25 shrink-0" />
                        <div className="flex-1 min-w-0">
                            <TagInput
                                tags={section.tags}
                                onChange={(tags) => onChange({ ...section, tags })}
                            />
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 flex min-h-0 overflow-hidden">
                    {/* Left — images */}
                    <div className="w-[380px] min-w-[380px] p-6 border-r border-border/25 bg-foreground/[0.01] overflow-y-auto custom-scrollbar">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-fg-muted/50 mb-4 block">Reference Images</span>
                        <div className="grid grid-cols-2 gap-4">
                            {section.images.map((img, i) => (
                                <ImageSlot
                                    key={i}
                                    src={img}
                                    onSet={(url) => setImage(i, url)}
                                    onRemove={() => setImage(i, null)}
                                    size="lg"
                                />
                            ))}
                        </div>
                    </div>

                    {/* Right — prompts */}
                    <div className="flex-1 min-w-0 flex flex-col overflow-y-auto custom-scrollbar">
                        {/* Variant tabs */}
                        <div className="flex items-center gap-2 px-8 pt-6 pb-4 shrink-0">
                            {(["V1", "V2", "V3"] as const).map((v) => (
                                <button
                                    key={v}
                                    type="button"
                                    onClick={() => setActiveVariant(v)}
                                    className={`px-5 py-2 text-xs font-bold uppercase tracking-widest rounded-full border-2 transition-all ${
                                        activeVariant === v
                                            ? "bg-foreground text-background border-foreground shadow-md"
                                            : "bg-transparent text-fg-secondary border-border/25 hover:bg-foreground/5 hover:text-foreground hover:border-border/50"
                                    }`}
                                >
                                    {v}
                                </button>
                            ))}
                        </div>

                        {/* Fields */}
                        <div className="px-8 pb-8 flex flex-col gap-5 flex-1">
                            {/* Main prompt */}
                            <div className="flex-1 flex flex-col">
                                <div className="flex items-center justify-between mb-2.5">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-fg-secondary">Prompt</label>
                                    <CopyButton text={variant.main} />
                                </div>
                                <textarea
                                    value={variant.main}
                                    onChange={(e) => setVariantField("main", e.target.value)}
                                    placeholder="Describe the image you want to generate..."
                                    className="w-full flex-1 min-h-[200px] bg-foreground/[0.02] border border-border/25 rounded-xl px-5 py-4 text-[14px] text-foreground placeholder:text-fg-muted/30 outline-none focus:border-brand/40 resize-none transition-colors leading-[1.7]"
                                />
                            </div>

                            {/* Negative — collapsible */}
                            {showNegative && (
                                <div>
                                    <div className="flex items-center justify-between mb-2.5">
                                        <label className="text-[11px] font-bold uppercase tracking-widest text-fg-secondary">Negative</label>
                                        <div className="flex items-center gap-1">
                                            <CopyButton text={variant.negative} />
                                            {!variant.negative && (
                                                <button type="button" onClick={() => setShowNegative(false)} className="p-1 rounded-md text-fg-muted/30 hover:text-fg-secondary transition-colors" title="Hide">
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <textarea
                                        value={variant.negative}
                                        onChange={(e) => setVariantField("negative", e.target.value)}
                                        placeholder="What to exclude..."
                                        rows={4}
                                        className="w-full bg-foreground/[0.02] border border-border/25 rounded-xl px-5 py-4 text-[14px] text-foreground placeholder:text-fg-muted/30 outline-none focus:border-brand/40 resize-none transition-colors leading-[1.7]"
                                    />
                                </div>
                            )}

                            {/* Notes — collapsible */}
                            {showNotes && (
                                <div>
                                    <div className="flex items-center justify-between mb-2.5">
                                        <label className="text-[11px] font-bold uppercase tracking-widest text-fg-secondary">Notes</label>
                                        <div className="flex items-center gap-1">
                                            <CopyButton text={variant.notes} />
                                            {!variant.notes && (
                                                <button type="button" onClick={() => setShowNotes(false)} className="p-1 rounded-md text-fg-muted/30 hover:text-fg-secondary transition-colors" title="Hide">
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <textarea
                                        value={variant.notes}
                                        onChange={(e) => setVariantField("notes", e.target.value)}
                                        placeholder="Settings, seeds, CFG, sampler..."
                                        rows={4}
                                        className="w-full bg-foreground/[0.02] border border-border/25 rounded-xl px-5 py-4 text-[14px] text-foreground placeholder:text-fg-muted/30 outline-none focus:border-brand/40 resize-none transition-colors leading-[1.7]"
                                    />
                                </div>
                            )}

                            {/* Toggle buttons */}
                            {(!showNegative || !showNotes) && (
                                <div className="flex items-center gap-2.5">
                                    {!showNegative && (
                                        <button
                                            type="button"
                                            onClick={() => setShowNegative(true)}
                                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-fg-muted hover:text-foreground border border-dashed border-border/30 hover:border-border/60 hover:bg-foreground/[0.02] transition-all"
                                        >
                                            <Plus className="w-3.5 h-3.5" /> Negative
                                        </button>
                                    )}
                                    {!showNotes && (
                                        <button
                                            type="button"
                                            onClick={() => setShowNotes(true)}
                                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-fg-muted hover:text-foreground border border-dashed border-border/30 hover:border-border/60 hover:bg-foreground/[0.02] transition-all"
                                        >
                                            <Plus className="w-3.5 h-3.5" /> Notes
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}

/* ─── Compact section card ─── */

function SectionCard({
    section,
    onChange,
    onRemove,
    canRemove,
}: {
    section: PromptSection;
    onChange: (updated: PromptSection) => void;
    onRemove: () => void;
    canRemove: boolean;
}) {
    const [modalOpen, setModalOpen] = useState(false);
    const imageCount = section.images.filter(Boolean).length;
    const activePrompt = section.variants.V1.main || section.variants.V2.main || section.variants.V3.main;
    const filledVariants = (["V1", "V2", "V3"] as const).filter((v) => section.variants[v].main.trim());

    return (
        <>
            <div
                className="group rounded-xl border border-border/40 overflow-hidden bg-foreground/[0.015] hover:border-border/60 transition-all cursor-pointer"
                onClick={() => setModalOpen(true)}
            >
                <div className="flex items-stretch">
                    {/* Left — image preview */}
                    <div className="w-[130px] min-w-[130px] bg-foreground/[0.02] border-r border-border/20 p-2">
                        <div className="grid grid-cols-2 gap-1 h-full">
                            {section.images.map((img, i) => (
                                <div key={i} className="aspect-square rounded-md overflow-hidden bg-foreground/[0.025]">
                                    {img ? (
                                        <img src={img} alt="" className="w-full h-full object-cover" draggable={false} />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <ImageIcon className="w-3 h-3 text-fg-muted/15" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right — info */}
                    <div className="flex-1 min-w-0 flex flex-col py-2.5 px-4">
                        {/* Title + actions */}
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-foreground truncate">{section.title || "Untitled"}</span>
                            <div className="flex items-center gap-1 shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(true)}
                                    className="p-1.5 rounded-lg text-fg-muted hover:text-foreground hover:bg-foreground/5 transition-colors"
                                    title="Open detail view"
                                >
                                    <Maximize2 className="w-3.5 h-3.5" />
                                </button>
                                {canRemove && (
                                    <button
                                        type="button"
                                        onClick={onRemove}
                                        className="p-1.5 rounded-lg text-fg-muted hover:text-error hover:bg-error/5 transition-colors"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Pills */}
                        <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                            {section.packName && (
                                <span className="px-2 py-0.5 rounded-full bg-brand/10 text-[10px] font-semibold text-brand">{section.packName}</span>
                            )}
                            {section.tags.map((tag) => (
                                <span key={tag} className="px-1.5 py-0.5 rounded-full bg-foreground/[0.05] text-[10px] font-medium text-fg-secondary flex items-center gap-0.5">
                                    <Hash className="w-2 h-2 opacity-50" />{tag}
                                </span>
                            ))}
                            {imageCount > 0 && (
                                <span className="px-1.5 py-0.5 rounded-full bg-foreground/[0.05] text-[10px] font-medium text-fg-secondary">{imageCount} img</span>
                            )}
                            {filledVariants.length > 0 && (
                                <span className="px-1.5 py-0.5 rounded-full bg-foreground/[0.05] text-[10px] font-medium text-fg-secondary">{filledVariants.join(" ")}</span>
                            )}
                        </div>

                        {/* Prompt preview */}
                        {activePrompt && (
                            <p className="text-xs text-fg-muted leading-relaxed line-clamp-2 mt-2">{activePrompt}</p>
                        )}
                    </div>
                </div>
            </div>

            {modalOpen && (
                <SectionModal
                    section={section}
                    onChange={onChange}
                    onClose={() => setModalOpen(false)}
                />
            )}
        </>
    );
}

/* ─── Board ─── */

export function PromptBoard({
    data,
    onChange,
}: {
    data: PromptBoardData;
    onChange: (data: PromptBoardData) => void;
}) {
    const updateSection = (idx: number, section: PromptSection) => {
        const sections = [...data.sections];
        sections[idx] = section;
        onChange({ ...data, sections });
    };

    const removeSection = (idx: number) => {
        onChange({ ...data, sections: data.sections.filter((_, i) => i !== idx) });
    };

    const addSection = () => {
        onChange({
            ...data,
            sections: [...data.sections, emptySection(`Section ${data.sections.length + 1}`)],
        });
    };

    return (
        <div className="flex-1 flex flex-col gap-3">
            {data.sections.map((section, i) => (
                <SectionCard
                    key={i}
                    section={section}
                    onChange={(s) => updateSection(i, s)}
                    onRemove={() => removeSection(i)}
                    canRemove={data.sections.length > 1}
                />
            ))}

            <button
                type="button"
                onClick={addSection}
                className="flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-border/40 text-fg-secondary hover:text-foreground hover:border-border/70 hover:bg-foreground/[0.02] transition-all text-xs font-bold uppercase tracking-widest"
            >
                <Plus className="w-3.5 h-3.5" />
                Add Section
            </button>
        </div>
    );
}
