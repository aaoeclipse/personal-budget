import { Button, Modal, NumberInput, Stack, TextInput } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useState } from 'react';
import type { Budget, BudgetCreate } from '../../types/budget';

interface BudgetFormProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (data: BudgetCreate) => void;
  loading?: boolean;
  initial?: Budget;
}

export function BudgetForm({ opened, onClose, onSubmit, loading, initial }: BudgetFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [amount, setAmount] = useState<number | string>(initial?.amount ?? '');
  const [startDate, setStartDate] = useState<Date | null>(
    initial?.start_date ? new Date(initial.start_date + 'T00:00:00') : null
  );
  const [endDate, setEndDate] = useState<Date | null>(
    initial?.end_date ? new Date(initial.end_date + 'T00:00:00') : null
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || !startDate || !endDate) return;
    onSubmit({
      name,
      amount: Number(amount),
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
    });
  };

  return (
    <Modal opened={opened} onClose={onClose} title={initial ? 'Edit Budget' : 'New Budget'} centered>
      <form onSubmit={handleSubmit}>
        <Stack>
          <TextInput label="Name" required value={name} onChange={(e) => setName(e.target.value)} />
          <NumberInput
            label="Amount"
            required
            min={0}
            decimalScale={2}
            prefix="$"
            value={amount}
            onChange={setAmount}
          />
          <DateInput
            label="Start Date"
            required
            value={startDate}
            onChange={setStartDate}
          />
          <DateInput
            label="End Date"
            required
            value={endDate}
            onChange={setEndDate}
          />
          <Button type="submit" loading={loading} color="coral">
            {initial ? 'Update' : 'Create'} Budget
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
