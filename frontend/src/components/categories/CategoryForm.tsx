import { Button, ColorSwatch, Modal, SimpleGrid, Stack, Text, TextInput, UnstyledButton } from '@mantine/core';
import { useState } from 'react';
import type { Category, CategoryCreate } from '../../types/category';
import { EMOJI_OPTIONS, getCategoryEmoji } from '../../utils/categoryEmojis';
import { CATEGORY_COLORS } from '../../utils/constants';

interface CategoryFormProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryCreate) => void;
  loading?: boolean;
  initial?: Category;
}

export function CategoryForm({ opened, onClose, onSubmit, loading, initial }: CategoryFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [color, setColor] = useState(initial?.color ?? CATEGORY_COLORS[0]);
  const [emoji, setEmoji] = useState(initial ? getCategoryEmoji(initial) : EMOJI_OPTIONS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    onSubmit({ name, color, emoji });
  };

  return (
    <Modal opened={opened} onClose={onClose} title={initial ? 'Edit Category' : 'New Category'} centered>
      <form onSubmit={handleSubmit}>
        <Stack>
          <div>
            <Text size="sm" fw={500} mb="xs">Emoji</Text>
            <SimpleGrid cols={6} spacing="xs">
              {EMOJI_OPTIONS.map((e) => (
                <UnstyledButton
                  key={e}
                  onClick={() => setEmoji(e)}
                  style={{
                    padding: '6px',
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontSize: '1.4rem',
                    border: e === emoji ? '2px solid var(--mantine-color-coral-5)' : '2px solid transparent',
                    backgroundColor: e === emoji ? 'var(--mantine-color-coral-0)' : undefined,
                  }}
                >
                  {e}
                </UnstyledButton>
              ))}
            </SimpleGrid>
          </div>
          <TextInput label="Name" required value={name} onChange={(e) => setName(e.target.value)} />
          <div>
            <Text size="sm" fw={500} mb="xs">Color</Text>
            <SimpleGrid cols={6} spacing="xs">
              {CATEGORY_COLORS.map((c) => (
                <UnstyledButton key={c} onClick={() => setColor(c)}>
                  <ColorSwatch
                    color={c}
                    size={32}
                    style={{
                      cursor: 'pointer',
                      border: c === color ? '3px solid #2D3436' : '2px solid transparent',
                    }}
                  />
                </UnstyledButton>
              ))}
            </SimpleGrid>
          </div>
          <Button type="submit" loading={loading} color="coral">
            {initial ? 'Update' : 'Create'} Category
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
