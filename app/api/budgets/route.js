import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { verifyAuth } from '@/lib/jwt';

/**
 * @swagger
 * /api/budgets:
 *   get:
 *     summary: Get all budgets for authenticated user
 *     tags: [Budgets]
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
    const { data: budgets, error } = await supabase
      .from('budgets')
      .select(
        `
        *,
        categories:category_id (
          id,
          name,
          type
        )
      `
      )
      .eq('user_id', authResult.userId)
      .order('month', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch budgets' },
        { status: 500 }
      );
    }

    // Calculate spent amount for each budget
    const budgetsWithSpent = await Promise.all(
      budgets.map(async (budget) => {
        const { data: transactions } = await supabase
          .from('transactions')
          .select('amount')
          .eq('user_id', authResult.userId)
          .eq('category_id', budget.category_id)
          .eq('type', 'expense')
          .gte('date', `${budget.month}-01`)
          .lte('date', `${budget.month}-31`);

        const spent = transactions?.reduce(
          (sum, t) => sum + parseFloat(t.amount),
          0
        ) || 0;

        return {
          id: budget.id,
          category_id: budget.category_id,
          category_name: budget.categories?.name || 'Unknown',
          limit_amount: budget.limit_amount,
          month: budget.month,
          spent,
          created_at: budget.created_at,
        };
      })
    );

    return NextResponse.json(
      { success: true, data: budgetsWithSpent },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get budgets error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/budgets:
 *   post:
 *     summary: Create or update a budget
 *     tags: [Budgets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category_id
 *               - limit_amount
 *               - month
 *             properties:
 *               category_id:
 *                 type: string
 *               limit_amount:
 *                 type: number
 *               month:
 *                 type: string
 *     responses:
 *       201:
 *         description: Budget created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.valid) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { category_id, limit_amount, month } = await request.json();

    // Validate input
    if (!category_id || !limit_amount || !month) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (limit_amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Budget limit must be positive' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Verify category belongs to user and is expense type
    const { data: category } = await supabase
      .from('categories')
      .select('id, type')
      .eq('id', category_id)
      .eq('user_id', authResult.userId)
      .single();

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 400 }
      );
    }

    if (category.type !== 'expense') {
      return NextResponse.json(
        { success: false, error: 'Budgets can only be set for expense categories' },
        { status: 400 }
      );
    }

    // Check if budget already exists for this category and month
    const { data: existingBudget } = await supabase
      .from('budgets')
      .select('id')
      .eq('user_id', authResult.userId)
      .eq('category_id', category_id)
      .eq('month', month)
      .single();

    let budget;
    let error;

    if (existingBudget) {
      // Update existing budget
      const result = await supabase
        .from('budgets')
        .update({ limit_amount })
        .eq('id', existingBudget.id)
        .select()
        .single();
      
      budget = result.data;
      error = result.error;
    } else {
      // Create new budget
      const result = await supabase
        .from('budgets')
        .insert({
          user_id: authResult.userId,
          category_id,
          limit_amount,
          month,
        })
        .select()
        .single();
      
      budget = result.data;
      error = result.error;
    }

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to save budget' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data: budget, message: 'Budget saved successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create budget error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}