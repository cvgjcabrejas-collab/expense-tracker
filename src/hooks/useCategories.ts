'use client';

import { useQuery } from '@tanstack/react-query';
import { Category } from '@/types';
import { supabase } from '@/lib/supabase';

export function useCategories(enabled = true) {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('order_index');

      if (error) throw new Error(error.message);
      return data as Category[];
    },
    enabled,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });
}

export function useAddCategory() {
  return {
    mutate: async (data: { name: string; color?: string; iconName?: string }) => {
      const { data: result, error } = await supabase
        .from('categories')
        .insert(data)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return result;
    },
  };
}
