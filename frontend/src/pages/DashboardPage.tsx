import { Card, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
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
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { user } = useAuth();
  const { data, isLoading } = useQuery({ queryKey: ['dashboard'], queryFn: dashboardApi.get });

  if (isLoading) return <LoadingSpinner />;

  return (
    <Stack gap={isMobile ? 'sm' : 'md'}>
      <Title order={2} size={isMobile ? 'h3' : 'h2'}>Hey, {user?.name}!</Title>

      {data && (
        <>
          <BudgetAlertsBanner budgets={data.active_budgets} />

          <SimpleGrid cols={3} spacing={isMobile ? 'xs' : 'md'}>
            <Card shadow="xs" padding={isMobile ? 'xs' : 'md'} radius="md" withBorder>
              <Text size="xs" c="dimmed">
                Spent (30d)
              </Text>
              <Text size={isMobile ? 'md' : 'xl'} fw={700} c="coral">
                {formatCurrency(data.total_spent)}
              </Text>
            </Card>
            <Card shadow="xs" padding={isMobile ? 'xs' : 'md'} radius="md" withBorder>
              <Text size="xs" c="dimmed">
                Budgets
              </Text>
              <Text size={isMobile ? 'md' : 'xl'} fw={700} c="teal">
                {data.active_budgets.length}
              </Text>
            </Card>
            <Card shadow="xs" padding={isMobile ? 'xs' : 'md'} radius="md" withBorder>
              <Text size="xs" c="dimmed">
                Categories
              </Text>
              <Text size={isMobile ? 'md' : 'xl'} fw={700}>
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
