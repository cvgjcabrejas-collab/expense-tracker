import { ExpenseWithCategory } from '@/types';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import { Trash2, Edit2 } from 'lucide-react';

interface RecentExpensesProps {
  expenses: ExpenseWithCategory[];
  onEdit?: (expense: ExpenseWithCategory) => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
}

export default function RecentExpenses({
  expenses,
  onEdit,
  onDelete,
  isLoading,
}: RecentExpensesProps) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">
          Recent Expenses
        </h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 text-center">
        <p className="text-slate-600 dark:text-slate-400">No expenses yet. Add one to get started!</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Recent Expenses
        </h3>
      </div>

      <div className="divide-y divide-slate-200 dark:divide-slate-700">
        {expenses.map((expense) => (
          <div
            key={expense.id}
            className="px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center justify-between gap-4 group"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: expense.category.color }}
                />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {expense.category.name}
                </span>
              </div>
              <p className="text-slate-900 dark:text-white font-medium">
                {expense.description}
              </p>
              <span className="text-xs text-slate-500 dark:text-slate-500">
                {formatRelativeTime(expense.createdAt)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-slate-900 dark:text-white text-right min-w-20">
                {formatCurrency(expense.amount)}
              </span>

              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {onEdit && (
                  <button
                    onClick={() => onEdit(expense)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(expense.id)}
                    className="p-2 hover:bg-danger/10 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-danger" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
