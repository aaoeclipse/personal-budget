import type { Category } from '../types/category';

const CATEGORY_EMOJI_MAP: Record<string, string> = {
  food: '🍕',
  groceries: '🛒',
  transport: '🚗',
  transportation: '🚗',
  entertainment: '🎬',
  shopping: '🛍️',
  health: '💊',
  healthcare: '💊',
  bills: '💡',
  utilities: '💡',
  education: '📚',
  travel: '✈️',
  coffee: '☕',
  rent: '🏠',
  housing: '🏠',
  gym: '💪',
  fitness: '💪',
  clothing: '👕',
  clothes: '👕',
  gifts: '🎁',
  pets: '🐾',
  subscriptions: '📱',
  internet: '🌐',
  phone: '📱',
  dining: '🍽️',
  restaurant: '🍽️',
  gas: '⛽',
  fuel: '⛽',
  insurance: '🛡️',
  savings: '🏦',
  other: '📦',
};

const DEFAULT_EMOJI = '📦';

export function getCategoryEmoji(category: Category): string {
  if (category.emoji) return category.emoji;

  const nameLower = category.name.toLowerCase();

  // Direct match
  if (CATEGORY_EMOJI_MAP[nameLower]) {
    return CATEGORY_EMOJI_MAP[nameLower];
  }

  // Partial match - check if category name contains any key
  for (const [key, emoji] of Object.entries(CATEGORY_EMOJI_MAP)) {
    if (nameLower.includes(key) || key.includes(nameLower)) {
      return emoji;
    }
  }

  return DEFAULT_EMOJI;
}

export const EMOJI_OPTIONS = [
  '🍕', '🛒', '🚗', '🎬', '🛍️', '💊',
  '💡', '📚', '✈️', '☕', '🏠', '💪',
  '👕', '🎁', '🐾', '📱', '🍽️', '⛽',
  '🛡️', '🏦', '🌐', '💰', '🎮', '🎵',
  '📦', '🧹', '💄', '🍺', '🎂', '🏋️',
];
