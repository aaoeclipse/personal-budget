export interface Category {
  id: string;
  name: string;
  color: string;
  emoji?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CategoryCreate {
  name: string;
  color: string;
  emoji?: string;
}

export interface CategoryUpdate {
  name?: string;
  color?: string;
  emoji?: string;
}
