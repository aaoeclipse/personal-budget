import { Center, Loader } from '@mantine/core';

export function LoadingSpinner() {
  return (
    <Center h="60vh">
      <Loader color="coral" size="lg" />
    </Center>
  );
}
