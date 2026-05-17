import { Anchor, Button, Card, Center, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';

export function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      notifications.show({ title: 'Error', message: 'Passwords do not match', color: 'red' });
      return;
    }
    setLoading(true);
    try {
      await signup(name, email, password);
      navigate('/');
    } catch {
      notifications.show({ title: 'Error', message: 'Could not create account', color: 'red' });
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
            Create your account
          </Text>
          <form onSubmit={handleSubmit}>
            <Stack>
              <TextInput label="Name" required value={name} onChange={(e) => setName(e.target.value)} />
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
              <PasswordInput
                label="Confirm Password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
              <Button type="submit" loading={loading} color="coral" fullWidth>
                Sign Up
              </Button>
            </Stack>
          </form>
          <Text ta="center" size="sm">
            Already have an account?{' '}
            <Anchor onClick={() => navigate('/login')} c="coral">
              Sign In
            </Anchor>
          </Text>
        </Stack>
      </Card>
    </Center>
  );
}
