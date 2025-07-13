import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { FinancialTransaction, TransactionType } from "../types";
import { Product } from "../types";
import {
  expenseCategories,
  incomeCategories,
  purchaseCategories,
} from "../utils/constants";

export default function useTransactions() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    dayjs().format("YYYY-MM-DD")
  );
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<TransactionType>("expense");
  const [formData, setFormData] = useState<Partial<FinancialTransaction>>({
    date: selectedDate,
    type: "expense",
    amount: 0,
    category: "",
    description: "",
    party: "",
    invoiceNumber: "",
    isRecurring: false,
  });
  const [filterType, setFilterType] = useState<string>("all");

  // Fetch transactions
  useEffect(() => {
    if (isAuthorized) {
      fetchTransactions();
    }
  }, [selectedDate, isAuthorized, filterType]);

  // Fetch products
  useEffect(() => {
    if (isAuthorized) {
      fetch("/api/inventory")
        .then((res) => res.json())
        .then(setProducts);
    }
  }, [isAuthorized]);

  // Update form date when selectedDate changes
  useEffect(() => {
    setFormData((prev) => ({ ...prev, date: selectedDate }));
  }, [selectedDate]);

  const fetchTransactions = async () => {
    let url = `/api/finance/transactions?date=${selectedDate}`;
    if (filterType !== "all") {
      url += `&type=${filterType}`;
    }

    const res = await fetch(url);
    const data = await res.json();
    // التأكد أن البيانات هي مصفوفة قبل التعيين
    if (Array.isArray(data)) {
      setTransactions(data);
    } else {
      console.error('البيانات المستلمة ليست مصفوفة:', data);
      setTransactions([]);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else if (type === "number") {
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("ارسل بيانات المعاملة:", { 
      ...formData
    });
    try {

      const response = await fetch("/api/finance/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          type: modalType,
          date: selectedDate,
        }),
      });

      if (response.ok) {
        setFormData({
          date: selectedDate,
          type: modalType,
          amount: 0,
          category: "",
          description: "",
          party: "",
          invoiceNumber: "",
          isRecurring: false,
          ...(modalType === "purchase" ? { productId: "", quantity: 1 } : {}),
        });
        setShowModal(false);
        fetchTransactions();
      } else {
        const error = await response.json();
        alert(`خطأ: ${error.message}`);
      }
    } catch (error) {
      console.error("خطأ في إرسال النموذج:", error);
      alert("حدث خطأ أثناء معالجة الطلب");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه المعاملة؟")) return;

    try {
      const response = await fetch(`/api/finance/transactions?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchTransactions();
      } else {
        const error = await response.json();
        alert(`خطأ: ${error.message}`);
      }
    } catch (error) {
      console.error("خطأ في حذف المعاملة:", error);
      alert("حدث خطأ أثناء معالجة الطلب");
    }
  };

  const openModal = (type: TransactionType) => {
    setModalType(type);
    setFormData({
      date: selectedDate,
      type,
      amount: 0,
      category: "",
      description: "",
      party: "",
      invoiceNumber: "",
      isRecurring: false,
      ...(type === "purchase" ? { productId: "", quantity: 1 } : {}),
    });
    setShowModal(true);
  };

  const calculateTotals = () => {
    let totalExpenses = 0;
    let totalIncome = 0;
    let totalPurchases = 0;

    transactions.forEach((transaction) => {
      if (transaction.type === "expense") {
        totalExpenses += transaction.amount;
      } else if (transaction.type === "income") {
        totalIncome += transaction.amount;
      } else if (transaction.type === "purchase") {
        totalPurchases += transaction.amount;
      }
    });

    return { totalExpenses, totalIncome, totalPurchases };
  };

  const getCategories = (type: TransactionType) => {
    switch (type) {
      case "expense":
        return expenseCategories;
      case "income":
        return incomeCategories;
      case "purchase":
        return purchaseCategories;
      default:
        return [];
    }
  };

  return {
    isAuthorized,
    setIsAuthorized,
    transactions,
    products,
    selectedDate,
    setSelectedDate,
    showModal,
    setShowModal,
    modalType,
    formData,
    setFormData,
    filterType,
    setFilterType,
    handleInputChange,
    handleSubmit,
    handleDelete,
    openModal,
    calculateTotals,
    getCategories,
  };
}
