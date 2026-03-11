import { useState, useCallback, useEffect } from 'react';
import { db } from '../db/db';
import type { Node as NodeType } from '../types';

type ActionType = 
  | { type: 'ADD_NODE'; node: NodeType }
  | { type: 'DELETE_NODE'; nodes: NodeType[]; synapses: any[] }
  | { type: 'UPDATE_NODE'; id: number; prev: Partial<NodeType>; next: Partial<NodeType> }
  | { type: 'ADD_SYNAPSE'; synapse: any };

export const useHistory = () => {
  const [undoStack, setUndoStack] = useState<ActionType[]>([]);
  const [redoStack, setRedoStack] = useState<ActionType[]>([]);

  const pushAction = useCallback((action: ActionType) => {
    setUndoStack(prev => [...prev, action]);
    setRedoStack([]);
  }, []);

  const undo = useCallback(async () => {
    if (undoStack.length === 0) return;
    const action = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    setRedoStack(prev => [...prev, action]);

    switch (action.type) {
      case 'ADD_NODE':
        await db.nodes.delete(action.node.id!);
        break;
      case 'DELETE_NODE':
        await db.nodes.bulkPut(action.nodes);
        if (action.synapses && action.synapses.length > 0) {
          await db.synapses.bulkPut(action.synapses);
        }
        break;
      case 'UPDATE_NODE':
        await db.nodes.update(action.id, action.prev);
        break;
      case 'ADD_SYNAPSE':
        await db.synapses.delete(action.synapse.id!);
        break;
    }
  }, [undoStack]);

  const redo = useCallback(async () => {
    if (redoStack.length === 0) return;
    const action = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));
    setUndoStack(prev => [...prev, action]);

    switch (action.type) {
      case 'ADD_NODE':
        await db.nodes.put(action.node as any);
        break;
      case 'DELETE_NODE':
        const ids = action.nodes.map(n => n.id!);
        await db.nodes.bulkDelete(ids);
        if (action.synapses && action.synapses.length > 0) {
          const synapseIds = action.synapses.map(s => s.id!);
          await db.synapses.bulkDelete(synapseIds);
        }
        break;
      case 'UPDATE_NODE':
        await db.nodes.update(action.id, action.next);
        break;
      case 'ADD_SYNAPSE':
        await db.synapses.put(action.synapse);
        break;
    }
  }, [redoStack]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
        } else {
          e.preventDefault();
          undo();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return { pushAction, undo, redo, canUndo: undoStack.length > 0, canRedo: redoStack.length > 0 };
};
