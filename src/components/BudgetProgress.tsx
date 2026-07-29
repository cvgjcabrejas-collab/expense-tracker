import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';

interface BudgetProgressProps {
  current: number;
  limit: number;
  currency?: string;
}

export default function BudgetProgress({
  current,
  limit,
  currency = 'USD',
}: BudgetProgressProps) {
  const percentage = Math.min((current / limit) * 100, 100);
  const isWarning = percentage >= 75;
  const isExceeded = percentage >= 100;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Monthly Budget
        </h3>
        <span
          className={cn('text-sm font-semibold px-3 py-1 rounded-full', {
            'bg-success/10 text-success': percentage < 50,
            'bg-warning/10 text-warning': percentage >= 50 && percentage < 100,
            'bg-danger/10 text-danger': percentage >= 100,
          })}
        >
          {Math.round(percentage)}%
        </span>
      </div>

      <div className="mb-4">
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
          <div
            className={cn('h-full transition-all duration-300 rounded-full', {
              'bg-success': percentage < 50,
              'bg-warning': percentage >= 50 && percentage < 100,
              'bg-danger': percentage >= 100,
            })}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-600 dark:text-slate-400">
          {formatCurrency(current, currency)} spent
        </span>
        <span className="text-slate-600 dark:text-slate-400">
          {formatCurrency(limit, currency)} limit
        </span>
      </div>
    </div>
  );
}
