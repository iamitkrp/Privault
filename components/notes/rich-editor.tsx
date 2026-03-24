"use client";

import { useEditor, EditorContent, Extension } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import Dropcursor from '@tiptap/extension-dropcursor'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import { Color } from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import FontFamily from '@tiptap/extension-font-family'
import { useEffect, useState, forwardRef, useImperativeHandle, useCallback } from 'react'

// Custom FontSize extension via TextStyle
const FontSize = Extension.create({
    name: 'fontSize',
    addOptions() {
        return { types: ['textStyle'] };
    },
    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    fontSize: {
                        default: null,
                        parseHTML: element => element.style.fontSize?.replace(/["']/g, '') || null,
                        renderHTML: attributes => {
                            if (!attributes.fontSize) return {};
                            return { style: `font-size: ${attributes.fontSize}` };
                        },
                    },
                },
            },
        ];
    },
    addCommands() {
        return {
            setFontSize: (fontSize: string) => ({ chain }: { chain: () => any }) => {
                return chain().setMark('textStyle', { fontSize }).run();
            },
            unsetFontSize: () => ({ chain }: { chain: () => any }) => {
                return chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run();
            },
        } as any;
    },
});


export interface EditorCommands {
    toggleBold: () => void;
    toggleItalic: () => void;
    toggleStrike: () => void;
    toggleCode: () => void;
    toggleCodeBlock: () => void;
    toggleBulletList: () => void;
    toggleOrderedList: () => void;
    toggleTaskList: () => void;
    toggleBlockquote: () => void;
    undo: () => void;
    redo: () => void;
    isActive: (nameOrAttributes: string | Record<string, unknown>, attributes?: Record<string, unknown>) => boolean;
    toggleUnderline: () => void;
    setTextAlign: (alignment: string) => void;
    toggleHighlight: () => void;
    toggleHeading: (level: 1 | 2 | 3) => void;
    setContent: (html: string) => void;
    setFontFamily: (fontFamily: string) => void;
    setFontSize: (fontSize: string) => void;
    getFontFamily: () => string;
    getFontSize: () => string;
}

export const RichEditor = forwardRef<EditorCommands | null, {
     content: string;
     onChange: (v: string) => void;
     onActiveStatesChange?: () => void;
}>(({ content, onChange, onActiveStatesChange }, ref) => {
    const [isMounted, setIsMounted] = useState(false);
    
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleTransaction = useCallback(() => {
        onActiveStatesChange?.();
    }, [onActiveStatesChange]);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            TaskList,
            TaskItem.configure({ nested: true }),
            Image.configure({ inline: true }),
            Dropcursor.configure({ color: 'var(--color-brand)', width: 3 }),
            Link.configure({ openOnClick: false }),
            Underline,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
                defaultAlignment: 'left',
            }),
            Highlight.configure({
                multicolor: true,
            }),
            TextStyle,
            Color,
            FontFamily,
            FontSize,
            Placeholder.configure({
                placeholder: 'Start typing securely or drag & drop an image...',
            }),
        ],
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        onTransaction: handleTransaction,
        onSelectionUpdate: handleTransaction,
        editorProps: {
            attributes: {
                class: 'flex-1 focus:outline-none focus:ring-0 resize-none font-sans tiptap-editor w-full border-0 !border-none !outline-none shadow-none focus:border-transparent focus:shadow-none bg-transparent',
            },
            handleDrop: (view, event, _slice, moved) => {
                if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
                    const file = event.dataTransfer.files[0];
                    if (file.type.startsWith('image/')) {
                        const imageNode = view.state.schema.nodes.image;
                        if (!imageNode) return false;
                        
                        const reader = new FileReader();
                        reader.onload = (readerEvent) => {
                            const node = imageNode.create({
                                src: readerEvent.target?.result
                            });
                            const transaction = view.state.tr.replaceSelectionWith(node);
                            view.dispatch(transaction);
                        };
                        reader.readAsDataURL(file);
                        return true; // handled
                    }
                }
                return false;
            },
            handlePaste: (view, event, _slice) => {
                if (event.clipboardData && event.clipboardData.files && event.clipboardData.files[0]) {
                    const file = event.clipboardData.files[0];
                    if (file.type.startsWith('image/')) {
                        const imageNode = view.state.schema.nodes.image;
                        if (!imageNode) return false;

                        const reader = new FileReader();
                        reader.onload = (readerEvent) => {
                            const node = imageNode.create({
                                src: readerEvent.target?.result
                            });
                            const transaction = view.state.tr.replaceSelectionWith(node);
                            view.dispatch(transaction);
                        };
                        reader.readAsDataURL(file);
                        return true; // handled
                    }
                }
                return false;
            }
        },
    });

    useImperativeHandle(ref, () => {
        if (!editor) return null as unknown as EditorCommands;
        return {
            toggleBold: () => editor.chain().focus().toggleBold().run(),
            toggleItalic: () => editor.chain().focus().toggleItalic().run(),
            toggleStrike: () => editor.chain().focus().toggleStrike().run(),
            toggleCode: () => editor.chain().focus().toggleCode().run(),
            toggleCodeBlock: () => editor.chain().focus().toggleCodeBlock().run(),
            toggleBulletList: () => editor.chain().focus().toggleBulletList().run(),
            toggleOrderedList: () => editor.chain().focus().toggleOrderedList().run(),
            toggleTaskList: () => editor.chain().focus().toggleTaskList().run(),
            toggleBlockquote: () => editor.chain().focus().toggleBlockquote().run(),
            undo: () => editor.chain().focus().undo().run(),
            redo: () => editor.chain().focus().redo().run(),
            toggleUnderline: () => editor.chain().focus().toggleUnderline().run(),
            setTextAlign: (alignment: string) => editor.chain().focus().setTextAlign(alignment).run(),
            toggleHighlight: () => editor.chain().focus().toggleHighlight().run(),
            toggleHeading: (level: 1 | 2 | 3) => editor.chain().focus().toggleHeading({ level }).run(),
            setContent: (html: string) => editor.commands.setContent(html),
            setFontFamily: (fontFamily: string) => {
                if (fontFamily === '') {
                    editor.chain().focus().unsetFontFamily().run();
                } else {
                    editor.chain().focus().setFontFamily(fontFamily).run();
                }
            },
            setFontSize: (fontSize: string) => {
                if (fontSize === '') {
                    (editor.chain().focus() as any).setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run();
                } else {
                    (editor.chain().focus() as any).setMark('textStyle', { fontSize }).run();
                }
            },
            getFontFamily: () => {
                return editor.getAttributes('textStyle').fontFamily || '';
            },
            getFontSize: () => {
                return editor.getAttributes('textStyle').fontSize || '';
            },
            isActive: (name: string | Record<string, unknown>, attributes?: Record<string, unknown>) => {
                if (typeof name === 'object') {
                    return editor.isActive(name as Record<string, unknown>);
                }
                return editor.isActive(name, attributes);
            },
        };
    }, [editor]);

    useEffect(() => {
        if (editor && isMounted && content !== editor.getHTML() && content && !editor.isFocused) {
            editor.commands.setContent(content, { emitUpdate: false });
        }
    }, [content, editor, isMounted]);

    if (!isMounted) return null;

    return (
        <div className="w-full flex-1 flex flex-col relative shrink-0">
             <EditorContent editor={editor} className="w-full h-full flex flex-col flex-1 [&>.ProseMirror]:flex-1 [&>.ProseMirror]:min-h-[50vh] [&>.ProseMirror]:outline-none [&>.ProseMirror]:border-none [&>.ProseMirror]:shadow-none [&>.ProseMirror]:ring-0 [&>.ProseMirror]:bg-transparent" />
        </div>
    );
});
RichEditor.displayName = "RichEditor";
