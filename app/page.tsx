"use client";

import { useState, useEffect } from "react";
import { ListTodo } from "lucide-react";
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-center gap-2 mb-8">
          <ListTodo className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-gray-900">قائمة المهام</h1>
        </div>
      </div>
    </div>
  );
}
