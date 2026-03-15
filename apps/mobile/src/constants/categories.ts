export interface Category {
  name: string
  emoji: string
  color: string
}

export const CATEGORIES: Category[] = [
  { name: 'Food Delivery',    emoji: '🛵', color: '#F97316' },
  { name: 'Food & Dining',    emoji: '🍽️', color: '#FB923C' },
  { name: 'Groceries',        emoji: '🥦', color: '#22C55E' },
  { name: 'Quick Commerce',   emoji: '⚡', color: '#EAB308' },
  { name: 'Transport',        emoji: '🚗', color: '#3B82F6' },
  { name: 'Travel',           emoji: '✈️', color: '#06B6D4' },
  { name: 'Shopping',         emoji: '🛒', color: '#A855F7' },
  { name: 'Fashion',          emoji: '👗', color: '#EC4899' },
  { name: 'Electronics',      emoji: '💻', color: '#6366F1' },
  { name: 'Entertainment',    emoji: '🎬', color: '#EF4444' },
  { name: 'Utilities',        emoji: '💡', color: '#14B8A6' },
  { name: 'Healthcare',       emoji: '🏥', color: '#10B981' },
  { name: 'Health & Fitness', emoji: '💪', color: '#84CC16' },
  { name: 'Education',        emoji: '📚', color: '#8B5CF6' },
  { name: 'Insurance',        emoji: '🛡️', color: '#64748B' },
  { name: 'Investment',       emoji: '📈', color: '#0EA5E9' },
  { name: 'Fuel',             emoji: '⛽', color: '#F59E0B' },
  { name: 'Personal Care',    emoji: '💄', color: '#F472B6' },
  { name: 'Rent',             emoji: '🏠', color: '#78716C' },
  { name: 'EMI/Loan',         emoji: '💳', color: '#DC2626' },
  { name: 'Transfer',         emoji: '💸', color: '#6B7280' },
  { name: 'Income',           emoji: '💰', color: '#10B981' },
  { name: 'ATM/Cash',         emoji: '🏧', color: '#9CA3AF' },
  { name: 'Other',            emoji: '📌', color: '#6B7280' },
]

export const getCategoryColor = (name: string): string =>
  CATEGORIES.find(c => c.name === name)?.color ?? '#6B7280'

export const getCategoryEmoji = (name: string): string =>
  CATEGORIES.find(c => c.name === name)?.emoji ?? '💸'
