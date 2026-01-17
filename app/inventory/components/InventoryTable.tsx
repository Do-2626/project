import React, { useState } from "react";
import DataTable from "@/components/DataTable";

// تعريف أنواع البيانات
interface Product {
  _id: string;
  name: string;
  weight?: string;
  purchasePrice: number;
  sellingPrice: number;
}

interface DailyReportItem {
  product: Product;
  startQty: number;
  endQty: number;
}

interface InventoryTableProps {
  products: Product[];
  transactions: any[]; // قد لا نحتاجها بعد الآن
  onAddProduct: () => void;
  showProtected: boolean;
  dailyReport?: DailyReportItem[]; // إضافة خاصية التقرير اليومي
  onUpdateProduct: (product: Product) => void; // إضافة دالة التحديث
}

export default function InventoryTable({
  products,
  transactions,
  onAddProduct,
  showProtected,
  dailyReport,
  onUpdateProduct, // استقبال دالة التحديث
}: InventoryTableProps) {
  // الحصول على الكمية الحالية من التقرير اليومي
  const getCurrentQuantity = (productId: string) => {
    if (!dailyReport) return 0;
    const reportItem = dailyReport.find(
      (item) => item.product._id === productId
    );
    return reportItem ? reportItem.endQty : 0;
  };

  // حالة للتعامل مع نموذج التعديل
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // فتح نموذج التعديل
  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowEditModal(true);
  };

  // حفظ التعديلات
  const handleUpdate = () => {
    if (editingProduct) {
      onUpdateProduct(editingProduct);
      setShowEditModal(false);
    }
  };

  return (
    <>
      {/* نموذج التعديل */}
      {showEditModal && editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">تعديل المنتج</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">الاسم</label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      name: e.target.value,
                    })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">الوزن</label>
                <input
                  type="text"
                  value={editingProduct.weight || ""}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      weight: e.target.value,
                    })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  سعر الشراء
                </label>
                <input
                  type="number"
                  value={editingProduct.purchasePrice}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      purchasePrice: Number(e.target.value),
                    })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  سعر البيع
                </label>
                <input
                  type="number"
                  value={editingProduct.sellingPrice}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      sellingPrice: Number(e.target.value),
                    })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded"
              >
                إلغاء
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
              >
                حفظ التغييرات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* جدول المنتجات باستخدام المكون الديناميكي الجديد */}
      <DataTable
        data={products}
        emptyMessage="لا توجد أصناف. قم بإضافة صنف جديد للبدء."
        columns={[
          {
            header: "الاسم",
            className: "text-right",
            render: (product) => <span className="font-medium text-gray-300">{product.name}</span>
          },
          {
            header: "الوزن",
            className: "text-center",
            render: (product) => <span className="text-gray-300">{product.weight || "-"}</span>
          },
          {
            header: "الكمية الحالية",
            className: "text-center",
            render: (product) => {
              const qty = getCurrentQuantity(product._id);
              return (
                <span className={`font-semibold ${qty <= 0 ? "text-red-400" : "text-green-400"}`}>
                  {qty}
                </span>
              );
            }
          },
          ...(showProtected ? [
            {
              header: "سعر الشراء",
              className: "text-center",
              render: (product: Product) => (
                <span className="text-gray-300">
                  {Number(product.purchasePrice || 0).toFixed(2)}
                </span>
              )
            }
          ] : []),
          {
            header: "سعر البيع",
            className: "text-center",
            render: (product) => (
              <span className="text-gray-300">
                {Number(product.sellingPrice || 0).toFixed(2)}
              </span>
            )
          },
          ...(showProtected ? [
            {
              header: "قيمة الصنف",
              className: "text-center",
              render: (product: Product) => {
                const qty = getCurrentQuantity(product._id);
                return (
                  <span className="font-bold text-blue-300">
                    {(qty * (product.purchasePrice || 0)).toFixed(2)}
                  </span>
                );
              }
            }
          ] : []),
          {
            header: "الإجراءات",
            className: "text-center",
            render: (product) => (
              <button
                onClick={() => handleEdit(product)}
                className="bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg text-sm transition-all shadow-md"
              >
                تعديل
              </button>
            )
          }
        ]}
        rowClassName={() => "hover:bg-gray-700 transition-colors duration-200"}
      />
    </>
  );
}
