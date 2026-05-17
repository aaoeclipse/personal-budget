import { Badge, Card, Group, Progress, Stack, Text } from '@mantine/core';
import { IconAlertTriangle, IconFlame } from '@tabler/icons-react';
import type { BudgetDetail } from '../../types/budget';
import { formatCurrency } from '../../utils/formatCurrency';

interface BudgetOverviewCardProps {
  budget: BudgetDetail;
}

export function BudgetOverviewCard({ budget }: BudgetOverviewCardProps) {
  const pct = budget.amount > 0 ? (budget.total_spent / budget.amount) * 100 : 0;
  const color = pct >= 100 ? 'red' : pct >= 75 ? 'yellow' : 'teal';
  const alertLevel = pct >= 100 ? 'over' : pct >= 90 ? 'critical' : pct >= 75 ? 'warning' : null;

  return (
    <Card shadow="xs" padding="md" radius="md" withBorder>
      <Stack gap="xs">
        <Group justify="space-between" wrap="nowrap">
          <Text fw={600} truncate>
            {budget.name}
          </Text>
          {alertLevel === 'over' && (
            <Badge color="red" variant="filled" size="sm" leftSection={<IconFlame size={12} />}>
              Over budget
            </Badge>
          )}
          {alertLevel === 'critical' && (
            <Badge color="red" variant="light" size="sm" leftSection={<IconAlertTriangle size={12} />}>
              90%+
            </Badge>
          )}
          {alertLevel === 'warning' && (
            <Badge color="yellow" variant="light" size="sm" leftSection={<IconAlertTriangle size={12} />}>
              75%+
            </Badge>
          )}
        </Group>
        <Progress value={Math.min(pct, 100)} color={color} size="lg" radius="xl" animated={pct >= 90} />
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            {formatCurrency(budget.total_spent)} of {formatCurrency(budget.amount)}
          </Text>
          <Text size="sm" fw={500} c={budget.remaining < 0 ? 'red' : 'teal'}>
            {budget.remaining < 0 ? '-' : ''}{formatCurrency(Math.abs(budget.remaining))} {budget.remaining < 0 ? 'over' : 'left'}
          </Text>
        </Group>
        <Group justify="space-between">
          <Text size="xs" c="dimmed">
            {formatCurrency(budget.total_spent_gtq, 'GTQ')} of {formatCurrency(budget.amount_gtq, 'GTQ')}
          </Text>
          <Text size="xs" c="dimmed">
            {Math.round(pct)}% used
          </Text>
        </Group>
      </Stack>
    </Card>
  );
}
