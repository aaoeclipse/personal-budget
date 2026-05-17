import { Card, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard';
import { BudgetAlertsBanner } from '../components/dashboard/BudgetAlertsBanner';
import { BudgetOverviewCard } from '../components/dashboard/BudgetOverviewCard';
import { MonthlySpendingChart } from '../components/dashboard/MonthlySpendingChart';
import { RecentExpensesList } from '../components/dashboard/RecentExpensesList';
import { SpendingByCategoryChart } from '../components/dashboard/SpendingByCategoryChart';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { formatCurrency } from '../utils/formatCurrency';

export function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({ queryKey: ['dashboard'], queryFn: dashboardApi.get });

  if (isLoading) return <LoadingSpinner />;

  return (
    <Stack>
      <Title order={2}>Hey, {user?.name}!</Title>

      {data && (
        <>
          <BudgetAlertsBanner budgets={data.active_budgets} />

          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
            <Card shadow="xs" padding="md" radius="md" withBorder>
              <Text size="sm" c="dimmed">
                Spent (30 days)
              </Text>
              <Text size="xl" fw={700} c="coral">
                {formatCurrency(data.total_spent)}
              </Text>
            </Card>
            <Card shadow="xs" padding="md" radius="md" withBorder>
              <Text size="sm" c="dimmed">
                Active Budgets
              </Text>
              <Text size="xl" fw={700} c="teal">
                {data.active_budgets.length}
              </Text>
            </Card>
            <Card shadow="xs" padding="md" radius="md" withBorder>
              <Text size="sm" c="dimmed">
                Categories
              </Text>
              <Text size="xl" fw={700}>
                {data.spending_by_category.length}
              </Text>
            </Card>
          </SimpleGrid>

          {data.active_budgets.length > 0 && (
            <>
              <Title order={4}>Active Budgets</Title>
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                {data.active_budgets.map((b) => (
                  <BudgetOverviewCard key={b.id} budget={b} />
                ))}
              </SimpleGrid>
            </>
          )}

          <MonthlySpendingChart />

          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
            <SpendingByCategoryChart data={data.spending_by_category} />
            <RecentExpensesList expenses={data.recent_expenses} />
          </SimpleGrid>
        </>
      )}
    </Stack>
  );
}
