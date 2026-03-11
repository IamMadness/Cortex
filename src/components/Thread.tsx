import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { Node } from './Node';
import { Plus, History, Clock, Activity, Zap, Shield, Sparkles, Eye, GitBranch, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Node as NodeType } from '../types';

interface ThreadProps {
  matterId: number;
  searchQuery?: string;
}

export const Thread: React.FC<ThreadProps> = ({ matterId, searchQuery = '' }) => {
  const [focus, setFocus] = useState<{ type: 'level' | 'branch', id: number, level: number } | null>(null);
  
  const nodes = useLiveQuery(() => 
    db.nodes.where('matterId').equals(matterId).sortBy('position')
  );

  const handleAddChild = async (parentId: number | null) => {
    const newNode = {
      matterId,
      parentId,
      content: '',
      tags: [],
      color: 'cyan',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      position: Date.now(),
    };
    await db.nodes.add(newNode as any);
  };

  const handleDelete = async (id: number) => {
    // Recursive delete helper
    const deleteRecursive = async (nodeId: number) => {
      const children = await db.nodes.where('parentId').equals(nodeId).toArray();
      for (const child of children) {
        await deleteRecursive(child.id!);
      }
      await db.nodes.delete(nodeId);
    };

    await deleteRecursive(id);
  };

  const handleUpdate = async (id: number, updates: Partial<NodeType>) => {
    await db.nodes.update(id, { ...updates, updatedAt: Date.now() });
  };

  const isDescendant = (nodeId: number, targetId: number): boolean => {
    if (!nodes) return false;
    const node = (nodes as NodeType[]).find(n => n.id === nodeId);
    if (!node || node.parentId === null) return false;
    if (node.parentId === targetId) return true;
    return isDescendant(node.parentId, targetId);
  };

  const renderNodes = (parentId: number | null, level: number = 0) => {
    if (!nodes) return null;
    
    const matchesSearch = (node: NodeType): boolean => {
      if (node.content.toLowerCase().includes(searchQuery.toLowerCase())) return true;
      if ((node.tags || []).some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))) return true;
      const children = (nodes as NodeType[]).filter(n => n.parentId === node.id);
      return children.some(child => matchesSearch(child));
    };

    return (nodes as NodeType[])
      .filter(node => node.parentId === parentId)
      .map(node => {
        const isFocused = !focus || 
          (focus.type === 'level' && level === focus.level) ||
          (focus.type === 'branch' && (node.id === focus.id || isDescendant(node.id!, focus.id)));

        const matches = searchQuery === '' || matchesSearch(node);
        if (!matches && searchQuery !== '') return null;

        return (
          <div 
            key={node.id} 
            className={`relative transition-all duration-700 ${!isFocused ? 'opacity-10 grayscale blur-[2px] pointer-events-none scale-95' : 'opacity-100'}`}
          >
            <Node
              node={node as any}
              level={level}
              onAddChild={handleAddChild}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
              onFocusLevel={() => setFocus(prev => prev?.type === 'level' && prev.id === node.id ? null : { type: 'level', id: node.id!, level })}
              onFocusBranch={() => setFocus(prev => prev?.type === 'branch' && prev.id === node.id ? null : { type: 'branch', id: node.id!, level })}
              isLevelFocused={focus?.type === 'level' && focus?.id === node.id}
              isBranchFocused={focus?.type === 'branch' && focus?.id === node.id}
            />
            {renderNodes(node.id!, level + 1)}
          </div>
        );
      });
  };

  return (
    <div className="max-w-5xl mx-auto p-12 pb-40 relative">
      <div className="mb-20 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="p-5 bg-neural-primary/10 border border-neural-primary/20 rounded-[2rem] relative group shadow-[0_0_30px_rgba(0,242,255,0.1)] animate-float">
            <Sparkles className="w-8 h-8 text-neural-primary" />
            <div className="absolute inset-0 border border-neural-primary/40 animate-ping opacity-20 rounded-[2rem]" />
          </div>
          <div>
            <h2 className="text-4xl font-display font-bold tracking-tight text-neural-text">
              Neural <span className="neural-gradient-text">Continuum</span>
            </h2>
            <div className="flex items-center gap-4 mt-2 font-mono">
              <span className="text-[10px] text-neural-primary/40 uppercase tracking-[0.4em] font-bold">Cortex_Sync: Active</span>
              <div className="w-1.5 h-1.5 rounded-full bg-neural-primary/40" />
              <span className="text-[10px] text-neural-primary/40 uppercase tracking-[0.4em] font-bold">Integrity: 100%</span>
            </div>
          </div>
        </div>
        
        <div className="hidden lg:flex items-center gap-10">
          {focus && (
            <button 
              onClick={() => setFocus(null)}
              className="flex items-center gap-3 px-4 py-2 bg-neural-secondary/10 border border-neural-secondary/20 rounded-xl text-[10px] text-neural-secondary font-bold uppercase tracking-widest hover:bg-neural-secondary/20 transition-all"
            >
              <XCircle className="w-4 h-4" />
              Reset Focus
            </button>
          )}
          <div className="text-right font-mono">
            <p className="text-[10px] text-white/20 uppercase tracking-[0.3em] font-bold">Neural Lock</p>
            <p className="text-sm font-bold text-neural-primary uppercase tracking-widest">Synchronized</p>
          </div>
          <div className="w-16 h-16 rounded-[2rem] border border-white/5 flex items-center justify-center relative bg-white/5">
            <Clock className="w-7 h-7 text-white/20" />
            <div className="absolute inset-0 border-t-2 border-neural-primary animate-spin rounded-[2rem]" />
          </div>
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        {renderNodes(null)}
      </AnimatePresence>
      
      <motion.button
        whileHover={{ scale: 1.02, backgroundColor: 'rgba(0, 242, 255, 0.05)' }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleAddChild(null)}
        className="mt-20 w-full py-16 border border-dashed border-white/10 rounded-[3rem] flex flex-col items-center justify-center gap-6 text-white/20 hover:border-neural-primary/40 hover:text-neural-primary transition-all group relative overflow-hidden bg-white/5"
      >
        <div className="p-5 bg-white/5 rounded-[2rem] border border-white/10 group-hover:scale-110 group-hover:border-neural-primary/40 transition-all duration-700">
          <Plus className="w-10 h-10 group-hover:rotate-90 transition-transform duration-700" />
        </div>
        <span className="text-[11px] font-mono uppercase tracking-[0.5em] font-bold">Initialize Neuron Soma</span>
      </motion.button>
    </div>
  );
};
