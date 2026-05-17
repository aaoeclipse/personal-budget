import type { BudgetDetail } from './budget';
import type { Expense } from './expense';

export interface SpendingByCategory {
  category_name: string;
  category_color: string;
  total: number;
}

export interface DailySpending {
  date: string;
  total: number;
}

export interface MonthlySpending {
  month: string;
  total: number;
  change_pct: number | null;
}

export interface MonthlySpendingData {
  months: MonthlySpending[];
}

export interface DashboardData {
  active_budgets: BudgetDetail[];
  total_spent: number;
  spending_by_category: SpendingByCategory[];
  recent_expenses: Expense[];
  daily_spending: DailySpending[];
}
