import type { DashboardData, MonthlySpendingData } from '../types/api';
import api from './client';

export const dashboardApi = {
  get: () => api.get<DashboardData>('/dashboard').then((r) => r.data),
  getMonthlySpending: (months = 6) =>
    api.get<MonthlySpendingData>('/dashboard/monthly-spending', { params: { months } }).then((r) => r.data),
};
