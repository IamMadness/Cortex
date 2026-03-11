import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { Plus, Trash2, User, History, Compass, Anchor, Settings, Globe, Layers, Sparkles, Tag, Hash, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  activeMatterId: number | null;
  onSelectMatter: (id: number | null) => void;
  onNewMatter: () => void;
  onPurge: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeMatterId, onSelectMatter, onNewMatter, onPurge }) => {
  const matters = useLiveQuery(() => db.matters.toArray());
  const [tagInput, setTagInput] = useState('');

  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const handleDeleteMatter = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (confirmDelete === id) {
      await db.matters.delete(id);
      await db.nodes.where('matterId').equals(id).delete();
      
      if (activeMatterId === id) {
        onSelectMatter(null);
      }
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
      // Auto-reset confirm state after 3 seconds
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  const handleAddTag = async (e: React.KeyboardEvent, matterId: number) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const matter = await db.matters.get(matterId);
      if (matter) {
        const newTag = tagInput.trim().toLowerCase();
        const tags = matter.tags || [];
        if (!tags.includes(newTag)) {
          await db.matters.update(matterId, { tags: [...tags, newTag] });
        }
      }
      setTagInput('');
    }
  };

  const removeTag = async (matterId: number, tagToRemove: string) => {
    const matter = await db.matters.get(matterId);
    if (matter) {
      const tags = (matter.tags || []).filter(t => t !== tagToRemove);
      await db.matters.update(matterId, { tags });
    }
  };

  return (
    <aside className="w-[320px] h-screen bg-neural-bg/50 backdrop-blur-3xl border-r border-white/5 flex flex-col relative z-20">
      {/* Sidebar Header */}
      <div className="p-8 border-b border-white/5">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-neural-primary to-neural-info rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(0,242,255,0.2)]">
            <Globe className="w-7 h-7 text-neural-bg" />
          </div>
          <div>
            <h1 className="text-xl font-display text-neural-text font-bold tracking-tight">
              Neural<span className="text-neural-primary">Cortex</span>
            </h1>
            <p className="text-[9px] font-mono text-white/20 uppercase tracking-[0.3em] font-bold">Cortex_Interface_v9</p>
          </div>
        </div>

        <button
          onClick={onNewMatter}
          className="w-full py-4 bg-neural-primary/10 hover:bg-neural-primary text-neural-primary hover:text-neural-bg border border-neural-primary/20 rounded-2xl flex items-center justify-center gap-3 transition-all duration-500 group shadow-[0_0_20px_rgba(0,242,255,0.05)]"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
          <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Initialize Cluster</span>
        </button>
      </div>

      {/* Cluster List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
        <div className="px-4 mb-4 flex items-center justify-between">
          <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.4em] font-mono">Synaptic Sectors</span>
          <Layers className="w-3.5 h-3.5 text-white/10" />
        </div>
        
        <AnimatePresence mode="popLayout">
          {matters?.map((matter) => (
            <motion.div
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              key={matter.id}
              onClick={() => onSelectMatter(matter.id!)}
              className={`group flex flex-col p-5 rounded-2xl cursor-pointer transition-all duration-500 border ${
                activeMatterId === matter.id
                  ? 'bg-neural-primary/10 border-neural-primary/40 shadow-[0_0_30px_rgba(0,242,255,0.05)]'
                  : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div className="flex items-center gap-5">
                  <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
                    activeMatterId === matter.id 
                      ? 'bg-neural-primary shadow-[0_0_10px_rgba(0,242,255,0.8)]' 
                      : 'bg-white/10 group-hover:bg-white/30'
                  }`} />
                  <span className={`text-xs font-bold uppercase tracking-widest transition-colors duration-500 ${
                    activeMatterId === matter.id ? 'text-neural-text' : 'text-white/40 group-hover:text-white/60'
                  }`}>
                    {matter.title}
                  </span>
                </div>
                
                <button
                  onClick={(e) => handleDeleteMatter(e, matter.id!)}
                  className={`opacity-0 group-hover:opacity-100 p-2 transition-all rounded-xl ${
                    confirmDelete === matter.id 
                      ? 'bg-neural-secondary/20 text-neural-secondary opacity-100' 
                      : 'text-white/10 hover:text-neural-secondary hover:bg-neural-secondary/10'
                  }`}
                  title={confirmDelete === matter.id ? "Click again to confirm" : "Dissolve Cluster"}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Cluster Tags */}
              <div className="flex flex-wrap gap-2 mt-2">
                {matter.tags?.map(tag => (
                  <span key={tag} className="px-2 py-0.5 bg-white/5 rounded-lg text-[8px] font-bold uppercase tracking-widest border border-white/10 text-white/40 flex items-center gap-1 group/tag">
                    <Hash className="w-2 h-2 opacity-50" />
                    {tag}
                    {activeMatterId === matter.id && (
                      <button onClick={(e) => { e.stopPropagation(); removeTag(matter.id!, tag); }} className="hover:text-white opacity-0 group-hover/tag:opacity-100 transition-opacity">
                        <X className="w-2 h-2" />
                      </button>
                    )}
                  </span>
                ))}
                {activeMatterId === matter.id && (
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-white/5 rounded-lg border border-white/10">
                    <Tag className="w-2 h-2 text-white/20" />
                    <input 
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => handleAddTag(e, matter.id!)}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-transparent border-none focus:ring-0 p-0 text-[8px] w-16 text-white placeholder-white/10 uppercase font-bold"
                      placeholder="TAG..."
                    />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {matters?.length === 0 && (
          <div className="p-12 text-center border border-dashed border-white/5 rounded-3xl">
            <p className="text-[10px] text-white/10 uppercase tracking-[0.4em] font-mono italic">No Clusters Recorded</p>
          </div>
        )}
      </div>

      {/* Sidebar Footer */}
      <div className="p-8 border-t border-white/5 bg-white/5">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-neural-primary animate-pulse" />
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest font-bold">Cortex Stable</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={onPurge}
              className="p-2 hover:bg-neural-secondary/10 text-white/10 hover:text-neural-secondary transition-all rounded-xl border border-transparent hover:border-neural-secondary/20"
              title="Purge All Data"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <Settings className="w-4 h-4 text-white/20 hover:text-neural-primary cursor-pointer transition-colors" />
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '78%' }}
              className="h-full bg-gradient-to-r from-neural-primary to-neural-info" 
            />
          </div>
          <div className="flex justify-between text-[8px] font-mono text-white/10 uppercase tracking-widest font-bold">
            <span>Neural Load</span>
            <span>78%</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
