import { create } from 'zustand';

interface TransactionState {
  transactions: any[];
  loading: boolean;
  error: string | null;
  fetchTransactions: () => Promise<void>;
  addTransaction: (transaction: any) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
}

export const useTransactionStore = create<TransactionState>((set) => ({
  transactions: [],
  loading: false,
  error: null,

  fetchTransactions: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/finance/transactions');
      const data = await response.json();
      set({ transactions: data, loading: false });
    } catch (error) {
      set({ error: 'فشل في جلب البيانات', loading: false });
    }
  },

  addTransaction: async (transaction) => {
    set({ loading: true });
    try {
      const response = await fetch('/api/finance/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction),
      });
      const newTransaction = await response.json();
      set((state) => ({
        transactions: [...state.transactions, newTransaction],
        loading: false,
      }));
    } catch (error) {
      set({ error: 'فشل في إضافة معاملة', loading: false });
    }
  },

  deleteTransaction: async (id) => {
    set({ loading: true });
    try {
      await fetch(`/api/finance/transactions?id=${id}`, { method: 'DELETE' });
      set((state) => ({
        transactions: state.transactions.filter(t => t._id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: 'فشل في حذف المعاملة', loading: false });
    }
  },
}));