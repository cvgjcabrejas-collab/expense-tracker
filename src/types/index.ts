// User
export interface User {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Expense
export interface Expense {
  id: string;
  userId: string;
  amount: number;
  categoryId: string;
  description: string;
  date: Date;
  time: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseWithCategory extends Expense {
  category: Category;
}

// Category
export interface Category {
  id: string;
  userId: string;
  name: string;
  color: string;
  iconName: string;
  isDefault: boolean;
  orderIndex: number;
  createdAt: Date;
}

// Budget
export interface Budget {
  id: string;
  userId: string;
  categoryId: string | null;
  period: 'weekly' | 'monthly';
  limitAmount: number;
  monthYear: string | null;
  weekStart: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Settings
export interface Settings {
  id: string;
  userId: string;
  currency: string;
  theme: 'light' | 'dark';
  dateFormat: string;
  notificationsEnabled: boolean;
  budgetAlertThreshold: number;
  createdAt: Date;
  updatedAt: Date;
}

// Dashboard Stats
export interface DashboardStats {
  todayTotal: number;
  weekTotal: number;
  monthTotal: number;
  yearTotal: number;
  transactionCount: number;
  topCategory: {
    id: string;
    name: string;
    amount: number;
    percentage: number;
  } | null;
  budgetProgress: number;
  recentExpenses: ExpenseWithCategory[];
}

// API Response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Filter Types
export interface ExpenseFilters {
  startDate?: Date;
  endDate?: Date;
  categoryIds?: string[];
  minAmount?: number;
  maxAmount?: number;
  searchQuery?: string;
}
