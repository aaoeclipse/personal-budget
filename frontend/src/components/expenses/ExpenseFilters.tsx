import { ActionIcon, Collapse, Group, NumberInput, Select, SimpleGrid, Stack, TextInput } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { IconFilter, IconSearch } from '@tabler/icons-react';
import type { Category } from '../../types/category';
import type { Budget } from '../../types/budget';

interface ExpenseFiltersProps {
  categories: Category[];
  budgets: Budget[];
  categoryId: string | null;
  budgetId: string | null;
  startDate: Date | null;
  endDate: Date | null;
  search: string;
  minAmount: string;
  maxAmount: string;
  onCategoryChange: (v: string | null) => void;
  onBudgetChange: (v: string | null) => void;
  onStartDateChange: (v: Date | null) => void;
  onEndDateChange: (v: Date | null) => void;
  onSearchChange: (v: string) => void;
  onMinAmountChange: (v: string) => void;
  onMaxAmountChange: (v: string) => void;
}

export function ExpenseFilterBar({
  categories,
  budgets,
  categoryId,
  budgetId,
  startDate,
  endDate,
  search,
  minAmount,
  maxAmount,
  onCategoryChange,
  onBudgetChange,
  onStartDateChange,
  onEndDateChange,
  onSearchChange,
  onMinAmountChange,
  onMaxAmountChange,
}: ExpenseFiltersProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [filtersOpen, { toggle }] = useDisclosure(false);

  const hasActiveFilters = !!(categoryId || budgetId || startDate || endDate || minAmount || maxAmount);

  const filterFields = (
    <Stack gap="xs">
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs">
        <Select
          placeholder="All categories"
          data={categories.map((c) => ({ value: c.id, label: c.name }))}
          value={categoryId}
          onChange={onCategoryChange}
          clearable
          size="sm"
        />
        <Select
          placeholder="All budgets"
          data={budgets.map((b) => ({ value: b.id, label: b.name }))}
          value={budgetId}
          onChange={onBudgetChange}
          clearable
          size="sm"
        />
      </SimpleGrid>
      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="xs">
        <DateInput
          placeholder="From"
          value={startDate}
          onChange={onStartDateChange}
          clearable
          size="sm"
        />
        <DateInput
          placeholder="To"
          value={endDate}
          onChange={onEndDateChange}
          clearable
          size="sm"
        />
        <NumberInput
          placeholder="Min $"
          value={minAmount === '' ? '' : Number(minAmount)}
          onChange={(v) => onMinAmountChange(v === '' ? '' : String(v))}
          min={0}
          decimalScale={2}
          size="sm"
          prefix="$"
        />
        <NumberInput
          placeholder="Max $"
          value={maxAmount === '' ? '' : Number(maxAmount)}
          onChange={(v) => onMaxAmountChange(v === '' ? '' : String(v))}
          min={0}
          decimalScale={2}
          size="sm"
          prefix="$"
        />
      </SimpleGrid>
    </Stack>
  );

  return (
    <Stack gap="xs" mb="md">
      <Group gap="xs">
        <TextInput
          placeholder="Search expenses..."
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => onSearchChange(e.currentTarget.value)}
          size="sm"
          style={{ flex: 1 }}
        />
        {isMobile && (
          <ActionIcon
            variant={hasActiveFilters ? 'filled' : 'light'}
            color={hasActiveFilters ? 'coral' : 'gray'}
            size="lg"
            onClick={toggle}
          >
            <IconFilter size={18} />
          </ActionIcon>
        )}
      </Group>
      {isMobile ? (
        <Collapse in={filtersOpen}>
          {filterFields}
        </Collapse>
      ) : (
        filterFields
      )}
    </Stack>
  );
}
