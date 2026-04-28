// services/product.service.ts
import { apiClient } from "@/utils/api-client";
import { Product, productSchema } from "@/lib/schemas-v3";

export const productService = {
  async getAll(): Promise<Product[]> {
    return apiClient.get<Product[]>("/api/v3/products");
  },

  async getById(id: string): Promise<Product> {
    return apiClient.get<Product>(`/api/v3/products/${id}`);
  },

  async create(data: Omit<Product, "id">): Promise<Product> {
    const validated = productSchema.parse(data);
    return apiClient.post<Product>("/api/v3/products", validated);
  },

  async update(id: string, data: Partial<Product>): Promise<Product> {
    const validated = productSchema.partial().parse(data);
    return apiClient.patch<Product>(`/api/v3/products/${id}`, validated);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/api/v3/products/${id}`);
  },
};
