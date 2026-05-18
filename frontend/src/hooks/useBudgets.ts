import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { budgetsApi } from '../api/budgets';
import type { BudgetCreate, BudgetUpdate } from '../types/budget';

export function useBudgets(active?: boolean) {
  return useQuery({ queryKey: ['budgets', { active }], queryFn: () => budgetsApi.list(active) });
}

export function useBudget(id: string) {
  return useQuery({ queryKey: ['budgets', id], queryFn: () => budgetsApi.get(id), enabled: !!id });
}

export function useBudgetStats(id: string) {
  return useQuery({ queryKey: ['budgets', id, 'stats'], queryFn: () => budgetsApi.getStats(id), enabled: !!id });
}

export function useCreateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BudgetCreate) => budgetsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budgets'] }),
  });
}

export function useUpdateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BudgetUpdate }) => budgetsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budgets'] }),
  });
}

export function useDeleteBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => budgetsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budgets'] }),
  });
}
