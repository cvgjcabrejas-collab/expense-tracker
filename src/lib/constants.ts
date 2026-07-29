// Default categories seeded on user signup
export const DEFAULT_CATEGORIES = [
  { name: 'Food', color: '#F59E0B', iconName: 'utensils' },
  { name: 'Coffee', color: '#78350F', iconName: 'coffee' },
  { name: 'Groceries', color: '#16A34A', iconName: 'shopping-cart' },
  { name: 'Transportation', color: '#3B82F6', iconName: 'car' },
  { name: 'Gas', color: '#EF4444', iconName: 'fuel' },
  { name: 'Shopping', color: '#EC4899', iconName: 'shopping-bag' },
  { name: 'Bills', color: '#6366F1', iconName: 'receipt' },
  { name: 'Subscriptions', color: '#8B5CF6', iconName: 'repeat' },
  { name: 'Entertainment', color: '#D946EF', iconName: 'music' },
  { name: 'Health', color: '#F43F5E', iconName: 'heart' },
  { name: 'Business', color: '#14B8A6', iconName: 'briefcase' },
  { name: 'Family', color: '#06B6D4', iconName: 'users' },
  { name: 'Travel', color: '#0EA5E9', iconName: 'plane' },
  { name: 'Education', color: '#6366F1', iconName: 'book' },
  { name: 'Savings', color: '#10B981', iconName: 'piggy-bank' },
  { name: 'Investment', color: '#F59E0B', iconName: 'trending-up' },
  { name: 'Gifts', color: '#EC4899', iconName: 'gift' },
  { name: 'Miscellaneous', color: '#6B7280', iconName: 'tag' },
];

// Date range options for filtering
export const DATE_RANGE_OPTIONS = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'This Week', value: 'week' },
  { label: 'Last Week', value: 'lastWeek' },
  { label: 'This Month', value: 'month' },
  { label: 'Last Month', value: 'lastMonth' },
  { label: 'This Year', value: 'year' },
  { label: 'Custom', value: 'custom' },
];

// Budget alert thresholds
export const BUDGET_ALERT_THRESHOLDS = [50, 75, 90, 100];
