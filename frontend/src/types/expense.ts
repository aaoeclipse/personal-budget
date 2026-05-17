import type { Category } from './category';

export interface Expense {
  id: string;
  budget_id: string | null;
  category_id: string;
  amount: number;
  description: string;
  date: string;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface ExpenseCreate {
  budget_id?: string | null;
  category_id: string;
  amount: number;
  description?: string;
  date: string;
}

export interface ExpenseUpdate {
  budget_id?: string | null;
  category_id?: string;
  amount?: number;
  description?: string;
  date?: string;
}

export interface ExpenseListResponse {
  items: Expense[];
  total: number;
}
