import { Badge, Card, Group, Stack, Text } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { IconArrowDown, IconArrowUp } from '@tabler/icons-react';
import { dashboardApi } from '../../api/dashboard';
import { formatCurrency } from '../../utils/formatCurrency';

export function MonthlySpendingChart() {
  const { data, isLoading } = useQuery({
    queryKey: ['monthly-spending'],
    queryFn: () => dashboardApi.getMonthlySpending(6),
  });

  if (isLoading || !data || data.months.length === 0) return null;

  const chartData = data.months.map((m) => ({
    ...m,
    label: new Date(m.month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
  }));

  const latest = data.months[data.months.length - 1];

  return (
    <Card shadow="xs" padding="md" radius="md" withBorder>
      <Stack gap="sm">
        <Group justify="space-between">
          <Text fw={600}>Monthly Spending</Text>
          {latest.change_pct !== null && (
            <Badge
              color={latest.change_pct > 0 ? 'red' : 'green'}
              variant="light"
              leftSection={latest.change_pct > 0 ? <IconArrowUp size={12} /> : <IconArrowDown size={12} />}
            >
              {Math.abs(latest.change_pct)}% vs last month
            </Badge>
          )}
        </Group>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} labelFormatter={(l) => `Month: ${l}`} />
            <Bar dataKey="total" fill="#ff6464" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Stack>
    </Card>
  );
}
