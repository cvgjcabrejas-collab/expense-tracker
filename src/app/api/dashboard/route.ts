import { createClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

// GET dashboard stats
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    // Fetch all expenses for the year
    const { data: expenses, error: expenseError } = await supabase
      .from('expenses')
      .select('*, category:categories(*)')
      .eq('user_id', user.id)
      .gte('date', yearStart.toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (expenseError) {
      console.error('Error fetching expenses:', expenseError);
      return NextResponse.json(
        { error: expenseError.message },
        { status: 500 }
      );
    }

    // Calculate stats
    const todayTotal = (expenses || [])
      .filter(
        (e) =>
          new Date(e.date).toDateString() === today.toDateString()
      )
      .reduce((sum, e) => sum + parseFloat(e.amount), 0);

    const weekTotal = (expenses || [])
      .filter((e) => new Date(e.date) >= weekStart)
      .reduce((sum, e) => sum + parseFloat(e.amount), 0);

    const monthTotal = (expenses || [])
      .filter((e) => {
        const expDate = new Date(e.date);
        return (
          expDate.getFullYear() === now.getFullYear() &&
          expDate.getMonth() === now.getMonth()
        );
      })
      .reduce((sum, e) => sum + parseFloat(e.amount), 0);

    const yearTotal = (expenses || []).reduce(
      (sum, e) => sum + parseFloat(e.amount),
      0
    );

    // Find top category
    const categoryTotals: Record<string, { amount: number; name: string }> = {};
    (expenses || []).forEach((e) => {
      if (!categoryTotals[e.category_id]) {
        categoryTotals[e.category_id] = {
          amount: 0,
          name: e.category?.name || 'Unknown',
        };
      }
      categoryTotals[e.category_id].amount += parseFloat(e.amount);
    });

    const topCategoryId = Object.keys(categoryTotals).sort(
      (a, b) => categoryTotals[b].amount - categoryTotals[a].amount
    )[0];

    const topCategory = topCategoryId
      ? {
          id: topCategoryId,
          name: categoryTotals[topCategoryId].name,
          amount: categoryTotals[topCategoryId].amount,
          percentage:
            monthTotal > 0
              ? Math.round(
                  (categoryTotals[topCategoryId].amount / monthTotal) * 100
                )
              : 0,
        }
      : null;

    const stats = {
      todayTotal,
      weekTotal,
      monthTotal,
      yearTotal,
      transactionCount: expenses?.length || 0,
      topCategory,
      budgetProgress: Math.min(
        monthTotal > 0 ? (monthTotal / (monthTotal * 1.5)) * 100 : 0,
        100
      ),
      recentExpenses: (expenses || []).slice(0, 10),
    };

    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error calculating dashboard stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
