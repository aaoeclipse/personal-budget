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
import { useMediaQuery } from '@mantine/hooks';
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
  const isMobile = useMediaQuery('(max-width: 768px)');
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
        <Title order={2} size={isMobile ? 'h3' : 'h2'}>Categories</Title>
        <Button leftSection={<IconPlus size={16} />} color="coral" size={isMobile ? 'sm' : 'md'} onClick={() => { setEditing(undefined); setFormOpen(true); }}>
          {isMobile ? 'New' : 'New Category'}
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
        <SimpleGrid cols={{ base: 2, sm: 2, md: 3 }} spacing="sm">
          {categories?.map((cat) => (
            <Card key={cat.id} shadow="xs" padding="sm" radius="md" withBorder>
              <Stack gap={4} align="center">
                <Text size="xl">{getCategoryEmoji(cat)}</Text>
                <Text fw={500} size="sm" ta="center" truncate w="100%">{cat.name}</Text>
                <Group gap={4}>
                  <ActionIcon variant="subtle" color="gray" size="sm" onClick={() => { setEditing(cat); setFormOpen(true); }}>
                    <IconEdit size={14} />
                  </ActionIcon>
                  <ActionIcon variant="subtle" color="red" size="sm" onClick={() => setDeleting(cat.id)}>
                    <IconTrash size={14} />
                  </ActionIcon>
                </Group>
              </Stack>
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
