// services/expenseCategoryService.ts
import { apiClient } from "@/utils/api-client";
import { ExpenseCategory, expenseCategorySchema } from "@/lib/schemas-v3";

export const expenseCategoryService = {
  async getAll(): Promise<ExpenseCategory[]> {
    return apiClient.get<ExpenseCategory[]>("/api/v3/expense-categories");
  },

  async getById(id: string): Promise<ExpenseCategory> {
    return apiClient.get<ExpenseCategory>(`/api/v3/expense-categories/${id}`);
  },

  async create(data: Omit<ExpenseCategory, "id">): Promise<ExpenseCategory> {
    const validated = expenseCategorySchema.parse(data);
    return apiClient.post<ExpenseCategory>("/api/v3/expense-categories", validated);
  },

  async update(id: string, data: Partial<ExpenseCategory>): Promise<ExpenseCategory> {
    const validated = expenseCategorySchema.partial().parse(data);
    return apiClient.patch<ExpenseCategory>(`/api/v3/expense-categories/${id}`, validated);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/api/v3/expense-categories/${id}`);
  },
};
