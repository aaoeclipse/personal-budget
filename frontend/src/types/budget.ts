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

export interface BudgetMember {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  role: string;
  created_at: string;
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
