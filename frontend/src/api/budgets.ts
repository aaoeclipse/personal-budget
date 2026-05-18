import type { Budget, BudgetCreate, BudgetDetail, BudgetMember, BudgetStats, BudgetUpdate } from '../types/budget';
import api from './client';

export const budgetsApi = {
  list: (active?: boolean) =>
    api.get<Budget[]>('/budgets', { params: active !== undefined ? { active } : {} }).then((r) => r.data),

  create: (data: BudgetCreate) => api.post<Budget>('/budgets', data).then((r) => r.data),

  get: (id: string) => api.get<BudgetDetail>(`/budgets/${id}`).then((r) => r.data),

  getStats: (id: string) => api.get<BudgetStats>(`/budgets/${id}/stats`).then((r) => r.data),

  update: (id: string, data: BudgetUpdate) => api.put<Budget>(`/budgets/${id}`, data).then((r) => r.data),

  delete: (id: string) => api.delete(`/budgets/${id}`),

  // Member management
  inviteMember: (budgetId: string, email: string, role: string = 'editor') =>
    api.post(`/budgets/${budgetId}/members/invite`, { email, role }).then((r) => r.data),

  listMembers: (budgetId: string) =>
    api.get<BudgetMember[]>(`/budgets/${budgetId}/members`).then((r) => r.data),

  removeMember: (budgetId: string, memberUserId: string) =>
    api.delete(`/budgets/${budgetId}/members/${memberUserId}`),
};
