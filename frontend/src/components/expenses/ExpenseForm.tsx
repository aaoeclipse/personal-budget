import {
  ActionIcon,
  Box,
  Button,
  Drawer,
  Group,
  Modal,
  NumberInput,
  Progress,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Tooltip,
  UnstyledButton,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useMediaQuery } from '@mantine/hooks';
import { IconCalendar, IconNote, IconWallet } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { budgetsApi } from '../../api/budgets';
import type { Budget } from '../../types/budget';
import type { Category } from '../../types/category';
import type { Expense, ExpenseCreate } from '../../types/expense';
import { formatCurrency } from '../../utils/formatCurrency';
import { getCategoryEmoji } from '../../utils/categoryEmojis';

interface BudgetRemainingInfoProps {
  budgetDetail: { amount: number; total_spent: number; remaining: number; name: string };
  currentAmount: number;
}

function BudgetRemainingInfo({ budgetDetail, currentAmount }: BudgetRemainingInfoProps) {
  const remainingAfter = budgetDetail.remaining - currentAmount;
  const pctUsed = budgetDetail.amount > 0
    ? ((budgetDetail.total_spent + currentAmount) / budgetDetail.amount) * 100
    : 0;
  const color = pctUsed >= 100 ? 'red' : pctUsed >= 75 ? 'yellow' : 'teal';

  return (
    <Stack gap={4} p="xs" style={{ borderRadius: 8, border: '1px solid var(--mantine-color-gray-3)' }}>
      <Group justify="space-between">
        <Text size="xs" c="dimmed">Budget: {budgetDetail.name}</Text>
        <Text size="xs" fw={600} c={remainingAfter < 0 ? 'red' : 'teal'}>
          {remainingAfter < 0 ? '-' : ''}{formatCurrency(Math.abs(remainingAfter))} {remainingAfter < 0 ? 'over' : 'left'}
        </Text>
      </Group>
      <Progress value={Math.min(pctUsed, 100)} color={color} size="sm" radius="xl" />
      <Group justify="space-between">
        <Text size="xs" c="dimmed">
          {formatCurrency(budgetDetail.total_spent + currentAmount)} of {formatCurrency(budgetDetail.amount)}
        </Text>
        <Text size="xs" c="dimmed">
          {Math.round(pctUsed)}%
        </Text>
      </Group>
    </Stack>
  );
}

interface ExpenseFormProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (data: ExpenseCreate) => void;
  loading?: boolean;
  initial?: Expense;
  categories: Category[];
  budgets: Budget[];
}

export function ExpenseForm({ opened, onClose, onSubmit, loading, initial, categories, budgets }: ExpenseFormProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isEditing = !!initial;

  const [step, setStep] = useState(isEditing ? 3 : 1);
  const [amount, setAmount] = useState<number | string>(initial?.amount ?? '');
  const [categoryId, setCategoryId] = useState<string | null>(initial?.category_id ?? null);
  const [description, setDescription] = useState(initial?.description ?? '');
  const [budgetId, setBudgetId] = useState<string | null>(initial?.budget_id ?? null);
  const [date, setDate] = useState<Date | null>(
    initial?.date ? new Date(initial.date + 'T00:00:00') : new Date()
  );

  // Fetch budget details when a budget is selected
  const { data: budgetDetail } = useQuery({
    queryKey: ['budgets', budgetId],
    queryFn: () => budgetsApi.get(budgetId!),
    enabled: !!budgetId,
  });

  // Optional field visibility toggles
  const [showDescription, setShowDescription] = useState(isEditing && !!initial?.description);
  const [showDate, setShowDate] = useState(isEditing);
  const [showBudget, setShowBudget] = useState(isEditing && !!initial?.budget_id);

  const handleSubmit = () => {
    if (!amount || !categoryId || !date) return;
    onSubmit({
      description: description || undefined,
      amount: Number(amount),
      category_id: categoryId,
      budget_id: budgetId || undefined,
      date: date.toISOString().split('T')[0],
    });
  };

  const handleAmountNext = () => {
    if (!amount) return;
    setStep(2);
  };

  const handleCategorySelect = (id: string) => {
    setCategoryId(id);
    setStep(3);
  };

  const resetForm = () => {
    setStep(isEditing ? 3 : 1);
    if (!isEditing) {
      setAmount('');
      setCategoryId(null);
      setDescription('');
      setBudgetId(null);
      setDate(new Date());
      setShowDescription(false);
      setShowDate(false);
      setShowBudget(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const content = (
    <Stack gap="lg" p="md">
      {/* Edit mode: show everything at once */}
      {isEditing ? (
        <>
          <NumberInput
            label="Amount"
            required
            min={0}
            decimalScale={2}
            prefix="$"
            size="lg"
            value={amount}
            onChange={setAmount}
            styles={{ input: { fontSize: '1.5rem', textAlign: 'center' } }}
          />
          <div>
            <Text size="sm" fw={500} mb="xs">Category</Text>
            <SimpleGrid cols={3} spacing="xs">
              {categories.map((cat) => (
                <UnstyledButton
                  key={cat.id}
                  onClick={() => setCategoryId(cat.id)}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    border: categoryId === cat.id
                      ? `2px solid ${cat.color}`
                      : '2px solid var(--mantine-color-gray-3)',
                    textAlign: 'center',
                    backgroundColor: categoryId === cat.id ? `${cat.color}15` : undefined,
                  }}
                >
                  <Text size="lg">{getCategoryEmoji(cat)}</Text>
                  <Text size="xs" truncate>{cat.name}</Text>
                </UnstyledButton>
              ))}
            </SimpleGrid>
          </div>
          <TextInput
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
          />
          <DateInput label="Date" required value={date} onChange={setDate} />
          <Select
            label="Budget (optional)"
            data={budgets.map((b) => ({ value: b.id, label: b.name }))}
            value={budgetId}
            onChange={setBudgetId}
            clearable
            searchable
          />
          {budgetDetail && budgetId && (
            <BudgetRemainingInfo
              budgetDetail={budgetDetail}
              currentAmount={Number(amount) || 0}
            />
          )}
          <Button onClick={handleSubmit} loading={loading} color="coral" size="md">
            Update Expense
          </Button>
        </>
      ) : (
        <>
          {/* Step 1: Amount */}
          {step === 1 && (
            <Stack align="center" gap="xl" pt="lg">
              <Text size="sm" c="dimmed" fw={500}>How much?</Text>
              <NumberInput
                min={0}
                decimalScale={2}
                prefix="$"
                size="xl"
                value={amount}
                onChange={setAmount}
                placeholder="0.00"
                styles={{
                  input: { fontSize: '2rem', textAlign: 'center', border: 'none', borderBottom: '2px solid var(--mantine-color-coral-5)' },
                }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAmountNext(); }}
                autoFocus
              />
              <Button
                onClick={handleAmountNext}
                color="coral"
                size="md"
                w={200}
                disabled={!amount}
              >
                Next
              </Button>
            </Stack>
          )}

          {/* Step 2: Category Selection */}
          {step === 2 && (
            <Stack gap="md">
              <Group justify="space-between" align="center">
                <Text size="sm" c="dimmed" fw={500}>Pick a category</Text>
                <Text size="lg" fw={700} c="coral">${Number(amount).toFixed(2)}</Text>
              </Group>
              <SimpleGrid cols={3} spacing="xs">
                {categories.map((cat) => (
                  <UnstyledButton
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.id)}
                    style={{
                      padding: '12px 8px',
                      borderRadius: '12px',
                      border: categoryId === cat.id
                        ? `2px solid ${cat.color}`
                        : '2px solid var(--mantine-color-gray-3)',
                      textAlign: 'center',
                      transition: 'all 0.15s ease',
                      backgroundColor: categoryId === cat.id ? `${cat.color}15` : undefined,
                    }}
                  >
                    <Text size="xl">{getCategoryEmoji(cat)}</Text>
                    <Text size="xs" truncate mt={4}>{cat.name}</Text>
                  </UnstyledButton>
                ))}
              </SimpleGrid>
              <Button variant="subtle" color="gray" size="xs" onClick={() => setStep(1)}>
                ← Back
              </Button>
            </Stack>
          )}

          {/* Step 3: Optional Details */}
          {step === 3 && (
            <Stack gap="md">
              <Group justify="space-between" align="center">
                <Group gap="xs">
                  {categoryId && (
                    <Text size="lg">
                      {getCategoryEmoji(categories.find(c => c.id === categoryId)!)}
                    </Text>
                  )}
                  <Text size="sm" fw={500}>
                    {categories.find(c => c.id === categoryId)?.name}
                  </Text>
                </Group>
                <Text size="lg" fw={700} c="coral">${Number(amount).toFixed(2)}</Text>
              </Group>

              {/* Icon toggle row */}
              <Group gap="xs" justify="center">
                <Tooltip label="Add description">
                  <ActionIcon
                    variant={showDescription ? 'filled' : 'light'}
                    color={showDescription ? 'coral' : 'gray'}
                    size="lg"
                    radius="xl"
                    onClick={() => setShowDescription(!showDescription)}
                  >
                    <IconNote size={18} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Change date">
                  <ActionIcon
                    variant={showDate ? 'filled' : 'light'}
                    color={showDate ? 'coral' : 'gray'}
                    size="lg"
                    radius="xl"
                    onClick={() => setShowDate(!showDate)}
                  >
                    <IconCalendar size={18} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Assign budget">
                  <ActionIcon
                    variant={showBudget ? 'filled' : 'light'}
                    color={showBudget ? 'coral' : 'gray'}
                    size="lg"
                    radius="xl"
                    onClick={() => setShowBudget(!showBudget)}
                  >
                    <IconWallet size={18} />
                  </ActionIcon>
                </Tooltip>
              </Group>

              {/* Revealed fields */}
              {showDescription && (
                <TextInput
                  placeholder="What was this for?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  autoFocus
                />
              )}
              {showDate && (
                <DateInput value={date} onChange={setDate} />
              )}
              {showBudget && (
                <>
                  <Select
                    placeholder="Select budget"
                    data={budgets.map((b) => ({ value: b.id, label: b.name }))}
                    value={budgetId}
                    onChange={setBudgetId}
                    clearable
                    searchable
                  />
                  {budgetDetail && budgetId && (
                    <BudgetRemainingInfo
                      budgetDetail={budgetDetail}
                      currentAmount={Number(amount) || 0}
                    />
                  )}
                </>
              )}

              <Button
                onClick={handleSubmit}
                loading={loading}
                color="coral"
                size="md"
                fullWidth
              >
                Add Expense
              </Button>
              <Button variant="subtle" color="gray" size="xs" onClick={() => setStep(2)}>
                ← Back
              </Button>
            </Stack>
          )}
        </>
      )}
    </Stack>
  );

  if (isMobile) {
    return (
      <Drawer
        opened={opened}
        onClose={handleClose}
        position="bottom"
        size="85%"
        title={isEditing ? 'Edit Expense' : 'Quick Add'}
        styles={{ content: { borderTopLeftRadius: 16, borderTopRightRadius: 16 } }}
      >
        {content}
      </Drawer>
    );
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={isEditing ? 'Edit Expense' : 'Quick Add'}
      centered
      size={440}
    >
      <Box mih={300}>
        {content}
      </Box>
    </Modal>
  );
}
