"use client";
import AccountForm from './components/AccountForm';

import AccountTree from './components/AccountTree';
import { useAccounts } from './hooks/useAccounts';

export default function ChartOfAccountsPage() {
  const { accounts, loading, error, createAccount, updateAccount, deleteAccount } = useAccounts();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">إدارة شجرة الحسابات</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Account Tree Section */}
          <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">شجرة الحسابات</h2>
            {loading ? (
              <p>جاري تحميل البيانات...</p>
            ) : error ? (
              <p className="text-red-400">{error}</p>
            ) : (
              <AccountTree 
                accounts={accounts} 
                onDelete={deleteAccount}
              />
            )}
          </div>

          {/* Account Form Section */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">إضافة/تعديل حساب</h2>
            <AccountForm 
              onSubmit={createAccount} 
              accounts={accounts}
            />
          </div>
        </div>
      </div>
    </div>
  );
}