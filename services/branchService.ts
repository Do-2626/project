// services/branch.service.ts
import { apiClient } from "@/utils/api-client";
import { Branch, branchSchema } from "@/lib/schemas-v3";

export const branchService = {
  async getAll(): Promise<Branch[]> {
    return apiClient.get<Branch[]>("/api/v3/branches");
  },

  async getById(id: string): Promise<Branch> {
    return apiClient.get<Branch>(`/api/v3/branches/${id}`);
  },

  async create(data: Omit<Branch, "id">): Promise<Branch> {
    const validated = branchSchema.parse(data);
    return apiClient.post<Branch>("/api/v3/branches", validated);
  },

  async update(id: string, data: Partial<Branch>): Promise<Branch> {
    const validated = branchSchema.partial().parse(data);
    return apiClient.patch<Branch>(`/api/v3/branches/${id}`, validated);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/api/v3/branches/${id}`);
  },
};
