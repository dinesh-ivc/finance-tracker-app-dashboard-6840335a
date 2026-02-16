'use client';

import { Progress } from '@/components/ui/progress';

export default function BudgetProgress({ budget }) {
  const spent = parseFloat(budget.spent || 0);
  const limit = parseFloat(budget.limit_amount || 0);
  const percentage = limit > 0 ? (spent / limit) * 100 : 0;
  const remaining = limit - spent;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getProgressColor = () => {
    if (percentage >= 100) return 'bg-red-600';
    if (percentage >= 80) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  const getStatusText = () => {
    if (percentage >= 100) return 'Over budget';
    if (percentage >= 80) return 'Near limit';
    return 'On track';
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">
          {formatCurrency(spent)} of {formatCurrency(limit)}
        </span>
        <span
          className={`font-medium ${
            percentage >= 100
              ? 'text-red-600'
              : percentage >= 80
              ? 'text-yellow-600'
              : 'text-green-600'
          }`}
        >
          {getStatusText()}
        </span>
      </div>
      <Progress value={Math.min(percentage, 100)} className={getProgressColor()} />
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">
          {remaining >= 0 ? 'Remaining' : 'Overspent'}
        </span>
        <span
          className={`font-medium ${
            remaining >= 0 ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {formatCurrency(Math.abs(remaining))}
        </span>
      </div>
    </div>
  );
}