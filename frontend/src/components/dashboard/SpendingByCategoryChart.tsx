import { Card, Group, Stack, Text } from '@mantine/core';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { Props as LegendProps } from 'recharts/types/component/DefaultLegendContent';
import type { SpendingByCategory } from '../../types/api';
import { formatCurrency } from '../../utils/formatCurrency';

interface SpendingByCategoryChartProps {
  data: SpendingByCategory[];
}

function renderLegendContent(props: LegendProps) {
  const { payload } = props;
  if (!payload) return null;

  return (
    <Stack gap={4} align="center">
      {payload.map((entry, index) => (
        <Group key={index} gap="xs">
          <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: entry.color || '#ccc' }} />
          <Text size="xs">{String(entry.value)}</Text>
        </Group>
      ))}
    </Stack>
  );
}

export function SpendingByCategoryChart({ data }: SpendingByCategoryChartProps) {
  if (data.length === 0) return null;

  return (
    <Card shadow="xs" padding="md" radius="md" withBorder>
      <Text fw={600} mb="sm">
        Spending by Category
      </Text>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            dataKey="total"
            nameKey="category_name"
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={90}
            paddingAngle={3}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.category_color} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
          <Legend content={renderLegendContent} />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}
