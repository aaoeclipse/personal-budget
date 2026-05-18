import { Card, Grid, Group, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard';
import { BudgetAlertsBanner } from '../components/dashboard/BudgetAlertsBanner';
import { BudgetComparisonChart } from '../components/dashboard/MonthlySpendingChart';
import { BudgetOverviewCard } from '../components/dashboard/BudgetOverviewCard';
import { DailySpendingChart } from '../components/dashboard/DailySpendingChart';
import { InvitationsBanner } from '../components/dashboard/InvitationsBanner';
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

  // Calculate this month's spending from recent expenses (approximate)
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const monthlySpent = data?.recent_expenses
    ?.filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, e) => sum + Number(e.amount), 0) ?? 0;

  // Calculate daily average from last 30 days
  const dailyAvg = data?.daily_spending && data.daily_spending.length > 0
    ? data.daily_spending.reduce((sum, d) => sum + Number(d.total), 0) / data.daily_spending.length
    : 0;

  return (
    <Stack gap={isMobile ? 'sm' : 'md'}>
      <Title order={2} size={isMobile ? 'h3' : 'h2'}>Hey, {user?.name}!</Title>

      <InvitationsBanner />

      {data && (
        <>
          <BudgetAlertsBanner budgets={data.active_budgets} />

          {/* Stat cards — 4 on desktop, 2x2 on mobile */}
          <SimpleGrid cols={{ base: 2, md: 4 }} spacing={isMobile ? 'xs' : 'md'}>
            <Card shadow="xs" padding={isMobile ? 'xs' : 'md'} radius="md" withBorder>
              <Text size="xs" c="dimmed">
                Spent (30d)
              </Text>
              <Text size={isMobile ? 'md' : 'xl'} fw={700} c="coral">
                {formatCurrency(Number(data.total_spent))}
              </Text>
            </Card>
            <Card shadow="xs" padding={isMobile ? 'xs' : 'md'} radius="md" withBorder>
              <Text size="xs" c="dimmed">
                This Month
              </Text>
              <Text size={isMobile ? 'md' : 'xl'} fw={700} c="orange">
                {formatCurrency(monthlySpent)}
              </Text>
            </Card>
            <Card shadow="xs" padding={isMobile ? 'xs' : 'md'} radius="md" withBorder>
              <Text size="xs" c="dimmed">
                Daily Avg
              </Text>
              <Text size={isMobile ? 'md' : 'xl'} fw={700} c="violet">
                {formatCurrency(Math.round(dailyAvg * 100) / 100)}
              </Text>
            </Card>
            <Card shadow="xs" padding={isMobile ? 'xs' : 'md'} radius="md" withBorder>
              <Text size="xs" c="dimmed">
                Active Budgets
              </Text>
              <Text size={isMobile ? 'md' : 'xl'} fw={700} c="teal">
                {data.active_budgets.length}
              </Text>
            </Card>
          </SimpleGrid>

          {/* Daily spending chart — full width */}
          {data.daily_spending.length > 0 && (
            <DailySpendingChart data={data.daily_spending} />
          )}

          {/* Budget vs Spent + Category chart side by side on desktop */}
          {data.active_budgets.length > 0 && (
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, md: 7 }}>
                <BudgetComparisonChart budgets={data.active_budgets} />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 5 }}>
                <SpendingByCategoryChart data={data.spending_by_category} />
              </Grid.Col>
            </Grid>
          )}

          {/* If no active budgets, show category chart full width */}
          {data.active_budgets.length === 0 && data.spending_by_category.length > 0 && (
            <SpendingByCategoryChart data={data.spending_by_category} />
          )}

          {/* Active budgets + Recent expenses side by side on desktop */}
          <Grid gutter="md">
            {data.active_budgets.length > 0 && (
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Stack gap="sm">
                  <Group justify="space-between" align="center">
                    <Title order={4}>Active Budgets</Title>
                    <Text size="xs" c="dimmed">{data.active_budgets.length} budget{data.active_budgets.length !== 1 ? 's' : ''}</Text>
                  </Group>
                  {data.active_budgets.map((b) => (
                    <BudgetOverviewCard key={b.id} budget={b} />
                  ))}
                </Stack>
              </Grid.Col>
            )}
            <Grid.Col span={{ base: 12, md: data.active_budgets.length > 0 ? 6 : 12 }}>
              <RecentExpensesList expenses={data.recent_expenses} />
            </Grid.Col>
          </Grid>
        </>
      )}
    </Stack>
  );
}
