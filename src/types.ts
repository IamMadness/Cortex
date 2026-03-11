export interface Epoch {
  id: number;
  title: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  parentMatterId?: number;
}

export interface Node {
  id: number;
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
