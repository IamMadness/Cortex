import Dexie, { type Table } from 'dexie';

export interface Epoch {
  id?: number;
  title: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface Node {
  id?: number;
  matterId: number;
  parentId: number | null;
  content: string;
  tags: string[];
  color?: string;
  createdAt: number;
  updatedAt: number;
  position: number;
}

export class MattersDatabase extends Dexie {
  matters!: Table<Epoch>;
  nodes!: Table<Node>;

  constructor() {
    super('MattersDatabase');
    this.version(3).stores({
      matters: '++id, title, *tags, createdAt, updatedAt',
      nodes: '++id, matterId, parentId, *tags, createdAt, updatedAt, position'
    });
  }
}

export const db = new MattersDatabase();
