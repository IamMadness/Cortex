import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, CornerDownRight, Clock, Anchor, ChevronRight, Tag, Hash, Palette, Eye, GitBranch, GitMerge, Timer } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Node as NodeType } from '../types';

interface NodeProps {
  node: NodeType;
  level: number;
  onAddChild: (parentId: number) => void;
  onDelete: (id: number) => void;
  onUpdate: (id: number, updates: Partial<NodeType>) => void;
  onFocusLevel: () => void;
  onFocusBranch: () => void;
  isLevelFocused: boolean;
  isBranchFocused: boolean;
}

const COLORS = [
  { name: 'cyan', class: 'node-cyan', tag: 'tag-cyan', hex: '#00f2ff' },
  { name: 'pink', class: 'node-pink', tag: 'tag-pink', hex: '#ff00e5' },
  { name: 'gold', class: 'node-gold', tag: 'tag-gold', hex: '#ffcc00' },
  { name: 'purple', class: 'node-purple', tag: 'tag-purple', hex: '#bf00ff' },
];

export const Node: React.FC<NodeProps> = ({ node, level, onAddChild, onDelete, onUpdate, onFocusLevel, onFocusBranch, isLevelFocused, isBranchFocused }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(node.content);
  const [tagInput, setTagInput] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (content !== node.content) {
      onUpdate(node.id, { content });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!node.tags?.includes(newTag)) {
        onUpdate(node.id, { tags: [...(node.tags || []), newTag] });
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onUpdate(node.id, { tags: (node.tags || []).filter(t => t !== tagToRemove) });
  };

  const cycleColor = () => {
    const currentIndex = COLORS.findIndex(c => c.name === node.color) || 0;
    const nextIndex = (currentIndex + 1) % COLORS.length;
    onUpdate(node.id, { color: COLORS[nextIndex].name });
  };

  const formattedTime = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(node.createdAt);

  const currentColor = COLORS.find(c => c.name === node.color) || COLORS[0];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative mb-8"
      style={{ marginLeft: `${level * 2.5}rem` }}
    >
      {level > 0 && (
        <>
          <div className="absolute -left-6 top-10 bottom-[-2rem] w-px bg-gradient-to-b from-neural-primary/40 via-neural-primary/10 to-transparent" />
          <div className="absolute -left-6 top-10 w-6 h-px bg-neural-primary/40" />
          <div className="absolute -left-[1.65rem] top-[2.25rem] w-1.5 h-1.5 rounded-full bg-neural-primary shadow-[0_0_10px_rgba(0,242,255,0.8)]" />
        </>
      )}
      
      <div className="flex gap-4">
        <div className={`flex-1 rounded-[2rem] border transition-all duration-700 p-7 relative overflow-hidden temporal-log ${
          isEditing 
            ? 'bg-neural-surface border-neural-primary/40 shadow-[0_0_50px_rgba(0,242,255,0.1)]' 
            : `bg-neural-surface/30 border-white/5 ${currentColor.class}`
        }`}>
          {/* Neuron Header */}
          <div className="flex items-center justify-between mb-5 border-b border-white/5 pb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                <Timer className="w-3 h-3 text-neural-primary" />
                <span className="text-[10px] font-mono text-white/60 font-bold tracking-tight">[T-SYNC: {formattedTime}]</span>
              </div>
              <div className="flex gap-2">
                {node.tags?.map(tag => (
                  <span 
                    key={tag} 
                    className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border flex items-center gap-1 group/tag ${currentColor.tag}`}
                  >
                    <Hash className="w-2.5 h-2.5 opacity-50" />
                    {tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-white opacity-0 group-hover/tag:opacity-100 transition-opacity">
                      <Plus className="w-2.5 h-2.5 rotate-45" />
                    </button>
                  </span>
                ))}
                {isEditing && (
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-white/5 rounded-lg border border-white/10">
                    <Tag className="w-2.5 h-2.5 text-white/40" />
                    <input 
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      className="bg-transparent border-none focus:ring-0 p-0 text-[9px] w-16 text-white placeholder-white/20 uppercase font-bold"
                      placeholder="ADD TAG..."
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={cycleColor}
                className="p-1.5 rounded-lg hover:bg-white/5 text-white/20 hover:text-neural-primary transition-all flex items-center gap-2 group/color"
              >
                <div className={`w-2 h-2 rounded-full shadow-[0_0_10px_currentColor]`} style={{ backgroundColor: currentColor.hex }} />
                <Palette className="w-3.5 h-3.5 group-hover/color:rotate-12 transition-transform" />
              </button>
              <div className="flex gap-1">
                <div className={`w-1.5 h-1.5 rounded-full animate-pulse shadow-[0_0_8px_rgba(0,242,255,0.5)] bg-neural-primary`} />
                <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
              </div>
            </div>
          </div>

          {isEditing ? (
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent border-none focus:ring-0 p-0 text-neural-text font-sans text-base leading-relaxed placeholder-white/10 resize-none"
              placeholder="Log new temporal event..."
            />
          ) : (
            <div 
              onClick={() => setIsEditing(true)}
              className="prose prose-invert max-w-none prose-p:text-white/70 prose-p:leading-relaxed prose-p:text-base prose-headings:text-neural-primary prose-headings:font-display prose-headings:font-bold cursor-text selection:bg-neural-primary selection:text-neural-bg"
            >
              {content ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
              ) : (
                <span className="text-white/10 italic font-mono text-xs tracking-[0.2em] uppercase">Awaiting temporal input...</span>
              )}
            </div>
          )}
          
          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => onAddChild(node.id)}
                className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-neural-primary hover:bg-neural-primary hover:text-neural-bg transition-all border border-neural-primary/20 rounded-2xl bg-neural-primary/5"
                title="Branch Timeline"
              >
                <GitMerge className="w-4 h-4" />
                Branch
              </button>
              
              <div className="w-px h-4 bg-white/10 mx-1" />
              
              <button
                onClick={onFocusLevel}
                className={`flex items-center gap-2 px-3 py-2 text-[9px] font-bold uppercase tracking-widest transition-all border rounded-xl ${
                  isLevelFocused ? 'bg-neural-primary text-neural-bg border-neural-primary' : 'text-white/40 border-white/10 hover:border-neural-primary/40 hover:text-neural-primary'
                }`}
                title="Isolate Epoch"
              >
                <Eye className="w-3.5 h-3.5" />
                Epoch
              </button>
              
              <button
                onClick={onFocusBranch}
                className={`flex items-center gap-2 px-3 py-2 text-[9px] font-bold uppercase tracking-widest transition-all border rounded-xl ${
                  isBranchFocused ? 'bg-neural-primary text-neural-bg border-neural-primary' : 'text-white/40 border-white/10 hover:border-neural-primary/40 hover:text-neural-primary'
                }`}
                title="Isolate Timeline"
              >
                <GitBranch className="w-3.5 h-3.5" />
                Timeline
              </button>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden xl:flex items-center gap-2 text-[9px] font-mono text-white/20 uppercase tracking-widest font-bold">
                <Anchor className="w-3.5 h-3.5" />
                Temporal Integrity: 100%
              </div>
              
              <button
                onClick={() => {
                  if (confirmDelete && node.id) {
                    onDelete(node.id);
                  } else {
                    setConfirmDelete(true);
                    setTimeout(() => setConfirmDelete(false), 3000);
                  }
                }}
                className={`p-2.5 transition-all border rounded-xl ${
                  confirmDelete 
                    ? 'bg-neural-secondary/20 text-neural-secondary border-neural-secondary/40' 
                    : 'text-white/10 border-transparent hover:text-neural-secondary hover:border-neural-secondary/20 hover:bg-neural-secondary/5'
                }`}
                title={confirmDelete ? "Click again to erase" : "Erase Log"}
              >
                <Trash2 className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
