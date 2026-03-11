import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { PlusSquare, Trash2, User, History, Compass, Anchor, Settings, Radar, Milestone, Sparkles, Tag, Hash, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  activeMatterId: number | null;
  onSelectMatter: (id: number | null) => void;
  onNewMatter: () => void;
  onPurge: () => void;
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeMatterId, onSelectMatter, onNewMatter, onPurge, onOpenSettings }) => {
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

  const renderMatter = (matter: any, level: number = 0) => {
    const children = matters?.filter(m => m.parentMatterId === matter.id) || [];
    
    return (
      <div key={matter.id}>
        <motion.div
          layout
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          onClick={() => onSelectMatter(matter.id!)}
          className={`group flex flex-col p-2 rounded-lg cursor-pointer transition-colors ${
            activeMatterId === matter.id
              ? 'bg-white/10'
              : 'hover:bg-white/5'
          }`}
          style={{ marginLeft: `${level * 12}px` }}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              {level > 0 && <div className="w-3 h-px bg-white/20" />}
              <span className={`text-sm font-medium truncate max-w-[140px] ${
                activeMatterId === matter.id ? 'text-neural-text' : 'text-white/60 group-hover:text-white/80'
              }`}>
                {matter.title}
              </span>
            </div>
            
            <button
              onClick={(e) => handleDeleteMatter(e, matter.id!)}
              className={`opacity-0 group-hover:opacity-100 p-1 rounded-md transition-colors ${
                confirmDelete === matter.id 
                  ? 'bg-red-500/20 text-red-400 opacity-100' 
                  : 'text-white/40 hover:text-red-400 hover:bg-red-500/10'
              }`}
              title={confirmDelete === matter.id ? "Click again to confirm" : "Delete Project"}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Cluster Tags */}
          {matter.tags && matter.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2" style={{ marginLeft: level > 0 ? '20px' : '0' }}>
              {matter.tags.map((tag: string) => (
                <span key={tag} className="px-1.5 py-0.5 bg-white/5 rounded text-[9px] font-medium text-white/40 flex items-center gap-1 group/tag">
                  {tag}
                  {activeMatterId === matter.id && (
                    <button onClick={(e) => { e.stopPropagation(); removeTag(matter.id!, tag); }} className="hover:text-white opacity-0 group-hover/tag:opacity-100 transition-opacity">
                      <X className="w-2 h-2" />
                    </button>
                  )}
                </span>
              ))}
            </div>
          )}
          {activeMatterId === matter.id && (
            <div className="mt-2" style={{ marginLeft: level > 0 ? '20px' : '0' }}>
              <input 
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => handleAddTag(e, matter.id!)}
                onClick={(e) => e.stopPropagation()}
                className="bg-transparent border-none focus:ring-0 p-0 text-[10px] w-full text-white/60 placeholder-white/20"
                placeholder="+ Add tag..."
              />
            </div>
          )}
        </motion.div>
        {children.map(child => renderMatter(child, level + 1))}
      </div>
    );
  };

  return (
    <aside className="w-[280px] h-screen bg-neural-bg border-r border-white/5 flex flex-col relative z-20">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-2 mb-4">
          <Radar className="w-4 h-4 text-neural-primary" />
          <h1 className="text-base font-display text-neural-text font-medium tracking-tight">
            Matter
          </h1>
        </div>

        <button
          onClick={onNewMatter}
          className="w-full py-2 text-white/60 hover:text-neural-text hover:bg-white/5 rounded-lg flex items-center justify-center gap-2 transition-colors border border-white/5 hover:border-white/10"
        >
          <PlusSquare className="w-4 h-4" />
          <span className="text-xs font-medium">New Project</span>
        </button>
      </div>

      {/* Cluster List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
        <div className="px-3 mb-3 flex items-center justify-between">
          <span className="text-[10px] font-medium text-white/40 uppercase tracking-wider">Projects</span>
        </div>
        
        <AnimatePresence mode="popLayout">
          {matters?.filter(m => !m.parentMatterId).map((matter) => renderMatter(matter))}
        </AnimatePresence>
        
        {matters?.length === 0 && (
          <div className="p-6 text-center">
            <p className="text-xs text-white/40">No projects yet</p>
          </div>
        )}
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-white/5 flex items-center justify-between">
        <button 
          onClick={onPurge}
          className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors rounded-lg"
          title="Purge All Data"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        <button onClick={onOpenSettings} className="p-2 text-white/40 hover:text-white hover:bg-white/5 transition-colors rounded-lg">
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
