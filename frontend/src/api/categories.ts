import type { Category, CategoryCreate, CategoryUpdate } from '../types/category';
import api from './client';

export const categoriesApi = {
  list: () => api.get<Category[]>('/categories').then((r) => r.data),

  create: (data: CategoryCreate) => api.post<Category>('/categories', data).then((r) => r.data),

  update: (id: string, data: CategoryUpdate) => api.put<Category>(`/categories/${id}`, data).then((r) => r.data),

  delete: (id: string) => api.delete(`/categories/${id}`),
};
