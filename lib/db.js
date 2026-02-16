import { createAdminClient } from '@/lib/supabase/server';

export async function getUser(userId) {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('users')
      .select('id, email, role, created_at')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Get user error:', error);
    return { success: false, error: error.message };
  }
}

export async function getUserCategories(userId, type = null) {
  try {
    const supabase = createAdminClient();
    let query = supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId);

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query.order('name', { ascending: true });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Get categories error:', error);
    return { success: false, error: error.message };
  }
}

export async function getUserTransactions(userId, filters = {}) {
  try {
    const supabase = createAdminClient();
    let query = supabase
      .from('transactions')
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
      .eq('user_id', userId);

    if (filters.type) {
      query = query.eq('type', filters.type);
    }

    if (filters.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }

    if (filters.startDate) {
      query = query.gte('date', filters.startDate);
    }

    if (filters.endDate) {
      query = query.lte('date', filters.endDate);
    }

    const { data, error } = await query.order('date', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Get transactions error:', error);
    return { success: false, error: error.message };
  }
}

export async function getUserBudgets(userId, month = null) {
  try {
    const supabase = createAdminClient();
    let query = supabase
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
      .eq('user_id', userId);

    if (month) {
      query = query.eq('month', month);
    }

    const { data, error } = await query.order('month', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Get budgets error:', error);
    return { success: false, error: error.message };
  }
}

export async function calculateBalance(userId) {
  try {
    const supabase = createAdminClient();
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('amount, type')
      .eq('user_id', userId);

    if (error) throw error;

    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const expenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    return {
      success: true,
      data: {
        income,
        expenses,
        balance: income - expenses,
      },
    };
  } catch (error) {
    console.error('Calculate balance error:', error);
    return { success: false, error: error.message };
  }
}

export async function getCategorySpending(userId, categoryId, month) {
  try {
    const supabase = createAdminClient();
    const startDate = `${month}-01`;
    const endDate = `${month}-31`;

    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('category_id', categoryId)
      .eq('type', 'expense')
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) throw error;

    const total = transactions.reduce(
      (sum, t) => sum + parseFloat(t.amount),
      0
    );

    return { success: true, data: { total } };
  } catch (error) {
    console.error('Get category spending error:', error);
    return { success: false, error: error.message };
  }
}