import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { verifyAuth } from '@/lib/jwt';

/**
 * @swagger
 * /api/summary:
 *   get:
 *     summary: Get financial summary for authenticated user
 *     tags: [Summary]
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export async function GET(request) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.valid) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = createAdminClient();

    // Get all transactions
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('amount, type, category_id')
      .eq('user_id', authResult.userId);

    if (transactionsError) {
      console.error('Database error:', transactionsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch summary' },
        { status: 500 }
      );
    }

    // Calculate totals
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const totalExpenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const balance = totalIncome - totalExpenses;

    // Get category breakdown for expenses
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name')
      .eq('user_id', authResult.userId)
      .eq('type', 'expense');

    if (categoriesError) {
      console.error('Database error:', categoriesError);
    }

    const categoryBreakdown = (categories || []).map((category) => {
      const categoryTransactions = transactions.filter(
        (t) => t.type === 'expense' && t.category_id === category.id
      );
      const total = categoryTransactions.reduce(
        (sum, t) => sum + parseFloat(t.amount),
        0
      );

      return {
        category_id: category.id,
        category_name: category.name,
        total,
      };
    }).filter((c) => c.total > 0);

    const summary = {
      balance,
      totalIncome,
      totalExpenses,
      categoryBreakdown,
    };

    return NextResponse.json(
      { success: true, data: summary },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get summary error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}