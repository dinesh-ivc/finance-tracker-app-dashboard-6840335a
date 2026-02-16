import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/Sidebar';
import AppBar from '@/components/AppBar';
import BalanceSummary from '@/components/dashboard/BalanceSummary';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import SpendingChart from '@/components/dashboard/SpendingChart';
import QuickAddTransaction from '@/components/dashboard/QuickAddTransaction';

export default async function DashboardPage() {
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
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Overview of your financial activities</p>
            </div>

            <BalanceSummary userId={user.id} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SpendingChart userId={user.id} />
              <QuickAddTransaction userId={user.id} />
            </div>

            <RecentTransactions userId={user.id} />
          </div>
        </main>
      </div>
    </div>
  );
}