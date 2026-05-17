import { Anchor, Button, Card, Center, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch {
      notifications.show({ title: 'Error', message: 'Invalid email or password', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center mih="100vh" style={{ backgroundColor: 'var(--mantine-color-body)' }}>
      <Card shadow="md" radius="lg" p="xl" w={400} withBorder>
        <Stack>
          <Title order={2} ta="center" c="coral">
            Mama Budget
          </Title>
          <Text c="dimmed" ta="center" size="sm">
            Sign in to manage your budget
          </Text>
          <form onSubmit={handleSubmit}>
            <Stack>
              <TextInput
                label="Email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <PasswordInput
                label="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button type="submit" loading={loading} color="coral" fullWidth>
                Sign In
              </Button>
            </Stack>
          </form>
          <Text ta="center" size="sm">
            Don&apos;t have an account?{' '}
            <Anchor onClick={() => navigate('/signup')} c="coral">
              Sign Up
            </Anchor>
          </Text>
        </Stack>
      </Card>
    </Center>
  );
}
