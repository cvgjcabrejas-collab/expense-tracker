import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SummaryCardProps {
  label: string;
  value: string;
  icon?: ReactNode;
  className?: string;
  trend?: number;
}

export default function SummaryCard({
  label,
  value,
  icon,
  className,
  trend,
}: SummaryCardProps) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700',
        className
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
          {label}
        </span>
        {icon && <div className="text-2xl opacity-20">{icon}</div>}
      </div>

      <div className="flex items-end justify-between gap-2">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
          {value}
        </h3>
        {trend !== undefined && (
          <span
            className={cn('text-xs font-semibold px-2 py-1 rounded-full', {
              'bg-success/10 text-success': trend >= 0,
              'bg-danger/10 text-danger': trend < 0,
            })}
          >
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
    </div>
  );
}
