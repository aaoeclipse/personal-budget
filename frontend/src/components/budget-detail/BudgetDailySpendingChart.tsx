import { Card, Text } from '@mantine/core';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { BudgetDailySpending } from '../../types/budget';
import { formatCurrency } from '../../utils/formatCurrency';

interface BudgetDailySpendingChartProps {
  data: BudgetDailySpending[];
  dailyAllowance: number;
  startDate: string;
  endDate: string;
}

function fillMissingDates(
  data: BudgetDailySpending[],
  startDate: string,
  endDate: string,
): { date: string; total: number; label: string }[] {
  const map = new Map(data.map((d) => [d.date, Number(d.total)]));
  const result: { date: string; total: number; label: string }[] = [];
  const current = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  while (current <= end && current <= today) {
    const iso = current.toISOString().split('T')[0];
    result.push({
      date: iso,
      total: map.get(iso) ?? 0,
      label: current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    });
    current.setDate(current.getDate() + 1);
  }
  return result;
}

export function BudgetDailySpendingChart({ data, dailyAllowance, startDate, endDate }: BudgetDailySpendingChartProps) {
  const chartData = fillMissingDates(data, startDate, endDate);

  if (chartData.length === 0) return null;

  return (
    <Card shadow="xs" padding="md" radius="md" withBorder>
      <Text fw={600} mb="sm">
        Daily Spending
      </Text>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="budgetSpendingGradient" x1="0" y1="0" x2="0" y2="1">
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
          {dailyAllowance > 0 && (
            <ReferenceLine
              y={dailyAllowance}
              stroke="#20C997"
              strokeDasharray="6 4"
              strokeWidth={2}
              label={{
                value: `Allowance: ${formatCurrency(dailyAllowance)}`,
                position: 'insideTopRight',
                fontSize: 11,
                fill: '#20C997',
              }}
            />
          )}
          <Area
            type="monotone"
            dataKey="total"
            stroke="#FF6B6B"
            strokeWidth={2}
            fill="url(#budgetSpendingGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
