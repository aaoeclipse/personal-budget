import {
  ActionIcon,
  Button,
  Card,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { CategoryForm } from '../components/categories/CategoryForm';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useCategories, useCreateCategory, useDeleteCategory, useUpdateCategory } from '../hooks/useCategories';
import type { Category, CategoryCreate } from '../types/category';
import { getCategoryEmoji } from '../utils/categoryEmojis';

export function CategoriesPage() {
  const { data: categories, isLoading } = useCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | undefined>();
  const [deleting, setDeleting] = useState<string | null>(null);

  if (isLoading) return <LoadingSpinner />;

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={2}>Categories</Title>
        <Button leftSection={<IconPlus size={16} />} color="coral" onClick={() => { setEditing(undefined); setFormOpen(true); }}>
          New Category
        </Button>
      </Group>

      {categories?.length === 0 ? (
        <EmptyState
          title="No categories yet"
          description="Create categories to organize your expenses."
          action={
            <Button color="coral" onClick={() => setFormOpen(true)}>
              Create your first category
            </Button>
          }
        />
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
          {categories?.map((cat) => (
            <Card key={cat.id} shadow="xs" padding="md" radius="md" withBorder>
              <Group justify="space-between">
                <Group>
                  <Text size="xl">{getCategoryEmoji(cat)}</Text>
                  <Text fw={500}>{cat.name}</Text>
                </Group>
                <Group gap={4}>
                  <ActionIcon variant="subtle" color="gray" onClick={() => { setEditing(cat); setFormOpen(true); }}>
                    <IconEdit size={16} />
                  </ActionIcon>
                  <ActionIcon variant="subtle" color="red" onClick={() => setDeleting(cat.id)}>
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Group>
            </Card>
          ))}
        </SimpleGrid>
      )}

      <CategoryForm
        opened={formOpen}
        onClose={() => setFormOpen(false)}
        initial={editing}
        loading={createMutation.isPending || updateMutation.isPending}
        onSubmit={(data: CategoryCreate) => {
          const mutation = editing
            ? updateMutation.mutateAsync({ id: editing.id, data })
            : createMutation.mutateAsync(data);
          mutation.then(() => {
            setFormOpen(false);
            notifications.show({ message: editing ? 'Category updated' : 'Category created', color: 'green' });
          }).catch(() => notifications.show({ title: 'Error', message: 'Something went wrong', color: 'red' }));
        }}
      />

      <ConfirmModal
        opened={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete Category"
        message="This will only work if no expenses use this category."
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleting) {
            deleteMutation.mutateAsync(deleting).then(() => {
              setDeleting(null);
              notifications.show({ message: 'Category deleted', color: 'green' });
            }).catch(() => notifications.show({ title: 'Error', message: 'Cannot delete category with existing expenses', color: 'red' }));
          }
        }}
      />
    </Stack>
  );
}
