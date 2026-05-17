import { Alert, Stack, Text } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import type { BudgetDetail } from '../../types/budget';
import { formatCurrency } from '../../utils/formatCurrency';

interface BudgetAlertsBannerProps {
  budgets: BudgetDetail[];
}

export function BudgetAlertsBanner({ budgets }: BudgetAlertsBannerProps) {
  const criticalBudgets = budgets.filter((b) => {
    const pct = b.amount > 0 ? (b.total_spent / b.amount) * 100 : 0;
    return pct >= 90;
  });

  if (criticalBudgets.length === 0) return null;

  const overBudget = criticalBudgets.filter((b) => b.remaining < 0);
  const nearLimit = criticalBudgets.filter((b) => b.remaining >= 0);

  return (
    <Stack gap="xs">
      {overBudget.length > 0 && (
        <Alert variant="filled" color="red" icon={<IconAlertTriangle size={18} />} title="Over Budget">
          <Text size="sm">
            {overBudget.map((b) => `${b.name} (${formatCurrency(Math.abs(b.remaining))} over)`).join(', ')}
          </Text>
        </Alert>
      )}
      {nearLimit.length > 0 && (
        <Alert variant="light" color="yellow" icon={<IconAlertTriangle size={18} />} title="Approaching Limit">
          <Text size="sm">
            {nearLimit.map((b) => {
              const pct = Math.round((b.total_spent / b.amount) * 100);
              return `${b.name} (${pct}% used, ${formatCurrency(b.remaining)} left)`;
            }).join(', ')}
          </Text>
        </Alert>
      )}
    </Stack>
  );
}
