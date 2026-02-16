'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function BudgetForm({ open, onOpenChange, budget, onSuccess }) {
  const [limitAmount, setLimitAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [month, setMonth] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (budget) {
      setLimitAmount(budget.limit_amount?.toString() || '');
      setCategoryId(budget.category_id || '');
      setMonth(budget.month || '');
    } else {
      setLimitAmount('');
      setCategoryId('');
      const currentMonth = new Date().toISOString().slice(0, 7);
      setMonth(currentMonth);
    }
  }, [budget]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          const expenseCategories = (data.data || []).filter(
            (cat) => cat.type === 'expense'
          );
          setCategories(expenseCategories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    if (open) {
      fetchCategories();
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      limit_amount: parseFloat(limitAmount),
      category_id: categoryId,
      month,
    };

    try {
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to save budget');
        setLoading(false);
        return;
      }

      toast.success('Budget saved successfully!');
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving budget:', error);
      toast.error('An error occurred');
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{budget ? 'Edit Budget' : 'Add Budget'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="month">Month</Label>
            <Input
              id="month"
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="limitAmount">Budget Limit</Label>
            <Input
              id="limitAmount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={limitAmount}
              onChange={(e) => setLimitAmount(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#6432f5] hover:bg-[#5229d4]"
              disabled={loading}
            >
              {loading ? 'Saving...' : budget ? 'Update' : 'Add'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}