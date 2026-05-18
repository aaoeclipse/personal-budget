import type { CsvImportResponse, Expense, ExpenseCreate, ExpenseListResponse, ExpenseUpdate } from '../types/expense';
import api from './client';

export interface ExpenseFilters {
  category_id?: string;
  budget_id?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
  min_amount?: number;
  max_amount?: number;
  limit?: number;
  offset?: number;
}

export const expensesApi = {
  list: (filters?: ExpenseFilters) =>
    api.get<ExpenseListResponse>('/expenses', { params: filters }).then((r) => r.data),

  create: (data: ExpenseCreate) => api.post<Expense>('/expenses', data).then((r) => r.data),

  get: (id: string) => api.get<Expense>(`/expenses/${id}`).then((r) => r.data),

  update: (id: string, data: ExpenseUpdate) => api.put<Expense>(`/expenses/${id}`, data).then((r) => r.data),

  delete: (id: string) => api.delete(`/expenses/${id}`),

  exportCsv: (filters?: Omit<ExpenseFilters, 'limit' | 'offset'>) =>
    api.get('/expenses/export/csv', { params: filters, responseType: 'blob' }).then((r) => {
      const blob = new Blob([r.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }),

  importCsv: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api
      .post<CsvImportResponse>('/expenses/import/csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  },
};
