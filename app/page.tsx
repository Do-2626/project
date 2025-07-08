"use client";

import { useState, useEffect } from "react";
import { Package, Receipt, BarChart3 } from "lucide-react";
import Link from "next/link";
// import { TodoItem } from "@/components/ui/todo-item";

interface Todo {
  _id: string;
  title: string;
  completed: boolean;
  description: string;
}

export default function Home() {
  // const [todos, setTodos] = useState<Todo[]>([]);
  // const [newTodo, setNewTodo] = useState("");
  // const [newDescription, setNewDescription] = useState("");
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);

  // useEffect(() => {
  //   fetchTodos();
  // }, []);

  // async function fetchTodos() {
  //   try {
  //     const response = await fetch("/api/todos");
  //     if (!response.ok) {
  //       throw new Error("Failed to fetch todos");
  //     }
  //     const data = await response.json();
  //     // Ensure data is an array
  //     setTodos(Array.isArray(data) ? data : []);
  //   } catch (error) {
  //     console.error("Failed to fetch todos:", error);
  //     setError("Failed to load todos");
  //     setTodos([]); // Ensure todos is always an array
  //   } finally {
  //     setLoading(false);
  //   }
  // }

  // async function addTodo(e: React.FormEvent) {
  //   e.preventDefault();
  //   if (!newTodo.trim()) return;

  //   try {
  //     const response = await fetch("/api/todos", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         title: newTodo.trim(),
  //         description: newDescription.trim(),
  //       }),
  //     });
  //     if (!response.ok) {
  //       throw new Error("Failed to add todo");
  //     }
  //     const todo = await response.json();
  //     setTodos((prev) => [todo, ...prev]);
  //     setNewTodo("");
  //     setNewDescription("");
  //   } catch (error) {
  //     console.error("Failed to add todo:", error);
  //     setError("Failed to add todo");
  //   }
  // }

  // async function toggleTodo(id: string, completed: boolean) {
  //   try {
  //     const response = await fetch(`/api/todos/${id}`, {
  //       method: "PUT",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ completed }),
  //     });
  //     if (!response.ok) {
  //       throw new Error("Failed to update todo");
  //     }
  //     const updatedTodo = await response.json();
  //     setTodos((prev) =>
  //       prev.map((todo) => (todo._id === id ? { ...todo, completed } : todo))
  //     );
  //   } catch (error) {
  //     console.error("Failed to toggle todo:", error);
  //     setError("Failed to update todo");
  //   }
  // }

  // async function deleteTodo(id: string) {
  //   try {
  //     const response = await fetch(`/api/todos/${id}`, { method: "DELETE" });
  //     if (!response.ok) {
  //       throw new Error("Failed to delete todo");
  //     }
  //     setTodos((prev) => prev.filter((todo) => todo._id !== id));
  //   } catch (error) {
  //     console.error("Failed to delete todo:", error);
  //     setError("Failed to delete todo");
  //   }
  // }

  // async function updateDescription(id: string, description: string) {
  //   try {
  //     const response = await fetch(`/api/todos/${id}`, {
  //       method: "PATCH",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ description }),
  //     });
  //     if (!response.ok) {
  //       throw new Error("Failed to update description");
  //     }
  //     setTodos((prev) =>
  //       prev.map((todo) => (todo._id === id ? { ...todo, description } : todo))
  //     );
  //   } catch (error) {
  //     console.error("Failed to update description:", error);
  //     setError("Failed to update description");
  //   }
  // }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-center gap-2 mb-8">
          <h1 className="text-3xl font-bold text-white">نظام إدارة المخزون</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <Link href="/inventory" className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center text-center">
            <Package className="h-12 w-12 text-white mb-4" />
            <h2 className="text-xl font-bold text-white">المخزون</h2>
            <p className="text-blue-100 mt-2">إدارة المنتجات والمخزون</p>
          </Link>
          
          <Link href="/transactions" className="bg-gradient-to-br from-green-600 to-green-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center text-center">
            <Receipt className="h-12 w-12 text-white mb-4" />
            <h2 className="text-xl font-bold text-white">المعاملات</h2>
            <p className="text-green-100 mt-2">تسجيل وعرض المعاملات</p>
          </Link>
          
          <Link href="/finance/income-statement" className="bg-gradient-to-br from-purple-600 to-purple-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center text-center">
            <BarChart3 className="h-12 w-12 text-white mb-4" />
            <h2 className="text-xl font-bold text-white">قائمة الدخل</h2>
            <p className="text-purple-100 mt-2">عرض تقارير الإيرادات والمصروفات</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
