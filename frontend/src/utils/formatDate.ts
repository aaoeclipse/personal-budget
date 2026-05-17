import dayjs from 'dayjs';

export function formatDate(date: string): string {
  return dayjs(date).format('MMM D, YYYY');
}

export function toISODate(date: Date): string {
  return dayjs(date).format('YYYY-MM-DD');
}
