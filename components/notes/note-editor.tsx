"use client";

import { useState, useRef, useEffect } from "react";
import { VaultNote } from "@/types";
import { motion } from "framer-motion";
import { X, Check } from "lucide-react";

// The premium glassmorphic colors
const COLORS = [
     { id: 'default', value: 'default', css: 'transparent', label: 'Default' },
     { id: 'red', value: '#ef4444', css: '#ef4444', label: 'Red' },
     { id: 'blue', value: '#3b82f6', css: '#3b82f6', label: 'Blue' },
     { id: 'green', value: '#10b981', css: '#10b981', label: 'Green' },
     { id: 'yellow', value: '#f59e0b', css: '#f59e0b', label: 'Yellow' }
];

export function NoteEditor({
     note,
     onSave,
     onClose
}: {
     note?: VaultNote;
     onSave: (data: { title: string, content: string, color: string, id?: string }) => void;
     onClose: () => void;
}) {
     const [title, setTitle] = useState(note?.decrypted?.title || "");
     const [content, setContent] = useState(note?.decrypted?.content || "");
     const [color, setColor] = useState(note?.color || "default");
     const contentRef = useRef<HTMLTextAreaElement>(null);
     
     const handleSave = () => {
         if (!title.trim() && !content.trim()) return;
         onSave({ title, content, color, id: note?.id });
     };

     // Auto-resize textarea
     useEffect(() => {
         if (contentRef.current) {
             contentRef.current.style.height = 'auto';
             contentRef.current.style.height = contentRef.current.scrollHeight + 'px';
         }
     }, [content]);

     return (
          <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-background/80 backdrop-blur-md"
          >
              <div className="absolute inset-0 cursor-pointer" onClick={onClose} />
              
              <motion.div
                  initial={{ scale: 0.95, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.95, y: 20 }}
                  className="relative w-full max-w-3xl glass border border-border/50 shadow-[0_20px_60px_rgba(0,0,0,0.5)] z-10 flex flex-col max-h-[90vh] overflow-hidden"
              >
                   {/* Optional color tint */}
                   {color !== 'default' && (
                       <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundColor: color }}></div>
                   )}

                   {/* Header: Title */}
                   <div className="px-6 sm:px-8 pt-6 pb-4 border-b border-border/30 flex items-start justify-between relative z-10 bg-background/60">
                         <input 
                              type="text"
                              value={title}
                              onChange={(e) => setTitle(e.target.value)}
                              placeholder="Title"
                              className="w-full bg-transparent text-3xl font-bold text-foreground placeholder-fg-muted/50 focus:outline-none tracking-tight font-sans"
                         />
                         <button onClick={onClose} className="p-2 -mr-2 text-fg-muted hover:text-foreground transition-colors bg-background/50 hover:bg-background rounded-full shrink-0">
                              <X className="w-5 h-5" />
                         </button>
                   </div>

                   {/* Body: Content */}
                   <div className="px-6 sm:px-8 py-6 flex-1 overflow-y-auto relative z-10">
                        <textarea
                             ref={contentRef}
                             autoFocus
                             value={content}
                             onChange={(e) => setContent(e.target.value)}
                             placeholder="Write something securely..."
                             className="w-full min-h-[30vh] bg-transparent text-lg text-fg-secondary placeholder-fg-muted/30 focus:outline-none resize-none font-sans leading-relaxed block overflow-hidden"
                        />
                   </div>

                   {/* Footer: Tools & Save */}
                   <div className="px-6 sm:px-8 py-4 border-t border-border/30 flex items-center justify-between bg-black/40 backdrop-blur-md relative z-10">
                        <div className="flex gap-2">
                             {COLORS.map(c => (
                                 <button
                                     key={c.id}
                                     title={c.label}
                                     onClick={() => setColor(c.value)}
                                     className={`w-6 h-6 rounded-full border-2 transition-all ${color === c.value ? 'border-foreground scale-110 shadow-lg' : 'border-transparent hover:scale-110'}`}
                                     style={{ backgroundColor: c.id === 'default' ? 'rgba(255,255,255,0.1)' : c.css }}
                                 />
                             ))}
                        </div>
                        <button 
                            onClick={handleSave}
                            disabled={!title.trim() && !content.trim()}
                            className="bg-foreground hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed text-background px-6 py-2.5 uppercase mono text-[10px] tracking-widest flex items-center gap-2 transition-all font-bold shadow-lg shadow-foreground/20"
                        >
                            <Check className="w-3.5 h-3.5" />
                            {note ? 'Update' : 'Secure Save'}
                        </button>
                   </div>
              </motion.div>
          </motion.div>
     );
}
