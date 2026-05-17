import { Card, Group, Progress, Select, Stack, Text } from '@mantine/core';
import { useState } from 'react';
import type { BudgetDetail } from '../../types/budget';
import { formatCurrency } from '../../utils/formatCurrency';

interface BudgetComparisonChartProps {
  budgets: BudgetDetail[];
}

export function BudgetComparisonChart({ budgets }: BudgetComparisonChartProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!budgets || budgets.length === 0) return null;

  const selected = selectedId
    ? budgets.find((b) => b.id === selectedId) ?? null
    : null;

  // If a specific budget is selected, show detailed view
  const displayBudgets = selected ? [selected] : budgets;

  return (
    <Card shadow="xs" padding="md" radius="md" withBorder>
      <Stack gap="sm">
        <Group justify="space-between" align="center">
          <Text fw={600}>Budget vs Spent</Text>
          <Select
            placeholder="All budgets"
            data={budgets.map((b) => ({ value: b.id, label: b.name }))}
            value={selectedId}
            onChange={setSelectedId}
            clearable
            size="xs"
            w={160}
          />
        </Group>

        <Stack gap="md">
          {displayBudgets.map((b) => {
            const pct = b.amount > 0 ? (b.total_spent / b.amount) * 100 : 0;
            const color = pct >= 100 ? 'red' : pct >= 75 ? 'orange' : 'teal';

            return (
              <Stack key={b.id} gap={4}>
                <Group justify="space-between">
                  <Text size="sm" fw={500}>{b.name}</Text>
                  <Text size="sm" fw={600} c={color}>{Math.round(pct)}%</Text>
                </Group>
                <Progress.Root size="xl" radius="xl">
                  <Progress.Section value={Math.min(pct, 100)} color={color}>
                    <Progress.Label>{formatCurrency(b.total_spent)}</Progress.Label>
                  </Progress.Section>
                </Progress.Root>
                <Group justify="space-between">
                  <Text size="xs" c="dimmed">
                    {formatCurrency(b.total_spent)} / {formatCurrency(b.amount)}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {formatCurrency(b.total_spent_gtq, 'GTQ')} / {formatCurrency(b.amount_gtq, 'GTQ')}
                  </Text>
                </Group>
              </Stack>
            );
          })}
        </Stack>
      </Stack>
    </Card>
  );
}
