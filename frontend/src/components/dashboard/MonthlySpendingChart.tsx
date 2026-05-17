import { Card, Stack, Text } from '@mantine/core';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { BudgetDetail } from '../../types/budget';
import { formatCurrency } from '../../utils/formatCurrency';

interface BudgetComparisonChartProps {
  budgets: BudgetDetail[];
}

export function BudgetComparisonChart({ budgets }: BudgetComparisonChartProps) {
  if (!budgets || budgets.length === 0) return null;

  const chartData = budgets.map((b) => ({
    name: b.name.length > 12 ? b.name.slice(0, 12) + '…' : b.name,
    Budget: Number(b.amount),
    Spent: Number(b.total_spent),
  }));

  return (
    <Card shadow="xs" padding="md" radius="md" withBorder>
      <Stack gap="sm">
        <Text fw={600}>Budget vs Spent</Text>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Legend />
            <Bar dataKey="Budget" fill="#4CAF50" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Spent" fill="#FF6B6B" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Stack>
    </Card>
  );
}
