import { Button, Card, Group, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useInvitations, useRespondToInvitation } from '../../hooks/useInvitations';

export function InvitationsBanner() {
  const { data: invitations = [] } = useInvitations();
  const respondMutation = useRespondToInvitation();

  if (invitations.length === 0) return null;

  const handleRespond = (id: string, action: 'accept' | 'decline') => {
    respondMutation.mutate(
      { id, action },
      {
        onSuccess: () => {
          notifications.show({
            message: action === 'accept' ? 'Invitation accepted!' : 'Invitation declined',
            color: action === 'accept' ? 'green' : 'gray',
          });
        },
        onError: () => {
          notifications.show({ title: 'Error', message: 'Could not respond to invitation', color: 'red' });
        },
      },
    );
  };

  return (
    <Stack gap="xs">
      {invitations.map((inv) => (
        <Card key={inv.id} shadow="xs" padding="sm" radius="md" withBorder style={{ borderLeft: '4px solid var(--mantine-color-coral-6)' }}>
          <Group justify="space-between" wrap="nowrap">
            <div>
              <Text size="sm" fw={500}>
                {inv.inviter_name} invited you to "{inv.budget_name}"
              </Text>
              <Text size="xs" c="dimmed">
                Role: {inv.role}
              </Text>
            </div>
            <Group gap="xs">
              <Button
                size="xs"
                color="teal"
                variant="light"
                leftSection={<IconCheck size={14} />}
                loading={respondMutation.isPending}
                onClick={() => handleRespond(inv.id, 'accept')}
              >
                Accept
              </Button>
              <Button
                size="xs"
                color="gray"
                variant="light"
                leftSection={<IconX size={14} />}
                loading={respondMutation.isPending}
                onClick={() => handleRespond(inv.id, 'decline')}
              >
                Decline
              </Button>
            </Group>
          </Group>
        </Card>
      ))}
    </Stack>
  );
}
