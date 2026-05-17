import { Button, Center, Stack, Text, Title } from '@mantine/core';
import { useNavigate } from 'react-router';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Center mih="80vh">
      <Stack align="center" gap="md">
        <Title order={1} size={80} c="coral">
          404
        </Title>
        <Text size="lg" c="dimmed">
          Oops! This page doesn&apos;t exist.
        </Text>
        <Button color="coral" onClick={() => navigate('/')}>
          Go to Dashboard
        </Button>
      </Stack>
    </Center>
  );
}
