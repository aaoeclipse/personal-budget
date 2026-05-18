import type { Category } from './category';

export type Currency = 'USD' | 'GTQ';

export interface Expense {
  id: string;
  budget_id: string | null;
  category_id: string;
  amount: number;
  currency: Currency;
  description: string;
  date: string;
  created_at: string;
  updated_at: string;
  category?: Category;
  creator_name?: string;
}

export interface ExpenseCreate {
  budget_id?: string | null;
  category_id: string;
  amount: number;
  currency: Currency;
  description?: string;
  date: string;
}

export interface ExpenseUpdate {
  budget_id?: string | null;
  category_id?: string;
  amount?: number;
  currency?: Currency;
  description?: string;
  date?: string;
}

export interface ExpenseListResponse {
  items: Expense[];
  total: number;
}

export interface CsvImportError {
  row: number;
  message: string;
}

export interface CsvImportResponse {
  imported: number;
  skipped: number;
  errors: CsvImportError[];
}
