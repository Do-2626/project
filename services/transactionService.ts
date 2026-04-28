// services/transaction.service.ts
import { apiClient } from "@/utils/api-client";
import { Transaction, transactionSchema } from "@/lib/schemas-v3";

export interface TransactionFilters {
  product_id?: string;
  branch_id?: string;
  start_date?: string;
  end_date?: string;
}

export const transactionService = {
  async getAll(filters?: TransactionFilters): Promise<Transaction[]> {
    return apiClient.get<Transaction[]>("/api/v3/transactions", filters as any);
  },

  async getById(id: string): Promise<Transaction> {
    return apiClient.get<Transaction>(`/api/v3/transactions/${id}`);
  },

  async create(data: Omit<Transaction, "id">): Promise<Transaction> {
    const validated = transactionSchema.parse(data);
    return apiClient.post<Transaction>("/api/v3/transactions", validated);
  },

  async update(id: string, data: Partial<Transaction>): Promise<Transaction> {
    const validated = transactionSchema.partial().parse(data);
    return apiClient.patch<Transaction>(`/api/v3/transactions/${id}`, validated);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/api/v3/transactions/${id}`);
  },
};
