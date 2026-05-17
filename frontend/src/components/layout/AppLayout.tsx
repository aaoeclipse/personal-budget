import { AppShell } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { Outlet } from 'react-router';
import { FloatingAddButton } from '../common/FloatingAddButton';
import { MobileNav } from './MobileNav';
import { Navbar } from './Navbar';

export function AppLayout() {
  const [opened] = useDisclosure();
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <AppShell
      navbar={
        isMobile
          ? undefined
          : { width: 240, breakpoint: 'sm', collapsed: { mobile: !opened } }
      }
      footer={isMobile ? { height: 60 } : undefined}
      padding="md"
      styles={{
        main: {
          backgroundColor: 'var(--mantine-color-body)',
          minHeight: '100vh',
        },
      }}
    >
      {!isMobile && (
        <AppShell.Navbar p="xs">
          <Navbar />
        </AppShell.Navbar>
      )}

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>

      <FloatingAddButton />

      {isMobile && (
        <AppShell.Footer>
          <MobileNav />
        </AppShell.Footer>
      )}
    </AppShell>
  );
}
