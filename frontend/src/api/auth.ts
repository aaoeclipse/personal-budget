import type { Token, User } from '../types/auth';
import api from './client';

export const authApi = {
  signup: (data: { email: string; password: string; name: string }) =>
    api.post<Token>('/auth/signup', data).then((r) => r.data),

  login: (email: string, password: string) => {
    const form = new URLSearchParams();
    form.append('username', email);
    form.append('password', password);
    return api
      .post<Token>('/auth/login', form, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      .then((r) => r.data);
  },

  me: () => api.get<User>('/auth/me').then((r) => r.data),
};
