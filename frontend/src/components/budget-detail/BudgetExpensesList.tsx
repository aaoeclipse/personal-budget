import {
  ActionIcon,
  Badge,
  Card,
  Group,
  Pagination,
  Stack,
  Table,
  Text,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { ConfirmModal } from '../common/ConfirmModal';
import { ExpenseForm } from '../expenses/ExpenseForm';
import { useBudgets } from '../../hooks/useBudgets';
import { useCategories } from '../../hooks/useCategories';
import { useDeleteExpense, useExpenses, useUpdateExpense } from '../../hooks/useExpenses';
import type { Expense, ExpenseCreate } from '../../types/expense';
import { getCategoryEmoji } from '../../utils/categoryEmojis';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

const PAGE_SIZE = 10;

interface BudgetExpensesListProps {
  budgetId: string;
}

export function BudgetExpensesList({ budgetId }: BudgetExpensesListProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Expense | undefined>();
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const filters = {
    budget_id: budgetId,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  };

  const { data } = useExpenses(filters);
  const { data: categories = [] } = useCategories();
  const { data: budgets = [] } = useBudgets();
  const updateMutation = useUpdateExpense();
  const deleteMutation = useDeleteExpense();

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;

  return (
    <Card shadow="xs" padding="md" radius="md" withBorder h="100%">
      <Stack gap="sm">
        <Group justify="space-between">
          <Text fw={600}>Expenses</Text>
          {data && <Text size="xs" c="dimmed">{data.total} total</Text>}
        </Group>

        {data?.items.length === 0 ? (
          <Text size="sm" c="dimmed" ta="center" py="lg">
            No expenses recorded yet.
          </Text>
        ) : isMobile ? (
          <Stack gap="xs">
            {data?.items.map((exp) => (
              <Card key={exp.id} shadow="xs" padding="sm" radius="md" withBorder>
                <Group justify="space-between" wrap="nowrap">
                  <Group gap="sm" wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
                    <Text size="xl">
                      {exp.category ? getCategoryEmoji(exp.category) : '📦'}
                    </Text>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <Text size="sm" fw={500} truncate>
                        {exp.description || exp.category?.name || 'Expense'}
                      </Text>
                      <Group gap="xs">
                        <Text size="xs" c="dimmed">{formatDate(exp.date)}</Text>
                        {exp.category && (
                          <Badge color={exp.category.color} variant="light" size="xs">
                            {exp.category.name}
                          </Badge>
                        )}
                      </Group>
                    </div>
                  </Group>
                  <Group gap={4} wrap="nowrap" style={{ flexShrink: 0 }}>
                    <Text size="sm" fw={700} c="coral">
                      {formatCurrency(exp.amount, exp.currency)}
                    </Text>
                    <ActionIcon variant="subtle" color="gray" size="sm" onClick={() => { setEditing(exp); setFormOpen(true); }}>
                      <IconEdit size={14} />
                    </ActionIcon>
                    <ActionIcon variant="subtle" color="red" size="sm" onClick={() => setDeleting(exp.id)}>
                      <IconTrash size={14} />
                    </ActionIcon>
                  </Group>
                </Group>
              </Card>
            ))}
          </Stack>
        ) : (
          <Table.ScrollContainer minWidth={400}>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Description</Table.Th>
                  <Table.Th>Category</Table.Th>
                  <Table.Th ta="right">Amount</Table.Th>
                  <Table.Th w={70} />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {data?.items.map((exp) => (
                  <Table.Tr key={exp.id}>
                    <Table.Td>
                      <Text size="sm">{formatDate(exp.date)}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" truncate maw={180}>
                        {exp.description || exp.category?.name || 'Expense'}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      {exp.category && (
                        <Badge color={exp.category.color} variant="light" size="sm">
                          {getCategoryEmoji(exp.category)} {exp.category.name}
                        </Badge>
                      )}
                    </Table.Td>
                    <Table.Td ta="right">
                      <Text size="sm" fw={600}>
                        {formatCurrency(exp.amount, exp.currency)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap={4} wrap="nowrap">
                        <ActionIcon variant="subtle" color="gray" size="sm" onClick={() => { setEditing(exp); setFormOpen(true); }}>
                          <IconEdit size={14} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="red" size="sm" onClick={() => setDeleting(exp.id)}>
                          <IconTrash size={14} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}

        {totalPages > 1 && (
          <Group justify="center">
            <Pagination total={totalPages} value={page} onChange={setPage} color="coral" size="sm" />
          </Group>
        )}
      </Stack>

      <ExpenseForm
        key={editing?.id ?? 'edit'}
        opened={formOpen}
        onClose={() => { setFormOpen(false); setEditing(undefined); }}
        initial={editing}
        categories={categories}
        budgets={budgets}
        loading={updateMutation.isPending}
        onSubmit={(data: ExpenseCreate) => {
          if (editing) {
            updateMutation.mutateAsync({ id: editing.id, data }).then(() => {
              setFormOpen(false);
              setEditing(undefined);
              notifications.show({ message: 'Expense updated', color: 'green' });
            }).catch(() => notifications.show({ title: 'Error', message: 'Something went wrong', color: 'red' }));
          }
        }}
      />

      <ConfirmModal
        opened={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete Expense"
        message="Are you sure you want to delete this expense?"
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleting) {
            deleteMutation.mutateAsync(deleting).then(() => {
              setDeleting(null);
              notifications.show({ message: 'Expense deleted', color: 'green' });
            }).catch(() => notifications.show({ title: 'Error', message: 'Could not delete', color: 'red' }));
          }
        }}
      />
    </Card>
  );
}
