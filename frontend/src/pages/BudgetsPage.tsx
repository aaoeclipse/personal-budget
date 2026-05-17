import { Button, Group, SimpleGrid, Title } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconPlus } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { BudgetCard } from '../components/budgets/BudgetCard';
import { BudgetForm } from '../components/budgets/BudgetForm';
import { BudgetMembersDrawer } from '../components/budgets/BudgetMembersDrawer';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useBudgets, useCreateBudget, useDeleteBudget, useUpdateBudget } from '../hooks/useBudgets';
import type { Budget, BudgetCreate } from '../types/budget';
import { budgetsApi } from '../api/budgets';
import type { BudgetDetail } from '../types/budget';

export function BudgetsPage() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { data: budgets, isLoading } = useBudgets();
  const createMutation = useCreateBudget();
  const updateMutation = useUpdateBudget();
  const deleteMutation = useDeleteBudget();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Budget | undefined>();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [details, setDetails] = useState<Record<string, BudgetDetail>>({});
  const [membersDrawer, setMembersDrawer] = useState<{ budgetId: string; budgetName: string; isOwner: boolean } | null>(null);

  useEffect(() => {
    if (budgets) {
      budgets.forEach((b) => {
        if (!details[b.id]) {
          budgetsApi.get(b.id).then((d) => setDetails((prev) => ({ ...prev, [b.id]: d })));
        }
      });
    }
  }, [budgets, details]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <>
      <Group justify="space-between" mb="md">
        <Title order={2} size={isMobile ? 'h3' : 'h2'}>Budgets</Title>
        <Button leftSection={<IconPlus size={16} />} color="coral" size={isMobile ? 'sm' : 'md'} onClick={() => { setEditing(undefined); setFormOpen(true); }}>
          {isMobile ? 'New' : 'New Budget'}
        </Button>
      </Group>

      {budgets?.length === 0 ? (
        <EmptyState
          title="No budgets yet"
          description="Create a budget to start tracking your spending goals."
          action={
            <Button color="coral" onClick={() => setFormOpen(true)}>
              Create your first budget
            </Button>
          }
        />
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
          {budgets?.map((b) => (
            <BudgetCard
              key={b.id}
              budget={details[b.id] ?? b}
              onEdit={() => { setEditing(b); setFormOpen(true); }}
              onDelete={() => setDeleting(b.id)}
              onMembers={() => setMembersDrawer({ budgetId: b.id, budgetName: b.name, isOwner: b.role === 'owner' })}
            />
          ))}
        </SimpleGrid>
      )}

      <BudgetForm
        opened={formOpen}
        onClose={() => setFormOpen(false)}
        initial={editing}
        loading={createMutation.isPending || updateMutation.isPending}
        onSubmit={(data: BudgetCreate) => {
          const mutation = editing
            ? updateMutation.mutateAsync({ id: editing.id, data })
            : createMutation.mutateAsync(data);
          mutation.then(() => {
            setFormOpen(false);
            setDetails({});
            notifications.show({ message: editing ? 'Budget updated' : 'Budget created', color: 'green' });
          }).catch(() => notifications.show({ title: 'Error', message: 'Something went wrong', color: 'red' }));
        }}
      />

      <ConfirmModal
        opened={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete Budget"
        message="Are you sure you want to delete this budget?"
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleting) {
            deleteMutation.mutateAsync(deleting).then(() => {
              setDeleting(null);
              setDetails({});
              notifications.show({ message: 'Budget deleted', color: 'green' });
            }).catch(() => notifications.show({ title: 'Error', message: 'Could not delete', color: 'red' }));
          }
        }}
      />

      {membersDrawer && (
        <BudgetMembersDrawer
          opened={!!membersDrawer}
          onClose={() => setMembersDrawer(null)}
          budgetId={membersDrawer.budgetId}
          budgetName={membersDrawer.budgetName}
          isOwner={membersDrawer.isOwner}
        />
      )}
    </>
  );
}
