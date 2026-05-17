import {
  ActionIcon,
  Badge,
  Button,
  Drawer,
  Group,
  Loader,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconTrash, IconUserPlus } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { budgetsApi } from '../../api/budgets';
import type { BudgetMember } from '../../types/budget';

interface Props {
  opened: boolean;
  onClose: () => void;
  budgetId: string;
  budgetName: string;
  isOwner: boolean;
}

export function BudgetMembersDrawer({ opened, onClose, budgetId, budgetName, isOwner }: Props) {
  const qc = useQueryClient();
  const [email, setEmail] = useState('');

  const { data: members = [], isLoading } = useQuery<BudgetMember[]>({
    queryKey: ['budget-members', budgetId],
    queryFn: () => budgetsApi.listMembers(budgetId),
    enabled: opened,
  });

  const inviteMutation = useMutation({
    mutationFn: (email: string) => budgetsApi.inviteMember(budgetId, email),
    onSuccess: () => {
      notifications.show({ message: 'Invitation sent!', color: 'green' });
      setEmail('');
      qc.invalidateQueries({ queryKey: ['budget-members', budgetId] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.detail || 'Could not send invitation';
      notifications.show({ title: 'Error', message: msg, color: 'red' });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (memberUserId: string) => budgetsApi.removeMember(budgetId, memberUserId),
    onSuccess: () => {
      notifications.show({ message: 'Member removed', color: 'green' });
      qc.invalidateQueries({ queryKey: ['budget-members', budgetId] });
      qc.invalidateQueries({ queryKey: ['budgets'] });
    },
    onError: () => {
      notifications.show({ title: 'Error', message: 'Could not remove member', color: 'red' });
    },
  });

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      inviteMutation.mutate(email.trim());
    }
  };

  return (
    <Drawer opened={opened} onClose={onClose} title={`Members - ${budgetName}`} position="right" size="sm">
      <Stack gap="md">
        {isOwner && (
          <form onSubmit={handleInvite}>
            <Group gap="xs">
              <TextInput
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ flex: 1 }}
                type="email"
              />
              <Button
                type="submit"
                color="coral"
                loading={inviteMutation.isPending}
                leftSection={<IconUserPlus size={16} />}
              >
                Invite
              </Button>
            </Group>
          </form>
        )}

        {isLoading ? (
          <Loader size="sm" />
        ) : (
          <Stack gap="xs">
            {members.map((member) => (
              <Group key={member.id} justify="space-between" p="xs" style={{ borderRadius: 8, border: '1px solid var(--mantine-color-default-border)' }}>
                <div>
                  <Text size="sm" fw={500}>{member.user_name}</Text>
                  <Text size="xs" c="dimmed">{member.user_email}</Text>
                </div>
                <Group gap="xs">
                  <Badge
                    color={member.role === 'owner' ? 'teal' : 'blue'}
                    variant="light"
                    size="sm"
                  >
                    {member.role}
                  </Badge>
                  {isOwner && member.role !== 'owner' && (
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      size="sm"
                      loading={removeMutation.isPending}
                      onClick={() => removeMutation.mutate(member.user_id)}
                    >
                      <IconTrash size={14} />
                    </ActionIcon>
                  )}
                </Group>
              </Group>
            ))}
          </Stack>
        )}
      </Stack>
    </Drawer>
  );
}
