import type { BudgetInvitation } from '../types/budget';
import api from './client';

export const invitationsApi = {
  list: () => api.get<BudgetInvitation[]>('/invitations').then((r) => r.data),

  respond: (id: string, action: 'accept' | 'decline') =>
    api.post(`/invitations/${id}/respond`, { action }),
};
