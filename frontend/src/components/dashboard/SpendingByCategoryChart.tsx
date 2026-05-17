import { Card, Group, Stack, Text } from '@mantine/core';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { SpendingByCategory } from '../../types/api';
import { formatCurrency } from '../../utils/formatCurrency';

interface SpendingByCategoryChartProps {
  data: SpendingByCategory[];
}

const FALLBACK_COLORS = ['#FF6B6B', '#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#00BCD4', '#E91E63', '#607D8B'];

export function SpendingByCategoryChart({ data }: SpendingByCategoryChartProps) {
  if (!data || data.length === 0) return null;

  // Filter out invalid entries and ensure all fields are present
  const validData = data
    .filter((d) => d.category_name && d.total > 0)
    .map((d, i) => ({
      name: d.category_name,
      value: Number(d.total),
      color: d.category_color || FALLBACK_COLORS[i % FALLBACK_COLORS.length],
    }));

  if (validData.length === 0) return null;

  const total = validData.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card shadow="xs" padding="md" radius="md" withBorder>
      <Text fw={600} mb="sm">
        Spending by Category
      </Text>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={validData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={80}
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
      {/* Legend below */}
      <Stack gap={4} mt="xs">
        {validData.map((entry, index) => {
          const pct = total > 0 ? Math.round((entry.value / total) * 100) : 0;
          return (
            <Group key={index} justify="space-between" gap="xs">
              <Group gap="xs">
                <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: entry.color, flexShrink: 0 }} />
                <Text size="xs">{entry.name}</Text>
              </Group>
              <Text size="xs" c="dimmed">{formatCurrency(entry.value)} ({pct}%)</Text>
            </Group>
          );
        })}
      </Stack>
    </Card>
  );
}
