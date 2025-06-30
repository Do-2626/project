"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Todo } from "@/lib/models/todo";

interface TodoItemProps {
  todo: {
    _id: string;
    title: string;
    description: string;
    completed: boolean;
  };
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onUpdateDescription: (id: string, description: string) => void;
}

export function TodoItem({
  todo,
  onToggle,
  onDelete,
  onUpdateDescription,
}: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(todo.description);

  const handleDescriptionSubmit = () => {
    onUpdateDescription(todo._id, description);
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col gap-2 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={(e) => onToggle(todo._id, e.target.checked)}
            className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span
            className={`${todo.completed ? "line-through text-gray-500" : ""}`}
          >
            {todo.title}
          </span>
        </div>
        <button
          onClick={() => onDelete(todo._id)}
          className="text-red-500 hover:text-red-700 transition-colors"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-2 pr-8">
        {isEditing ? (
          <div className="flex gap-2">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm min-h-[60px]"
              dir="rtl"
            />
            <div className="flex flex-col gap-1">
              <button
                onClick={handleDescriptionSubmit}
                className="px-2 py-1 text-sm bg-primary text-white rounded"
              >
                حفظ
              </button>
              <button
                onClick={() => {
                  setDescription(todo.description);
                  setIsEditing(false);
                }}
                className="px-2 py-1 text-sm border border-gray-300 rounded"
              >
                إلغاء
              </button>
            </div>
          </div>
        ) : (
          <div
            className="text-sm text-gray-500 cursor-pointer hover:bg-gray-50 p-2 rounded break-words whitespace-pre-line w-full"
            onClick={() => setIsEditing(true)}
            style={{ wordBreak: "break-word" }}
          >
            {description || "أضف وصفاً..."}
          </div>
        )}
      </div>
    </div>
  );
}
