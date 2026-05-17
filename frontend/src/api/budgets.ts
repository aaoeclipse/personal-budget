import type { Budget, BudgetCreate, BudgetDetail, BudgetUpdate } from '../types/budget';
import api from './client';

export const budgetsApi = {
  list: (active?: boolean) =>
    api.get<Budget[]>('/budgets', { params: active !== undefined ? { active } : {} }).then((r) => r.data),

  create: (data: BudgetCreate) => api.post<Budget>('/budgets', data).then((r) => r.data),

  get: (id: string) => api.get<BudgetDetail>(`/budgets/${id}`).then((r) => r.data),

  update: (id: string, data: BudgetUpdate) => api.put<Budget>(`/budgets/${id}`, data).then((r) => r.data),

  delete: (id: string) => api.delete(`/budgets/${id}`),
};
