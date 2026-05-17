export interface Budget {
  id: string;
  name: string;
  amount: number;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export interface BudgetDetail extends Budget {
  total_spent: number;
  remaining: number;
}

export interface BudgetCreate {
  name: string;
  amount: number;
  start_date: string;
  end_date: string;
}

export interface BudgetUpdate {
  name?: string;
  amount?: number;
  start_date?: string;
  end_date?: string;
}
