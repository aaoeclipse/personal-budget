import { Stack, Text, ThemeIcon } from '@mantine/core';
import { IconMoodEmpty } from '@tabler/icons-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Stack align="center" gap="md" py="xl">
      <ThemeIcon size={64} variant="light" color="gray" radius="xl">
        <IconMoodEmpty size={32} />
      </ThemeIcon>
      <Text fw={600} size="lg">
        {title}
      </Text>
      {description && (
        <Text c="dimmed" size="sm" ta="center" maw={400}>
          {description}
        </Text>
      )}
      {action}
    </Stack>
  );
}
