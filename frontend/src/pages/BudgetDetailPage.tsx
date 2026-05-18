import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Grid,
  Group,
  Progress,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft, IconEdit, IconTrash, IconUsers } from '@tabler/icons-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { BudgetForm } from '../components/budgets/BudgetForm';
import { BudgetMembersDrawer } from '../components/budgets/BudgetMembersDrawer';
import { BudgetCategoryBreakdown } from '../components/budget-detail/BudgetCategoryBreakdown';
import { BudgetDailySpendingChart } from '../components/budget-detail/BudgetDailySpendingChart';
import { BudgetExpensesList } from '../components/budget-detail/BudgetExpensesList';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useBudget, useBudgetStats, useDeleteBudget, useUpdateBudget } from '../hooks/useBudgets';
import type { BudgetCreate } from '../types/budget';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';

export function BudgetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const { data: budget, isLoading: budgetLoading } = useBudget(id!);
  const { data: stats, isLoading: statsLoading } = useBudgetStats(id!);
  const updateMutation = useUpdateBudget();
  const deleteMutation = useDeleteBudget();

  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);

  if (budgetLoading || statsLoading) return <LoadingSpinner />;
  if (!budget || !stats) return <Text c="dimmed">Budget not found.</Text>;

  const isOwner = budget.role === 'owner';
  const pct = budget.amount > 0 ? (budget.total_spent / budget.amount) * 100 : 0;
  const progressColor = pct >= 100 ? 'red' : pct >= 75 ? 'yellow' : 'teal';
  const usdToGtq = 7.7;

  return (
    <Stack gap={isMobile ? 'sm' : 'md'}>
      {/* Header */}
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
          <ActionIcon variant="subtle" color="gray" onClick={() => navigate('/budgets')}>
            <IconArrowLeft size={20} />
          </ActionIcon>
          <div style={{ minWidth: 0 }}>
            <Group gap="xs" wrap="nowrap">
              <Title order={2} size={isMobile ? 'h3' : 'h2'} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {budget.name}
              </Title>
              {budget.is_shared && (
                <Badge size="sm" variant="light" color="blue" leftSection={<IconUsers size={10} />}>
                  {budget.member_count}
                </Badge>
              )}
            </Group>
            <Text size="sm" c="dimmed">
              {formatDate(budget.start_date)} - {formatDate(budget.end_date)}
            </Text>
          </div>
        </Group>
        <Group gap={4} wrap="nowrap" style={{ flexShrink: 0 }}>
          {budget.is_shared && (
            <ActionIcon variant="subtle" color="blue" onClick={() => setMembersOpen(true)} title="Members">
              <IconUsers size={18} />
            </ActionIcon>
          )}
          {isOwner && (
            <>
              <ActionIcon variant="subtle" color="gray" onClick={() => setFormOpen(true)} title="Edit">
                <IconEdit size={18} />
              </ActionIcon>
              <ActionIcon variant="subtle" color="red" onClick={() => setDeleting(true)} title="Delete">
                <IconTrash size={18} />
              </ActionIcon>
            </>
          )}
        </Group>
      </Group>

      {/* 4 Stat Cards */}
      <SimpleGrid cols={{ base: 2, md: 4 }} spacing={isMobile ? 'xs' : 'md'}>
        <Card shadow="xs" padding={isMobile ? 'xs' : 'md'} radius="md" withBorder>
          <Text size="xs" c="dimmed">Daily Allowance</Text>
          <Text size={isMobile ? 'md' : 'xl'} fw={700} c="teal">
            {formatCurrency(stats.daily_allowance)}
          </Text>
        </Card>
        <Card shadow="xs" padding={isMobile ? 'xs' : 'md'} radius="md" withBorder>
          <Text size="xs" c="dimmed">Days Remaining</Text>
          <Text size={isMobile ? 'md' : 'xl'} fw={700} c="violet">
            {stats.days_remaining} <Text span size="xs" c="dimmed">of {stats.days_total}</Text>
          </Text>
        </Card>
        <Card shadow="xs" padding={isMobile ? 'xs' : 'md'} radius="md" withBorder>
          <Text size="xs" c="dimmed">Daily Average</Text>
          <Text size={isMobile ? 'md' : 'xl'} fw={700} c="orange">
            {formatCurrency(stats.avg_daily_spending)}
          </Text>
        </Card>
        <Card shadow="xs" padding={isMobile ? 'xs' : 'md'} radius="md" withBorder>
          <Text size="xs" c="dimmed">Used</Text>
          <Text size={isMobile ? 'md' : 'xl'} fw={700} c={pct >= 90 ? 'red' : 'coral'}>
            {Math.round(pct)}%
          </Text>
        </Card>
      </SimpleGrid>

      {/* Progress Card */}
      <Card shadow="xs" padding="md" radius="md" withBorder>
        <Stack gap="sm">
          <Progress value={Math.min(pct, 100)} color={progressColor} size="lg" radius="xl" animated={pct >= 90} />
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              {formatCurrency(budget.total_spent)} spent
            </Text>
            <Text size="sm" fw={500} c={budget.remaining < 0 ? 'red' : 'teal'}>
              {budget.remaining < 0 ? '-' : ''}{formatCurrency(Math.abs(budget.remaining))} {budget.remaining < 0 ? 'over' : 'remaining'}
            </Text>
          </Group>
          <Group justify="space-between">
            <Text size="xs" c="dimmed">
              {formatCurrency(budget.total_spent_gtq, 'GTQ')} of {formatCurrency(budget.amount_gtq, 'GTQ')}
            </Text>
            <Group gap="xs">
              <Text size="xs" c="dimmed">
                Projected: {formatCurrency(stats.projected_total)}
              </Text>
              <Badge
                size="xs"
                variant="light"
                color={stats.on_track ? 'teal' : 'red'}
              >
                {stats.on_track ? 'On track' : 'Over pace'}
              </Badge>
            </Group>
          </Group>
        </Stack>
      </Card>

      {/* Daily Spending Chart */}
      <BudgetDailySpendingChart
        data={stats.daily_spending}
        dailyAllowance={stats.daily_allowance}
        startDate={budget.start_date}
        endDate={budget.end_date}
      />

      {/* Category Breakdown + Expenses */}
      <Grid gutter="md">
        <Grid.Col span={{ base: 12, md: 5 }}>
          <BudgetCategoryBreakdown data={stats.spending_by_category} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 7 }}>
          <BudgetExpensesList budgetId={id!} />
        </Grid.Col>
      </Grid>

      {/* Edit Budget Modal */}
      <BudgetForm
        opened={formOpen}
        onClose={() => setFormOpen(false)}
        initial={budget}
        loading={updateMutation.isPending}
        onSubmit={(data: BudgetCreate) => {
          updateMutation.mutateAsync({ id: budget.id, data }).then(() => {
            setFormOpen(false);
            notifications.show({ message: 'Budget updated', color: 'green' });
          }).catch(() => notifications.show({ title: 'Error', message: 'Something went wrong', color: 'red' }));
        }}
      />

      {/* Delete Confirm */}
      <ConfirmModal
        opened={deleting}
        onClose={() => setDeleting(false)}
        title="Delete Budget"
        message="Are you sure you want to delete this budget? All linked expenses will be unlinked."
        loading={deleteMutation.isPending}
        onConfirm={() => {
          deleteMutation.mutateAsync(budget.id).then(() => {
            notifications.show({ message: 'Budget deleted', color: 'green' });
            navigate('/budgets');
          }).catch(() => notifications.show({ title: 'Error', message: 'Could not delete', color: 'red' }));
        }}
      />

      {/* Members Drawer */}
      {budget.is_shared && (
        <BudgetMembersDrawer
          opened={membersOpen}
          onClose={() => setMembersOpen(false)}
          budgetId={budget.id}
          budgetName={budget.name}
          isOwner={isOwner}
        />
      )}
    </Stack>
  );
}
