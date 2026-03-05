"use client"

import { useState, useEffect } from 'react';
import { Transaction, NotificationState } from '@/app/inventory/types';

export const useDailyLog = (initialTransactions: Transaction[]) => {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formError, setFormError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);

  // إضافة تأثير للإشعارات
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleUpdate = async (updatedTransaction: Transaction) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/transactions/${updatedTransaction._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedTransaction),
        }
      );
      if (!response.ok) {
        throw new Error("فشل في التحديث");
      }
      setTransactions((prev) =>
        prev.map((t) =>
          t._id === updatedTransaction._id ? updatedTransaction : t
        )
      );
      setShowEditModal(false);
      setNotification({ type: "success", message: "تم تحديث البيانات بنجاح" });
    } catch (error) {
      setFormError("فشل في تحديث البيانات");
      setNotification({ type: "error", message: "حدث خطأ أثناء التحديث" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const password = prompt("أدخل كلمة المرور:");
    if (!password) {
      alert("يجب إدخال كلمة مرور");
      return;
    }
    if (password !== "mo123") {
      alert("كلمة المرور غير صحيحة");
      return;
    }
    setIsLoading(true);
    try {
      await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      });
      setTransactions((prev) => prev.filter((item) => item._id !== id));
      setNotification({ type: "success", message: "تم حذف العنصر بنجاح" });
    } catch (error) {
      setNotification({ type: "error", message: "فشل في حذف العنصر" });
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowEditModal(true);
  };

  return {
    transactions,
    selectedTransaction,
    showEditModal,
    formError,
    isLoading,
    notification,
    handleUpdate,
    handleDelete,
    openEditModal,
    setShowEditModal,
  };
};