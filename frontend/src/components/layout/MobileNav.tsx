import { Group, UnstyledButton, Text, Stack } from '@mantine/core';
import {
  IconCategory,
  IconDashboard,
  IconReceipt,
  IconWallet,
} from '@tabler/icons-react';
import { useLocation, useNavigate } from 'react-router';

const links = [
  { label: 'Home', icon: IconDashboard, path: '/' },
  { label: 'Budgets', icon: IconWallet, path: '/budgets' },
  { label: 'Expenses', icon: IconReceipt, path: '/expenses' },
  { label: 'Categories', icon: IconCategory, path: '/categories' },
];

export function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Group grow h="100%" px="xs">
      {links.map((link) => {
        const isActive = location.pathname === link.path;
        return (
          <UnstyledButton key={link.path} onClick={() => navigate(link.path)} py="xs">
            <Stack align="center" gap={2}>
              <link.icon size={20} color={isActive ? '#FF6B6B' : '#868e96'} />
              <Text size="xs" c={isActive ? 'coral' : 'dimmed'} fw={isActive ? 600 : 400}>
                {link.label}
              </Text>
            </Stack>
          </UnstyledButton>
        );
      })}
    </Group>
  );
}
