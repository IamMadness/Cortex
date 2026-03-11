import Dexie, { type Table } from 'dexie';

export interface Epoch {
  id?: number;
  title: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  parentMatterId?: number;
}

export interface Node {
  id?: number;
  matterId: number;
  parentId: number | null;
  content: string;
  tags: string[];
  links?: string[];
  color?: string;
  createdAt: number;
  updatedAt: number;
  position: number;
  linkedMatterId?: number;
}

export interface Synapse {
  id?: number;
  sourceId: number;
  targetId: number;
  label?: string;
  matterId: number;
}

export class MattersDatabase extends Dexie {
  matters!: Table<Epoch>;
  nodes!: Table<Node>;
  synapses!: Table<Synapse>;

  constructor() {
    super('MattersDatabase');
    this.version(6).stores({
      matters: '++id, title, *tags, createdAt, updatedAt, parentMatterId',
      nodes: '++id, matterId, parentId, *tags, *links, createdAt, updatedAt, position, linkedMatterId',
      synapses: '++id, sourceId, targetId, matterId'
    });
  }
}

export const db = new MattersDatabase();
