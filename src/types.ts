export interface Epoch {
  id: number;
  title: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface Node {
  id: number;
  matterId: number;
  parentId: number | null;
  content: string;
  tags: string[];
  color?: string;
  createdAt: number;
  updatedAt: number;
  position: number;
}
