'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ExpenseWithCategory, ExpenseFilters } from '@/types';
import { supabase } from '@/lib/supabase';

export function useExpenses(filters?: ExpenseFilters, enabled = true) {
  return useQuery({
    queryKey: ['expenses', filters],
    queryFn: async () => {
      let query = supabase
        .from('expenses')
        .select('*, category:categories(*)');

      if (filters?.startDate) {
        query = query.gte('date', filters.startDate.toISOString().split('T')[0]);
      }
      if (filters?.endDate) {
        query = query.lte('date', filters.endDate.toISOString().split('T')[0]);
      }

      const { data, error } = await query.order('date', { ascending: false });

      if (error) throw new Error(error.message);
      return data as ExpenseWithCategory[];
    },
    enabled,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
  });
}

export function useAddExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      amount: number;
      categoryId: string;
      description: string;
      date: Date;
      notes?: string;
      userId: string;
    }) => {
      const { data: result, error } = await supabase
        .from('expenses')
        .insert({
          user_id: data.userId,
          amount: data.amount,
          category_id: data.categoryId,
          description: data.description,
          date: data.date.toISOString().split('T')[0],
          notes: data.notes,
        })
        .select('*, category:categories(*)')
        .single();

      if (error) throw new Error(error.message);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });
}
