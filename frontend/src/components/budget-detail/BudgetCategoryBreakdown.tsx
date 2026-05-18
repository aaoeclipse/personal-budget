import { Card, Group, Stack, Text } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { BudgetCategorySpending } from '../../types/budget';
import { formatCurrency } from '../../utils/formatCurrency';

interface BudgetCategoryBreakdownProps {
  data: BudgetCategorySpending[];
}

const FALLBACK_COLORS = ['#FF6B6B', '#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#00BCD4', '#E91E63', '#607D8B'];

export function BudgetCategoryBreakdown({ data }: BudgetCategoryBreakdownProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (!data || data.length === 0) return null;

  const validData = data
    .filter((d) => d.total > 0)
    .map((d, i) => ({
      name: `${d.category_emoji ?? ''} ${d.category_name}`.trim(),
      value: Number(d.total),
      color: d.category_color || FALLBACK_COLORS[i % FALLBACK_COLORS.length],
      percentage: Number(d.percentage),
    }));

  if (validData.length === 0) return null;

  const chartHeight = isMobile ? 200 : 220;
  const outerRadius = isMobile ? 80 : 90;
  const innerRadius = isMobile ? 45 : 55;

  return (
    <Card shadow="xs" padding="md" radius="md" withBorder h="100%">
      <Stack gap="xs" h="100%">
        <Text fw={600}>Spending by Category</Text>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <PieChart>
            <Pie
              data={validData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={2}
            >
              {validData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{ borderRadius: 8, fontSize: '0.85rem' }}
            />
          </PieChart>
        </ResponsiveContainer>
        <Stack gap={4}>
          {validData.map((entry, index) => (
            <Group key={index} justify="space-between" gap="xs">
              <Group gap="xs">
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: entry.color,
                    flexShrink: 0,
                  }}
                />
                <Text size="xs">{entry.name}</Text>
              </Group>
              <Text size="xs" c="dimmed">
                {formatCurrency(entry.value)} ({entry.percentage}%)
              </Text>
            </Group>
          ))}
        </Stack>
      </Stack>
    </Card>
  );
}
