import { ActionIcon, useComputedColorScheme, useMantineColorScheme } from '@mantine/core';
import { IconMoon, IconSun } from '@tabler/icons-react';

export function ColorSchemeToggle() {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light');

  return (
    <ActionIcon
      variant="subtle"
      color="gray"
      size="lg"
      onClick={() => setColorScheme(computedColorScheme === 'dark' ? 'light' : 'dark')}
      title={computedColorScheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {computedColorScheme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
    </ActionIcon>
  );
}
