import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/Sidebar';
import AppBar from '@/components/AppBar';
import BudgetList from '@/components/budgets/BudgetList';

export default async function BudgetsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppBar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Budgets</h1>
              <p className="text-gray-600 mt-1">Set and track your monthly spending limits</p>
            </div>

            <BudgetList userId={user.id} />
          </div>
        </main>
      </div>
    </div>
  );
}