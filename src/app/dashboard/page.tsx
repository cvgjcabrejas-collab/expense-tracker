'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  useExpenses,
  useCategories,
  useDashboardStats,
  useAddExpense,
  useDeleteExpense,
} from '@/hooks';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import SummaryCard from '@/components/SummaryCard';
import BudgetProgress from '@/components/BudgetProgress';
import RecentExpenses from '@/components/RecentExpenses';
import QuickAddModal, { QuickAddFormData } from '@/components/QuickAddModal';
import SpendingChart from '@/components/SpendingChart';
import CategoryPieChart from '@/components/CategoryPieChart';
import Toast from '@/components/Toast';
import { formatCurrency } from '@/lib/utils';
import { Plus, Settings, LogOut } from 'lucide-react';

export default function DashboardPage() {
  const { user, signOut, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  // Data hooks
  const { data: stats, isLoading: statsLoading } = useDashboardStats(!!user);
  const { data: categories, isLoading: categoriesLoading } = useCategories(!!user);
  const { mutate: addExpense, isPending: isAddingExpense } = useAddExpense();
  const { mutate: deleteExpense } = useDeleteExpense();
  const { data: allExpenses } = useExpenses(undefined, !!user);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      setToast({ message: 'Failed to logout', type: 'error' });
    }
  };

  // Handle add expense
  const handleAddExpense = async (data: QuickAddFormData) => {
    if (!user) return;
    addExpense({ ...data, userId: user.id }, {
      onSuccess: () => {
        setIsModalOpen(false);
        setToast({ message: 'Expense added successfully', type: 'success' });
      },
      onError: () => {
        setToast({ message: 'Failed to add expense', type: 'error' });
      },
    });
  };

  // Handle delete expense
  const handleDeleteExpense = (id: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      deleteExpense(id, {
        onSuccess: () => {
          setToast({ message: 'Expense deleted', type: 'success' });
        },
        onError: () => {
          setToast({ message: 'Failed to delete expense', type: 'error' });
        },
      });
    }
  };

  // Prepare chart data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split('T')[0];
    const dayExpenses = allExpenses?.filter((e) => {
      const expenseDate = typeof e.date === 'string' ? e.date : new Date(e.date).toISOString().split('T')[0];
      return expenseDate === dateStr;
    }) || [];
    const amount = dayExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      amount,
    };
  });

  const categoryData =
    stats?.recentExpenses.reduce(
      (acc, expense) => {
        const existing = acc.find((c) => c.name === expense.category.name);
        if (existing) {
          existing.value += parseFloat(expense.amount);
        } else {
          acc.push({
            name: expense.category.name,
            value: parseFloat(expense.amount),
            color: expense.category.color,
          });
        }
        return acc;
      },
      [] as Array<{ name: string; value: number; color: string }>
    ) || [];

  if (authLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Expense Tracker
          </h1>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsModalOpen(true)}
              size="lg"
              className="gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Expense
            </Button>

            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
              <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>

            <button
              onClick={handleLogout}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <SummaryCard
            label="Today"
            value={stats ? formatCurrency(stats.todayTotal) : '$0.00'}
          />
          <SummaryCard
            label="This Week"
            value={stats ? formatCurrency(stats.weekTotal) : '$0.00'}
          />
          <SummaryCard
            label="This Month"
            value={stats ? formatCurrency(stats.monthTotal) : '$0.00'}
          />
          <SummaryCard
            label="This Year"
            value={stats ? formatCurrency(stats.yearTotal) : '$0.00'}
          />
        </div>

        {/* Budget Progress */}
        {stats && (
          <div className="mb-8">
            <BudgetProgress
              current={stats.monthTotal}
              limit={stats.monthTotal > 0 ? stats.monthTotal * 1.5 : 2000}
            />
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <SpendingChart data={last7Days} isLoading={statsLoading} />
          <CategoryPieChart data={categoryData} isLoading={statsLoading} />
        </div>

        {/* Recent Expenses */}
        <RecentExpenses
          expenses={stats?.recentExpenses || []}
          onDelete={handleDeleteExpense}
          isLoading={statsLoading}
        />
      </main>

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddExpense}
        categories={categories || []}
        isLoading={isAddingExpense}
      />

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Keyboard Shortcut for Quick Add */}
      <KeyboardShortcuts onOpenModal={() => setIsModalOpen(true)} />
    </div>
  );
}

function KeyboardShortcuts({ onOpenModal }: { onOpenModal: () => void }) {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to open quick add
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpenModal();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onOpenModal]);

  return null;
}
