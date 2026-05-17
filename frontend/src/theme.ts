import { createTheme, type MantineColorsTuple } from '@mantine/core';

const coral: MantineColorsTuple = [
  '#ffe8e8',
  '#ffcfcf',
  '#ff9b9b',
  '#ff6464',
  '#ff3636',
  '#ff1818',
  '#ff0707',
  '#e40000',
  '#cb0000',
  '#af0000',
];

const teal: MantineColorsTuple = [
  '#e6fcf9',
  '#d3f5f0',
  '#a7ebe0',
  '#78e0cf',
  '#52d7c1',
  '#39d1b8',
  '#27ceb3',
  '#14b69c',
  '#00a28b',
  '#008d78',
];

export const theme = createTheme({
  primaryColor: 'coral',
  colors: {
    coral,
    teal,
    dark: [
      '#C1C2C5',
      '#A6A7AB',
      '#909296',
      '#5C5F66',
      '#373A40',
      '#2C2E33',
      '#25262B',
      '#1A1B1E',
      '#141517',
      '#101113',
    ],
  },
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  defaultRadius: 'md',
  headings: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    fontWeight: '700',
  },
  other: {
    bodyBackgroundLight: '#FFF9F0',
  },
});
