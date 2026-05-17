import { ActionIcon, Card, Group, Progress, Stack, Text } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import type { Budget } from '../../types/budget';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

interface BudgetCardProps {
  budget: Budget & { total_spent?: number; remaining?: number };
  onEdit: () => void;
  onDelete: () => void;
}

export function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps) {
  const spent = budget.total_spent ?? 0;
  const pct = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
  const color = pct >= 90 ? 'red' : pct >= 70 ? 'yellow' : 'teal';

  return (
    <Card shadow="xs" padding="md" radius="md" withBorder>
      <Stack gap="xs">
        <Group justify="space-between">
          <Text fw={600}>{budget.name}</Text>
          <Group gap={4}>
            <ActionIcon variant="subtle" color="gray" onClick={onEdit}>
              <IconEdit size={16} />
            </ActionIcon>
            <ActionIcon variant="subtle" color="red" onClick={onDelete}>
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
        </Group>
        <Text size="xl" fw={700}>
          {formatCurrency(budget.amount)}
        </Text>
        {budget.total_spent !== undefined && (
          <>
            <Progress value={Math.min(pct, 100)} color={color} size="md" radius="xl" />
            <Group justify="space-between">
              <Text size="xs" c="dimmed">
                {formatCurrency(spent)} spent
              </Text>
              <Text size="xs" c={budget.remaining! < 0 ? 'red' : 'teal'} fw={500}>
                {formatCurrency(budget.remaining!)} left
              </Text>
            </Group>
          </>
        )}
        <Text size="xs" c="dimmed">
          {formatDate(budget.start_date)} - {formatDate(budget.end_date)}
        </Text>
      </Stack>
    </Card>
  );
}
