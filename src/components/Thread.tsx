import React, { useState, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { Node } from './Node';
import { SynapseOverlay } from './SynapseOverlay';
import { Plus, History, Clock, Activity, Zap, Shield, Sparkles, Eye, GitBranch, XCircle, Orbit, Rocket, Undo2, Redo2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Node as NodeType, Synapse } from '../types';
import { useHistory } from '../hooks/useHistory';

interface ThreadProps {
  matterId: number;
  searchQuery?: string;
  onOpenMatter: (id: number) => void;
}

export const Thread: React.FC<ThreadProps> = ({ matterId, searchQuery = '', onOpenMatter }) => {
  const [focus, setFocus] = useState<{ type: 'level' | 'branch', id: number, level: number } | null>(null);
  const [linkingSourceId, setLinkingSourceId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { pushAction, undo, redo, canUndo, canRedo } = useHistory();
  
  const nodes = useLiveQuery(() => 
    db.nodes.where('matterId').equals(matterId).sortBy('position')
  );

  const synapses = useLiveQuery(() => 
    db.synapses.where('matterId').equals(matterId).toArray()
  );

  const handleStartLink = (id: number) => {
    setLinkingSourceId(id);
  };

  const handleCompleteLink = async (targetId: number) => {
    if (linkingSourceId && linkingSourceId !== targetId) {
      const label = window.prompt('Enter synapse label (optional):');
      const synapse = {
        sourceId: linkingSourceId,
        targetId,
        label: label || undefined,
        matterId
      };
      const id = await db.synapses.add(synapse as any);
      pushAction({ type: 'ADD_SYNAPSE', synapse: { ...synapse, id } });
    }
    setLinkingSourceId(null);
  };

  const handleAddChild = async (parentId: number | null) => {
    const newNode = {
      matterId,
      parentId,
      content: '',
      tags: [],
      links: [],
      color: 'cyan',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      position: Date.now(),
    };
    const id = await db.nodes.add(newNode as any);
    pushAction({ type: 'ADD_NODE', node: { ...newNode, id: id as number } });
  };

  const handleDelete = async (id: number) => {
    const deletedNodes: NodeType[] = [];
    const deletedSynapses: any[] = [];
    
    // Recursive delete helper
    const deleteRecursive = async (nodeId: number) => {
      const node = await db.nodes.get(nodeId);
      if (node && node.id) deletedNodes.push(node as NodeType);
      const children = await db.nodes.where('parentId').equals(nodeId).toArray();
      for (const child of children) {
        await deleteRecursive(child.id!);
      }

      const synapses = await db.synapses.where('sourceId').equals(nodeId).or('targetId').equals(nodeId).toArray();
      for (const synapse of synapses) {
        if (!deletedSynapses.find(s => s.id === synapse.id)) {
          deletedSynapses.push(synapse);
          await db.synapses.delete(synapse.id!);
        }
      }

      await db.nodes.delete(nodeId);
    };

    await deleteRecursive(id);
    pushAction({ type: 'DELETE_NODE', nodes: deletedNodes, synapses: deletedSynapses });
  };

  const handleUpdate = async (id: number, updates: Partial<NodeType>) => {
    const prevNode = await db.nodes.get(id);
    if (prevNode) {
      const prev = Object.keys(updates).reduce((acc: any, key) => {
        acc[key] = prevNode[key as keyof NodeType];
        return acc;
      }, {} as Partial<NodeType>);
      pushAction({ type: 'UPDATE_NODE', id, prev, next: updates });
    }
    await db.nodes.update(id, { ...updates, updatedAt: Date.now() });
  };

  const handleSortChildren = async (parentId: number) => {
    const children = await db.nodes.where('parentId').equals(parentId).sortBy('createdAt');
    for (let i = 0; i < children.length; i++) {
      await db.nodes.update(children[i].id!, { position: i });
    }
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
      .sort((a, b) => (a.position || 0) - (b.position || 0))
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
              onSortChildren={handleSortChildren}
              onFocusLevel={() => setFocus(prev => prev?.type === 'level' && prev.id === node.id ? null : { type: 'level', id: node.id!, level })}
              onFocusBranch={() => setFocus(prev => prev?.type === 'branch' && prev.id === node.id ? null : { type: 'branch', id: node.id!, level })}
              isLevelFocused={focus?.type === 'level' && focus?.id === node.id}
              isBranchFocused={focus?.type === 'branch' && focus?.id === node.id}
              onOpenMatter={onOpenMatter}
              isLinkingMode={linkingSourceId !== null}
              isLinkingSource={linkingSourceId === node.id}
              onStartLink={handleStartLink}
              onCompleteLink={handleCompleteLink}
            />
            {renderNodes(node.id!, level + 1)}
          </div>
        );
      });
  };

  return (
    <div className="min-w-[800px] max-w-5xl mx-auto p-12 pb-40 relative" ref={containerRef}>
      <SynapseOverlay synapses={synapses || []} containerRef={containerRef} />
      
      {linkingSourceId && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-neural-primary text-neural-bg px-6 py-3 rounded-full font-medium text-sm shadow-lg z-50 flex items-center gap-4 animate-in slide-in-from-bottom-4">
          <span>Select target node to create synapse</span>
          <button 
            onClick={() => setLinkingSourceId(null)}
            className="bg-neural-bg/20 hover:bg-neural-bg/30 px-3 py-1 rounded-full text-xs transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="mb-12 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
            <Orbit className="w-5 h-5 text-white/60" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-medium tracking-tight text-neural-text">
              Project Timeline
            </h2>
          </div>
        </div>
        
        <div className="hidden lg:flex items-center gap-6">
          <div className="flex items-center gap-2 mr-4 border-r border-white/10 pr-6">
            <button
              onClick={undo}
              disabled={!canUndo}
              className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${canUndo ? 'text-white/60 hover:text-white hover:bg-white/10' : 'text-white/20 cursor-not-allowed'}`}
              title="Undo (⌘Z)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${canRedo ? 'text-white/60 hover:text-white hover:bg-white/10' : 'text-white/20 cursor-not-allowed'}`}
              title="Redo (⌘⇧Z)"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>
          {focus && (
            <button 
              onClick={() => setFocus(null)}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-white/60 hover:text-white transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" />
              Reset Focus
            </button>
          )}
          <button
            onClick={() => handleAddChild(null)}
            className="flex items-center gap-2 px-4 py-2 bg-neural-primary text-neural-bg hover:bg-neural-primary/90 rounded-lg text-sm font-medium transition-colors shadow-[0_0_15px_rgba(0,242,255,0.3)]"
          >
            <Plus className="w-4 h-4" />
            Add Root Log
          </button>
        </div>
      </div>

      {nodes && nodes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center relative z-10">
          <div className="w-24 h-24 mb-8 rounded-full bg-neural-primary/5 border border-neural-primary/20 flex items-center justify-center relative">
            <div className="absolute inset-0 rounded-full border border-neural-primary/30 animate-ping opacity-20" />
            <Sparkles className="w-10 h-10 text-neural-primary/60" />
          </div>
          <h3 className="text-xl font-display font-medium text-white mb-3">Timeline is empty</h3>
          <p className="text-white/40 max-w-sm mb-8">Begin your project by adding the first temporal log. This will serve as the root of your timeline.</p>
          <button
            onClick={() => handleAddChild(null)}
            className="flex items-center gap-2 px-6 py-3 bg-neural-primary text-neural-bg hover:bg-neural-primary/90 rounded-xl font-medium transition-all hover:scale-105 shadow-[0_0_20px_rgba(0,242,255,0.4)]"
          >
            <Plus className="w-5 h-5" />
            Initialize Timeline
          </button>
        </div>
      ) : (
        <>
          <AnimatePresence mode="popLayout">
            {renderNodes(null)}
          </AnimatePresence>
          
          <motion.button
            whileHover={{ scale: 1.01, backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
            whileTap={{ scale: 0.99 }}
            onClick={() => handleAddChild(null)}
            className="mt-12 w-full py-8 border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center gap-3 text-white/40 hover:border-white/20 hover:text-white transition-colors group relative z-10"
          >
            <div className="p-2 bg-white/5 rounded-lg border border-white/10 group-hover:bg-white/10 transition-colors">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium">Add Log</span>
          </motion.button>
        </>
      )}
    </div>
  );
};
