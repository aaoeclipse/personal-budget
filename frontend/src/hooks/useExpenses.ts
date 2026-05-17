import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { expensesApi, type ExpenseFilters } from '../api/expenses';
import type { ExpenseCreate, ExpenseUpdate } from '../types/expense';

export function useExpenses(filters?: ExpenseFilters) {
  return useQuery({
    queryKey: ['expenses', filters],
    queryFn: () => expensesApi.list(filters),
  });
}

export function useCreateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ExpenseCreate) => expensesApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      qc.invalidateQueries({ queryKey: ['budgets'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ExpenseUpdate }) => expensesApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      qc.invalidateQueries({ queryKey: ['budgets'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expensesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      qc.invalidateQueries({ queryKey: ['budgets'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
