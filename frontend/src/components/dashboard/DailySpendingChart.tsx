import { Card, Text } from '@mantine/core';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { DailySpending } from '../../types/api';
import { formatCurrency } from '../../utils/formatCurrency';

interface DailySpendingChartProps {
  data: DailySpending[];
}

export function DailySpendingChart({ data }: DailySpendingChartProps) {
  if (!data || data.length === 0) return null;

  const chartData = data.map((d) => ({
    date: d.date,
    total: Number(d.total),
    label: new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  return (
    <Card shadow="xs" padding="md" radius="md" withBorder>
      <Text fw={600} mb="sm">
        Daily Spending (30 days)
      </Text>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FF6B6B" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#FF6B6B" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11 }}
            interval="preserveStartEnd"
            tickMargin={4}
          />
          <YAxis
            tick={{ fontSize: 11 }}
            tickFormatter={(v: number) => `$${v}`}
            width={50}
          />
          <Tooltip
            formatter={(value: number) => [formatCurrency(value), 'Spent']}
            labelStyle={{ fontWeight: 600 }}
            contentStyle={{ borderRadius: 8, fontSize: '0.85rem' }}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke="#FF6B6B"
            strokeWidth={2}
            fill="url(#spendingGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
