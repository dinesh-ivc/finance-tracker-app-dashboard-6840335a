export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password) {
  if (!password || password.length < 6) {
    return {
      valid: false,
      error: 'Password must be at least 6 characters long',
    };
  }
  return { valid: true };
}

export function validateTransaction(data) {
  const { amount, type, category_id, description, date } = data;

  if (!amount || amount <= 0) {
    return { valid: false, error: 'Amount must be a positive number' };
  }

  if (amount > 999999.99) {
    return { valid: false, error: 'Amount is too large' };
  }

  // Check max 2 decimal places
  if (!/^\d+(\.\d{1,2})?$/.test(amount.toString())) {
    return { valid: false, error: 'Amount can have at most 2 decimal places' };
  }

  if (!type || !['income', 'expense'].includes(type)) {
    return { valid: false, error: 'Invalid transaction type' };
  }

  if (!category_id) {
    return { valid: false, error: 'Category is required' };
  }

  if (!description || !description.trim()) {
    return { valid: false, error: 'Description is required' };
  }

  if (!date) {
    return { valid: false, error: 'Date is required' };
  }

  // Check date is not in the future
  const transactionDate = new Date(date);
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  if (transactionDate > today) {
    return { valid: false, error: 'Transaction date cannot be in the future' };
  }

  return { valid: true };
}

export function validateBudget(data) {
  const { category_id, limit_amount, month } = data;

  if (!category_id) {
    return { valid: false, error: 'Category is required' };
  }

  if (!limit_amount || limit_amount <= 0) {
    return { valid: false, error: 'Budget limit must be a positive number' };
  }

  if (!month) {
    return { valid: false, error: 'Month is required' };
  }

  // Validate month format (YYYY-MM)
  if (!/^\d{4}-\d{2}$/.test(month)) {
    return { valid: false, error: 'Invalid month format (expected YYYY-MM)' };
  }

  return { valid: true };
}

export function validateCategory(data) {
  const { name, type } = data;

  if (!name || !name.trim()) {
    return { valid: false, error: 'Category name is required' };
  }

  if (name.length > 50) {
    return { valid: false, error: 'Category name is too long (max 50 characters)' };
  }

  if (!type || !['income', 'expense'].includes(type)) {
    return { valid: false, error: 'Invalid category type' };
  }

  return { valid: true };
}