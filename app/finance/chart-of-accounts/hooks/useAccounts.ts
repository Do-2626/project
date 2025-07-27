"use client"

import { useState, useEffect, useCallback } from 'react';
import { Account, AccountFormValues } from '../types';

export const useAccounts = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/finance/chart-of-accounts');
      if (!response.ok) throw new Error('Failed to fetch accounts');
      const data = await response.json();
      setAccounts(data);
    } catch (err) {
      setError((err as any).message || 'Error fetching accounts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const createAccount = async (accountData: AccountFormValues) => {
    try {
      const response = await fetch('/api/finance/chart-of-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accountData),
      });
      if (!response.ok) throw new Error('Failed to create account');
      await fetchAccounts();
      return true;
    } catch (err) {
      setError((err as any).message || 'Error creating account');
      return false;
    }
  };

  const updateAccount = async (id: string, accountData: Partial<Account>) => {
    try {
      const response = await fetch('/api/finance/chart-of-accounts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: id, ...accountData }),
      });
      if (!response.ok) throw new Error('Failed to update account');
      await fetchAccounts();
      return true;
    } catch (err) {
      setError((err as any).message || 'Error updating account');
      return false;
    }
  };

  const deleteAccount = async (id: string) => {
    try {
      const response = await fetch('/api/finance/chart-of-accounts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) throw new Error('Failed to delete account');
      await fetchAccounts();
      return true;
    } catch (err) {
      setError((err as any).message || 'Error deleting account');
      return false;
    }
  };

  return {
    accounts,
    loading,
    error,
    fetchAccounts,
    createAccount,
    updateAccount,
    deleteAccount
  };
};
