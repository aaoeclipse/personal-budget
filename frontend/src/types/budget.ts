export interface Budget {
  id: string;
  name: string;
  amount: number;
  start_date: string;
  end_date: string;
  is_shared: boolean;
  role: string | null;
  member_count: number;
  created_at: string;
  updated_at: string;
}

export interface BudgetDetail extends Budget {
  total_spent: number;
  total_spent_gtq: number;
  remaining: number;
  amount_gtq: number;
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

export interface BudgetMember {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  role: string;
  created_at: string;
}

export interface BudgetCategorySpending {
  category_name: string;
  category_color: string;
  category_emoji: string | null;
  total: number;
  percentage: number;
}

export interface BudgetDailySpending {
  date: string;
  total: number;
}

export interface BudgetStats {
  days_total: number;
  days_elapsed: number;
  days_remaining: number;
  daily_allowance: number;
  avg_daily_spending: number;
  projected_total: number;
  on_track: boolean;
  spending_by_category: BudgetCategorySpending[];
  daily_spending: BudgetDailySpending[];
}

export interface BudgetInvitation {
  id: string;
  budget_id: string;
  budget_name: string;
  inviter_name: string;
  role: string;
  status: string;
  created_at: string;
}
