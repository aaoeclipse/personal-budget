import { ActionIcon, Box } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconPlus } from '@tabler/icons-react';
import { useState } from 'react';
import { useBudgets } from '../../hooks/useBudgets';
import { useCategories } from '../../hooks/useCategories';
import { useCreateExpense } from '../../hooks/useExpenses';
import type { ExpenseCreate } from '../../types/expense';
import { ExpenseForm } from '../expenses/ExpenseForm';

export function FloatingAddButton() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [opened, setOpened] = useState(false);
  const { data: categories = [] } = useCategories();
  const { data: budgets = [] } = useBudgets();
  const createMutation = useCreateExpense();

  if (!isMobile) return null;

  return (
    <>
      <Box
        style={{
          position: 'fixed',
          bottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
          right: 20,
          zIndex: 100,
        }}
      >
        <ActionIcon
          size={56}
          radius="xl"
          color="coral"
          variant="filled"
          onClick={() => setOpened(true)}
          style={{ boxShadow: '0 4px 12px rgba(255, 107, 107, 0.4)' }}
        >
          <IconPlus size={24} />
        </ActionIcon>
      </Box>

      <ExpenseForm
        opened={opened}
        onClose={() => setOpened(false)}
        categories={categories}
        budgets={budgets}
        loading={createMutation.isPending}
        onSubmit={(data: ExpenseCreate) => {
          createMutation.mutateAsync(data).then(() => {
            setOpened(false);
            notifications.show({ message: 'Expense added', color: 'green' });
          }).catch(() => {
            notifications.show({ title: 'Error', message: 'Something went wrong', color: 'red' });
          });
        }}
      />
    </>
  );
}
