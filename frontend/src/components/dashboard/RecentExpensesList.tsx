import { Badge, Card, Group, Stack, Text } from '@mantine/core';
import type { Expense } from '../../types/expense';
import { getCategoryEmoji } from '../../utils/categoryEmojis';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

interface RecentExpensesListProps {
  expenses: Expense[];
}

export function RecentExpensesList({ expenses }: RecentExpensesListProps) {
  return (
    <Card shadow="xs" padding="md" radius="md" withBorder>
      <Text fw={600} mb="sm">
        Recent Expenses
      </Text>
      <Stack gap="xs">
        {expenses.map((exp) => (
          <Group key={exp.id} justify="space-between" wrap="nowrap">
            <div style={{ minWidth: 0, flex: 1 }}>
              <Text size="sm" truncate fw={500}>
                {exp.category ? getCategoryEmoji(exp.category) : ''} {exp.description || exp.category?.name || 'Expense'}
              </Text>
              <Group gap="xs">
                <Text size="xs" c="dimmed">
                  {formatDate(exp.date)}
                </Text>
                {exp.category && (
                  <Badge size="xs" color={exp.category.color} variant="light">
                    {exp.category.name}
                  </Badge>
                )}
              </Group>
            </div>
            <Text size="sm" fw={600} c="coral" style={{ flexShrink: 0 }}>
              {formatCurrency(exp.amount, exp.currency)}
            </Text>
          </Group>
        ))}
      </Stack>
    </Card>
  );
}
