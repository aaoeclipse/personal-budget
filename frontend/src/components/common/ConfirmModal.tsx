import { Button, Group, Modal, Text } from '@mantine/core';

interface ConfirmModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  loading?: boolean;
}

export function ConfirmModal({ opened, onClose, onConfirm, title, message, loading }: ConfirmModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title={title} centered size="sm">
      <Text size="sm" mb="lg">
        {message}
      </Text>
      <Group justify="flex-end">
        <Button variant="default" onClick={onClose}>
          Cancel
        </Button>
        <Button color="red" onClick={onConfirm} loading={loading}>
          Delete
        </Button>
      </Group>
    </Modal>
  );
}
