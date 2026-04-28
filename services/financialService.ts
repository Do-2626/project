// services/financial-transaction.service.ts
import { apiClient } from "@/utils/api-client";
import { FinancialTransaction, financialTransactionSchema } from "@/lib/schemas-v3";

export interface FinancialFilters {
  type?: string;
  branch_id?: string;
  start_date?: string;
  end_date?: string;
}

export const financialService = {
  async getAll(filters?: FinancialFilters): Promise<FinancialTransaction[]> {
    return apiClient.get<FinancialTransaction[]>("/api/v3/financial-transactions", filters as any);
  },

  async getById(id: string): Promise<FinancialTransaction> {
    return apiClient.get<FinancialTransaction>(`/api/v3/financial-transactions/${id}`);
  },

  async create(data: Omit<FinancialTransaction, "id">): Promise<FinancialTransaction> {
    const validated = financialTransactionSchema.parse(data);
    return apiClient.post<FinancialTransaction>("/api/v3/financial-transactions", validated);
  },

  async update(id: string, data: Partial<FinancialTransaction>): Promise<FinancialTransaction> {
    const validated = financialTransactionSchema.partial().parse(data);
    return apiClient.patch<FinancialTransaction>(`/api/v3/financial-transactions/${id}`, validated);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/api/v3/financial-transactions/${id}`);
  },
};
