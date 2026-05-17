import { Group, NavLink, Stack, Text, UnstyledButton } from '@mantine/core';
import {
  IconCategory,
  IconDashboard,
  IconLogout,
  IconReceipt,
  IconWallet,
} from '@tabler/icons-react';
import { useLocation, useNavigate } from 'react-router';
import { useAuth } from '../../hooks/useAuth';
import { ColorSchemeToggle } from './ColorSchemeToggle';

const links = [
  { label: 'Dashboard', icon: IconDashboard, path: '/' },
  { label: 'Budgets', icon: IconWallet, path: '/budgets' },
  { label: 'Expenses', icon: IconReceipt, path: '/expenses' },
  { label: 'Categories', icon: IconCategory, path: '/categories' },
];

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <Stack justify="space-between" h="100%">
      <div>
        <Text fw={800} size="xl" c="coral" mb="lg" px="md" pt="md">
          Personal Budget
        </Text>
        {links.map((link) => (
          <NavLink
            key={link.path}
            label={link.label}
            leftSection={<link.icon size={20} />}
            active={location.pathname === link.path}
            onClick={() => navigate(link.path)}
            color="coral"
            style={{ borderRadius: 8 }}
            mb={4}
          />
        ))}
      </div>
      <Stack gap="xs" px="md" pb="md">
        <Group justify="space-between">
          <Text size="sm" c="dimmed" truncate>
            {user?.name}
          </Text>
          <ColorSchemeToggle />
        </Group>
        <UnstyledButton
          onClick={() => {
            logout();
            navigate('/login');
          }}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <IconLogout size={18} />
          <Text size="sm">Sign out</Text>
        </UnstyledButton>
      </Stack>
    </Stack>
  );
}
