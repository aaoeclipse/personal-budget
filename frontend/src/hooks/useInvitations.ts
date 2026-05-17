import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { invitationsApi } from '../api/invitations';

export function useInvitations() {
  return useQuery({
    queryKey: ['invitations'],
    queryFn: invitationsApi.list,
  });
}

export function useRespondToInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'accept' | 'decline' }) =>
      invitationsApi.respond(id, action),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invitations'] });
      qc.invalidateQueries({ queryKey: ['budgets'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
