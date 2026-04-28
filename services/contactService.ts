// services/contact.service.ts
import { apiClient } from "@/utils/api-client";
import { Contact, contactSchema } from "@/lib/schemas-v3";

export const contactService = {
  async getAll(): Promise<Contact[]> {
    return apiClient.get<Contact[]>("/api/v3/contacts");
  },

  async getById(id: string): Promise<Contact> {
    return apiClient.get<Contact>(`/api/v3/contacts/${id}`);
  },

  async create(data: Omit<Contact, "id">): Promise<Contact> {
    const validated = contactSchema.parse(data);
    return apiClient.post<Contact>("/api/v3/contacts", validated);
  },

  async update(id: string, data: Partial<Contact>): Promise<Contact> {
    const validated = contactSchema.partial().parse(data);
    return apiClient.patch<Contact>(`/api/v3/contacts/${id}`, validated);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/api/v3/contacts/${id}`);
  },
};
