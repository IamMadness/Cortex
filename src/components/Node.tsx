import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, CornerDownRight, Clock, Anchor, ChevronRight, Tag, Hash, Palette, Eye, GitBranch, GitMerge, Timer, FolderPlus, ExternalLink, Link2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Node as NodeType } from '../types';
import { db } from '../db/db';

interface NodeProps {
  node: NodeType;
  level: number;
  onAddChild: (parentId: number) => void;
  onDelete: (id: number) => void;
  onUpdate: (id: number, updates: Partial<NodeType>) => void;
  onSortChildren: (parentId: number) => void;
  onFocusLevel: () => void;
  onFocusBranch: () => void;
  isLevelFocused: boolean;
  isBranchFocused: boolean;
  onOpenMatter: (id: number) => void;
  isLinkingMode?: boolean;
  isLinkingSource?: boolean;
  onStartLink?: (id: number) => void;
  onCompleteLink?: (id: number) => void;
}

const COLORS = [
  { name: 'cyan', class: 'node-cyan', tag: 'tag-cyan', hex: '#00f2ff' },
  { name: 'pink', class: 'node-pink', tag: 'tag-pink', hex: '#ff00e5' },
  { name: 'gold', class: 'node-gold', tag: 'tag-gold', hex: '#ffcc00' },
  { name: 'purple', class: 'node-purple', tag: 'tag-purple', hex: '#bf00ff' },
];

export const Node: React.FC<NodeProps> = ({ 
  node, level, onAddChild, onDelete, onUpdate, onSortChildren,
  onFocusLevel, onFocusBranch, isLevelFocused, isBranchFocused, onOpenMatter,
  isLinkingMode, isLinkingSource, onStartLink, onCompleteLink
}) => {
  const [isEditing, setIsEditing] = useState(node.content === '');
  const [content, setContent] = useState(node.content);
  const [tagInput, setTagInput] = useState('');
  const [linkInput, setLinkInput] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setContent(node.content);
  }, [node.content]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [isEditing]);

  const [suggestions, setSuggestions] = useState<NodeType[]>([]);

  useEffect(() => {
    if (isLinkingSource) {
      // Fetch nodes in the same matterId, sorted by updatedAt
      db.nodes
        .where('matterId')
        .equals(node.matterId)
        .filter(n => n.id !== node.id)
        .reverse()
        .sortBy('updatedAt')
        .then(nodes => setSuggestions(nodes.slice(0, 5)));
    } else {
      setSuggestions([]);
    }
  }, [isLinkingSource, node.matterId, node.id]);

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

  const handleAddLink = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && linkInput.trim()) {
      e.preventDefault();
      const newLink = linkInput.trim();
      if (!node.links?.includes(newLink)) {
        onUpdate(node.id, { links: [...(node.links || []), newLink] });
      }
      setLinkInput('');
    }
  };

  const removeLink = (linkToRemove: string) => {
    onUpdate(node.id, { links: (node.links || []).filter(l => l !== linkToRemove) });
  };

  const cycleColor = () => {
    const currentIndex = COLORS.findIndex(c => c.name === node.color);
    const nextIndex = (currentIndex + 1) % COLORS.length;
    onUpdate(node.id, { color: COLORS[nextIndex].name });
  };

  const handleSpawnProject = async () => {
    if (!node.id) return;
    const title = content ? content.split('\n')[0].substring(0, 40) : 'New Sub-Project';
    const newMatterId = await db.matters.add({
      title,
      tags: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      parentMatterId: node.matterId,
    });
    onUpdate(node.id, { linkedMatterId: newMatterId as number });
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
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      whileHover={{ x: 4 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 25 }}
      className="group relative mb-2"
      style={{ marginLeft: `${level * 2.5}rem` }}
    >
      {level > 0 && (
        <>
          <div className="absolute -left-6 top-4 bottom-[-0.5rem] w-px bg-gradient-to-b from-neural-primary/60 via-neural-primary/20 to-transparent" />
          <div className="absolute -left-6 top-4 w-6 h-px bg-neural-primary/60" />
          <div className="absolute -left-[1.65rem] top-[0.75rem] w-1.5 h-1.5 rounded-full bg-neural-primary shadow-[0_0_12px_rgba(0,242,255,1)] animate-pulse" />
        </>
      )}
      
      <div className="flex gap-2">
        <div id={`node-${node.id}`} className={`flex-1 rounded-lg transition-all duration-300 p-1 relative group/node hover:bg-white/[0.02] border border-transparent hover:border-white/[0.05] hover:scale-[1.01] hover:border-white/10 ${isEditing || isLevelFocused || isBranchFocused ? 'ring-1 ring-neural-primary/30 shadow-[0_0_15px_rgba(0,242,255,0.1)]' : ''}`}>
          <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full transition-all duration-300 group-hover/node:w-1" style={{ backgroundColor: currentColor.hex, boxShadow: `0 0 8px ${currentColor.hex}` }} />
          <div className="pl-3">
          
          {isLinkingMode && !isLinkingSource && (
            <div 
              className="absolute inset-0 bg-neural-primary/5 border-2 border-dashed border-neural-primary/30 rounded-lg z-10 flex items-center justify-center cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
              onClick={() => onCompleteLink?.(node.id!)}
            >
              <span className="bg-neural-bg text-neural-primary px-3 py-1 rounded-full text-xs font-medium border border-neural-primary/30">Connect Synapse</span>
            </div>
          )}
          {isLinkingSource && (
            <div className="absolute inset-0 border-2 border-neural-primary/50 rounded-lg z-10 pointer-events-none" />
          )}
          {isLinkingSource && suggestions.length > 0 && (
            <div className="absolute top-full left-0 mt-2 w-full bg-black border border-neural-primary/30 rounded-lg z-20 p-2 shadow-xl">
              <div className="text-[10px] text-neural-primary/60 uppercase tracking-wider mb-2">Suggested Targets</div>
              {suggestions.map(s => (
                <button
                  key={s.id}
                  onClick={() => onCompleteLink?.(s.id!)}
                  className="w-full text-left text-xs text-white/80 hover:text-neural-primary hover:bg-white/5 p-1 rounded transition-colors truncate"
                >
                  {s.content.substring(0, 30)}...
                </button>
              ))}
            </div>
          )}

          {/* Neuron Header */}
          <div className="flex items-center justify-between mb-2 opacity-0 group-hover/node:opacity-50 transition-opacity">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Timer className="w-3 h-3 text-white/40" />
                <span className="text-[10px] font-mono text-white/40 tracking-tight">{formattedTime}</span>
              </div>
              <div className="flex gap-2">
                {node.tags?.map(tag => (
                  <span 
                    key={tag} 
                    className={`px-1.5 py-0.5 rounded text-[9px] font-medium uppercase tracking-wider flex items-center gap-1 group/tag ${currentColor.tag}`}
                  >
                    <Hash className="w-2 h-2 opacity-50" />
                    {tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-white opacity-0 group-hover/tag:opacity-100 transition-opacity">
                      <Plus className="w-2 h-2 rotate-45" />
                    </button>
                  </span>
                ))}
                {isEditing && (
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded border border-white/10">
                    <Tag className="w-2 h-2 text-white/40" />
                    <input 
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      className="bg-transparent border-none focus:ring-0 p-0 text-[9px] w-16 text-white placeholder-white/20 uppercase font-medium"
                      placeholder="ADD TAG..."
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => onSortChildren(node.id!)}
                className="p-1 rounded hover:bg-white/10 text-white/50 hover:text-neural-primary border border-white/10 hover:border-neural-primary/50 transition-colors text-[10px] font-mono"
              >
                TVA
              </button>
              <button 
                onClick={cycleColor}
                className="p-1 rounded hover:bg-white/5 text-white/20 hover:text-white transition-colors flex items-center gap-1.5 group/color"
              >
                <div className={`w-1.5 h-1.5 rounded-full`} style={{ backgroundColor: currentColor.hex }} />
                <Palette className="w-3 h-3 group-hover/color:rotate-12 transition-transform" />
              </button>
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
              className="w-full bg-black/20 border border-white/10 rounded-lg focus:ring-1 focus:ring-neural-primary p-2 text-neural-text font-sans text-sm leading-relaxed placeholder-white/20 resize-none transition-all"
              placeholder="Log new temporal event..."
            />
          ) : (
            <div 
              onClick={() => setIsEditing(true)}
              className="prose prose-invert max-w-none prose-p:text-white/70 prose-p:leading-relaxed prose-p:text-sm prose-headings:text-neural-primary prose-headings:font-display prose-headings:font-bold cursor-text selection:bg-neural-primary selection:text-neural-bg hover:bg-white/5 p-1.5 -m-1.5 rounded-lg transition-colors border border-transparent hover:border-white/10"
            >
              {content ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
              ) : (
                <span className="text-white/20 italic font-mono text-xs tracking-[0.2em] uppercase">Click to add temporal input...</span>
              )}
            </div>
          )}

          {/* Links Section */}
          {(node.links && node.links.length > 0 || isEditing) && (
            <div className="mt-2 flex flex-wrap gap-2 items-center">
              {node.links?.map(link => (
                <div key={link} className="flex items-center gap-1 bg-white/5 border border-white/10 rounded px-2 py-1 group/link">
                  <ExternalLink className="w-3 h-3 text-neural-primary" />
                  <a href={link} target="_blank" rel="noopener noreferrer" className="text-xs text-white/70 hover:text-neural-primary truncate max-w-[200px]">
                    {link}
                  </a>
                  <button onClick={() => removeLink(link)} className="opacity-0 group-hover/link:opacity-100 text-white/40 hover:text-red-400 transition-opacity ml-1">
                    <Plus className="w-3 h-3 rotate-45" />
                  </button>
                </div>
              ))}
              {isEditing && (
                <div className="flex items-center gap-1 px-2 py-1 rounded border border-white/10 bg-black/20">
                  <Link2 className="w-3 h-3 text-white/40" />
                  <input 
                    value={linkInput}
                    onChange={(e) => setLinkInput(e.target.value)}
                    onKeyDown={handleAddLink}
                    className="bg-transparent border-none focus:ring-0 p-0 text-xs w-32 text-white placeholder-white/20"
                    placeholder="Add link..."
                  />
                </div>
              )}
            </div>
          )}
          
          <div className="mt-2 pt-2 flex items-center justify-between opacity-0 group-hover/node:opacity-100 transition-opacity duration-200">
            <div className="flex items-center gap-1">
              <button
                onClick={() => onAddChild(node.id)}
                className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-medium text-white/40 hover:text-white hover:bg-white/5 transition-colors rounded"
                title="Branch Timeline"
              >
                <GitMerge className="w-3 h-3" />
                Branch
              </button>
              
              <div className="w-px h-3 bg-white/10 mx-1" />
              
              <button
                onClick={onFocusLevel}
                className={`flex items-center gap-1.5 px-2 py-1 text-[10px] font-medium transition-colors rounded ${
                  isLevelFocused ? 'text-neural-primary bg-neural-primary/10' : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
                title="Isolate Epoch"
              >
                <Eye className="w-3 h-3" />
                Epoch
              </button>
              
              <button
                onClick={onFocusBranch}
                className={`flex items-center gap-1.5 px-2 py-1 text-[10px] font-medium transition-colors rounded ${
                  isBranchFocused ? 'text-neural-primary bg-neural-primary/10' : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
                title="Isolate Timeline"
              >
                <GitBranch className="w-3 h-3" />
                Timeline
              </button>

              <div className="w-px h-3 bg-white/10 mx-1" />

              {!isLinkingMode && (
                <button
                  onClick={() => onStartLink?.(node.id!)}
                  className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-medium text-white/40 hover:text-white hover:bg-white/5 transition-colors rounded"
                  title="Create Synapse Link"
                >
                  <Link2 className="w-3 h-3" />
                  Link
                </button>
              )}

              {node.linkedMatterId ? (
                <button
                  onClick={() => onOpenMatter(node.linkedMatterId!)}
                  className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-medium text-neural-primary hover:bg-neural-primary/10 transition-colors rounded"
                  title="Open Linked Project"
                >
                  <ExternalLink className="w-3 h-3" />
                  Open Project
                </button>
              ) : (
                <button
                  onClick={handleSpawnProject}
                  className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-medium text-white/40 hover:text-white hover:bg-white/5 transition-colors rounded"
                  title="Extract to New Project"
                >
                  <FolderPlus className="w-3 h-3" />
                  Extract Project
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (confirmDelete && node.id) {
                    onDelete(node.id);
                  } else {
                    setConfirmDelete(true);
                    setTimeout(() => setConfirmDelete(false), 3000);
                  }
                }}
                className={`p-1.5 transition-colors rounded ${
                  confirmDelete 
                    ? 'text-red-400 bg-red-500/10' 
                    : 'text-white/20 hover:text-red-400 hover:bg-red-500/10'
                }`}
                title={confirmDelete ? "Click again to erase" : "Erase Log"}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
