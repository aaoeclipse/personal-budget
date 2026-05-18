import {
  ActionIcon,
  Badge,
  Button,
  Card,
  FileButton,
  Group,
  List,
  Modal,
  Pagination,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconDownload, IconEdit, IconPlus, IconTrash, IconUpload } from '@tabler/icons-react';
import { useRef, useState } from 'react';
import { expensesApi } from '../api/expenses';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ExpenseFilterBar } from '../components/expenses/ExpenseFilters';
import { ExpenseForm } from '../components/expenses/ExpenseForm';
import { useBudgets } from '../hooks/useBudgets';
import { useCategories } from '../hooks/useCategories';
import { useCreateExpense, useDeleteExpense, useExpenses, useImportExpenses, useUpdateExpense } from '../hooks/useExpenses';
import type { CsvImportResponse, Expense, ExpenseCreate } from '../types/expense';
import { getCategoryEmoji } from '../utils/categoryEmojis';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';

const PAGE_SIZE = 20;

export function ExpensesPage() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [budgetId, setBudgetId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [search, setSearch] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | undefined>();
  const [deleting, setDeleting] = useState<string | null>(null);

  const filters = {
    category_id: categoryId || undefined,
    budget_id: budgetId || undefined,
    start_date: startDate?.toISOString().split('T')[0],
    end_date: endDate?.toISOString().split('T')[0],
    search: search || undefined,
    min_amount: minAmount ? Number(minAmount) : undefined,
    max_amount: maxAmount ? Number(maxAmount) : undefined,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  };

  const { data, isLoading } = useExpenses(filters);
  const { data: categories = [] } = useCategories();
  const { data: budgets = [] } = useBudgets();
  const createMutation = useCreateExpense();
  const updateMutation = useUpdateExpense();
  const deleteMutation = useDeleteExpense();
  const importMutation = useImportExpenses();
  const [importResult, setImportResult] = useState<CsvImportResponse | null>(null);
  const resetFileRef = useRef<() => void>(null);

  const handleImportFile = (file: File | null) => {
    if (!file) return;
    importMutation.mutate(file, {
      onSuccess: (result) => {
        setImportResult(result);
        if (result.imported > 0) {
          notifications.show({ message: `${result.imported} expense(s) imported`, color: 'green' });
        }
      },
      onError: () => {
        notifications.show({ title: 'Error', message: 'Could not import CSV', color: 'red' });
      },
      onSettled: () => {
        resetFileRef.current?.();
      },
    });
  };

  // Determine if we're viewing a shared budget's expenses
  const selectedBudget = budgets.find((b) => b.id === budgetId);
  const isSharedView = selectedBudget?.is_shared ?? false;

  if (isLoading) return <LoadingSpinner />;

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={2} size={isMobile ? 'h3' : 'h2'}>Expenses</Title>
        <Group gap="xs">
          {isMobile ? (
            <>
              <FileButton onChange={handleImportFile} accept=".csv,text/csv" resetRef={resetFileRef}>
                {(props) => (
                  <ActionIcon
                    {...props}
                    variant="light"
                    color="violet"
                    size="lg"
                    title="Import CSV"
                    loading={importMutation.isPending}
                  >
                    <IconUpload size={18} />
                  </ActionIcon>
                )}
              </FileButton>
              <ActionIcon
                variant="light"
                color="teal"
                size="lg"
                onClick={() => {
                  expensesApi.exportCsv({
                    category_id: categoryId || undefined,
                    budget_id: budgetId || undefined,
                    start_date: startDate?.toISOString().split('T')[0],
                    end_date: endDate?.toISOString().split('T')[0],
                    search: search || undefined,
                    min_amount: minAmount ? Number(minAmount) : undefined,
                    max_amount: maxAmount ? Number(maxAmount) : undefined,
                  }).then(() => {
                    notifications.show({ message: 'Expenses exported', color: 'green' });
                  }).catch(() => {
                    notifications.show({ title: 'Error', message: 'Could not export', color: 'red' });
                  });
                }}
                title="Export CSV"
              >
                <IconDownload size={18} />
              </ActionIcon>
            </>
          ) : (
            <>
              <FileButton onChange={handleImportFile} accept=".csv,text/csv" resetRef={resetFileRef}>
                {(props) => (
                  <Button
                    {...props}
                    variant="light"
                    leftSection={<IconUpload size={16} />}
                    color="violet"
                    loading={importMutation.isPending}
                  >
                    Import CSV
                  </Button>
                )}
              </FileButton>
              <Button
                variant="light"
                leftSection={<IconDownload size={16} />}
                color="teal"
                onClick={() => {
                  expensesApi.exportCsv({
                    category_id: categoryId || undefined,
                    budget_id: budgetId || undefined,
                    start_date: startDate?.toISOString().split('T')[0],
                    end_date: endDate?.toISOString().split('T')[0],
                    search: search || undefined,
                    min_amount: minAmount ? Number(minAmount) : undefined,
                    max_amount: maxAmount ? Number(maxAmount) : undefined,
                  }).then(() => {
                    notifications.show({ message: 'Expenses exported', color: 'green' });
                  }).catch(() => {
                    notifications.show({ title: 'Error', message: 'Could not export', color: 'red' });
                  });
                }}
              >
                Export CSV
              </Button>
              <Button leftSection={<IconPlus size={16} />} color="coral" onClick={() => { setEditing(undefined); setFormOpen(true); }}>
                Add Expense
              </Button>
            </>
          )}
        </Group>
      </Group>

      <ExpenseFilterBar
        categories={categories}
        budgets={budgets}
        categoryId={categoryId}
        budgetId={budgetId}
        startDate={startDate}
        endDate={endDate}
        search={search}
        minAmount={minAmount}
        maxAmount={maxAmount}
        onCategoryChange={(v) => { setCategoryId(v); setPage(1); }}
        onBudgetChange={(v) => { setBudgetId(v); setPage(1); }}
        onStartDateChange={(v) => { setStartDate(v); setPage(1); }}
        onEndDateChange={(v) => { setEndDate(v); setPage(1); }}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        onMinAmountChange={(v) => { setMinAmount(v); setPage(1); }}
        onMaxAmountChange={(v) => { setMaxAmount(v); setPage(1); }}
      />

      {data?.items.length === 0 ? (
        <EmptyState
          title="No expenses found"
          description="Add your first expense or adjust filters."
          action={
            <Button color="coral" onClick={() => setFormOpen(true)}>
              Add expense
            </Button>
          }
        />
      ) : isMobile ? (
        /* Mobile: Card-based list */
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
                      {isSharedView && exp.creator_name && (
                        <Text size="xs" c="dimmed">by {exp.creator_name}</Text>
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
        /* Desktop: Table */
        <>
          <Table.ScrollContainer minWidth={500}>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Description</Table.Th>
                  <Table.Th>Category</Table.Th>
                  {isSharedView && <Table.Th>Added By</Table.Th>}
                  <Table.Th ta="right">Amount</Table.Th>
                  <Table.Th w={80} />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {data?.items.map((exp) => (
                  <Table.Tr key={exp.id}>
                    <Table.Td>
                      <Text size="sm">{formatDate(exp.date)}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" truncate maw={200}>
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
                    {isSharedView && (
                      <Table.Td>
                        <Text size="sm" c="dimmed">{exp.creator_name || '-'}</Text>
                      </Table.Td>
                    )}
                    <Table.Td ta="right">
                      <Text size="sm" fw={600}>
                        {formatCurrency(exp.amount, exp.currency)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap={4} wrap="nowrap">
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          size="sm"
                          onClick={() => { setEditing(exp); setFormOpen(true); }}
                        >
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

          {totalPages > 1 && (
            <Group justify="center">
              <Pagination total={totalPages} value={page} onChange={setPage} color="coral" />
            </Group>
          )}
        </>
      )}

      {/* Mobile pagination */}
      {isMobile && totalPages > 1 && (
        <Group justify="center">
          <Pagination total={totalPages} value={page} onChange={setPage} color="coral" size="sm" />
        </Group>
      )}

      <ExpenseForm
        key={editing?.id ?? 'new'}
        opened={formOpen}
        onClose={() => { setFormOpen(false); setEditing(undefined); }}
        initial={editing}
        categories={categories}
        budgets={budgets}
        loading={createMutation.isPending || updateMutation.isPending}
        onSubmit={(data: ExpenseCreate) => {
          const mutation = editing
            ? updateMutation.mutateAsync({ id: editing.id, data })
            : createMutation.mutateAsync(data);
          mutation.then(() => {
            setFormOpen(false);
            setEditing(undefined);
            notifications.show({ message: editing ? 'Expense updated' : 'Expense added', color: 'green' });
          }).catch(() => notifications.show({ title: 'Error', message: 'Something went wrong', color: 'red' }));
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

      <Modal
        opened={!!importResult}
        onClose={() => setImportResult(null)}
        title="Import Results"
        centered
      >
        {importResult && (
          <Stack gap="md">
            <Group gap="lg">
              <div>
                <Text size="xl" fw={700} c="teal">{importResult.imported}</Text>
                <Text size="xs" c="dimmed">Imported</Text>
              </div>
              {importResult.errors.length > 0 && (
                <div>
                  <Text size="xl" fw={700} c="red">{importResult.errors.length}</Text>
                  <Text size="xs" c="dimmed">Errors</Text>
                </div>
              )}
            </Group>
            {importResult.errors.length > 0 && (
              <>
                <Text size="sm" fw={500}>Errors:</Text>
                <List size="sm" spacing="xs" styles={{ root: { maxHeight: 200, overflow: 'auto' } }}>
                  {importResult.errors.map((err, i) => (
                    <List.Item key={i}>
                      <Text size="sm" c="red">Row {err.row}: {err.message}</Text>
                    </List.Item>
                  ))}
                </List>
              </>
            )}
            <Button onClick={() => setImportResult(null)} color="coral">
              Close
            </Button>
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}
