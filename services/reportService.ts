// services/report.service.ts
import { apiClient } from "@/utils/api-client";

export interface InventorySummaryFilters {
  start_date: string;
  end_date: string;
  branch_id?: string;
}

export interface InventorySummaryItem {
  productId: string;
  qtyPurchase: number;
  qtySale: number;
  qtyIncoming: number;
  qtyOutgoing: number;
  qtyDamaged: number;
  netChange: number;
}

export interface DailySummaryItem {
  date: string;
  productId: string;
  totalIn: number;
  totalOut: number;
}

export const reportService = {
  /**
   * جلب ملخص المخزون باستخدام وظيفة SQL المجمعة
   */
  async getInventorySummary(filters: InventorySummaryFilters): Promise<InventorySummaryItem[]> {
    return apiClient.get<InventorySummaryItem[]>("/api/v3/reports/inventory-summary", filters as any);
  },

  /**
   * جلب التقرير اليومي من الـ View المحسن
   */
  async getDailySummary(date?: string, productId?: string): Promise<DailySummaryItem[]> {
    return apiClient.get<DailySummaryItem[]>("/api/v3/reports/daily-summary", {
      date,
      product_id: productId,
    });
  },
};
