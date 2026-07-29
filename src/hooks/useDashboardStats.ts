'use client';

import { useQuery } from '@tanstack/react-query';
import { DashboardStats } from '@/types';
import { supabase } from '@/lib/supabase';

export function useDashboardStats(enabled = true) {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());

      const { data: expenses, error } = await supabase
        .from('expenses')
        .select('*, category:categories(*)')
        .gte('date', today.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (error) throw new Error(error.message);

      const allExpenses = expenses || [];

      // Calculate stats
      const todayTotal = allExpenses
        .filter((e) => new Date(e.date).toDateString() === today.toDateString())
        .reduce((sum, e) => sum + parseFloat(e.amount), 0);

      const weekTotal = allExpenses
        .filter((e) => new Date(e.date) >= weekStart)
        .reduce((sum, e) => sum + parseFloat(e.amount), 0);

      const monthTotal = allExpenses
        .filter((e) => {
          const expDate = new Date(e.date);
          return (
            expDate.getFullYear() === now.getFullYear() &&
            expDate.getMonth() === now.getMonth()
          );
        })
        .reduce((sum, e) => sum + parseFloat(e.amount), 0);

      const yearTotal = allExpenses
        .filter((e) => new Date(e.date).getFullYear() === now.getFullYear())
        .reduce((sum, e) => sum + parseFloat(e.amount), 0);

      const stats: DashboardStats = {
        todayTotal,
        weekTotal,
        monthTotal,
        yearTotal,
        transactionCount: allExpenses.length,
        topCategory: null,
        budgetProgress: monthTotal > 0 ? (monthTotal / (monthTotal * 1.5)) * 100 : 0,
        recentExpenses: allExpenses.slice(0, 10),
      };

      return stats;
    },
    enabled,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}
