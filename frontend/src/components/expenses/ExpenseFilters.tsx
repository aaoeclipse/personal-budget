import { Group, NumberInput, Select, Stack, TextInput } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconSearch } from '@tabler/icons-react';
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
  return (
    <Stack gap="sm" mb="md">
      <TextInput
        placeholder="Search expenses..."
        leftSection={<IconSearch size={16} />}
        value={search}
        onChange={(e) => onSearchChange(e.currentTarget.value)}
        size="sm"
      />
      <Group grow wrap="wrap">
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
      </Group>
      <Group grow wrap="wrap">
        <NumberInput
          placeholder="Min amount"
          value={minAmount === '' ? '' : Number(minAmount)}
          onChange={(v) => onMinAmountChange(v === '' ? '' : String(v))}
          min={0}
          decimalScale={2}
          size="sm"
          prefix="$"
        />
        <NumberInput
          placeholder="Max amount"
          value={maxAmount === '' ? '' : Number(maxAmount)}
          onChange={(v) => onMaxAmountChange(v === '' ? '' : String(v))}
          min={0}
          decimalScale={2}
          size="sm"
          prefix="$"
        />
      </Group>
    </Stack>
  );
}
