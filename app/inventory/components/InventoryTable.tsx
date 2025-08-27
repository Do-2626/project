import React, { useState } from "react";

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

      {/* جدول المنتجات */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse text-sm md:text-base">
          <thead className="bg-gray-700 text-gray-300 uppercase">
            <tr>
              <th className="p-3">الاسم</th>
              <th className="p-3">الوزن</th>
              <th className="p-3">الكمية الحالية</th>
              {showProtected && <th className="p-3">سعر الشراء</th>}
              <th className="p-3">سعر البيع</th>
              {showProtected && <th className="p-3">قيمة الصنف</th>}
              <th className="p-3">الإجراءات</th> {/* إضافة عمود الإجراءات */}
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {products.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center p-8 text-gray-400">
                  لا توجد أصناف. قم بإضافة صنف جديد للبدء.
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const qty = getCurrentQuantity(product._id);
                const itemValue = qty * (product.purchasePrice || 0);
                return (
                  <tr
                    key={product._id}
                    className="hover:bg-gray-700 transition-colors duration-200"
                  >
                    <td className="p-3 font-medium text-gray-300">
                      {product.name}
                    </td>
                    <td className="p-3 text-gray-300">
                      {product.weight || "-"}
                    </td>
                    <td
                      className={`p-3 font-semibold ${
                        qty <= 0 ? "text-red-400" : "text-green-400"
                      }`}
                    >
                      {qty}
                    </td>
                    {showProtected && (
                      <td className="p-3 text-gray-300">
                        {Number(product.purchasePrice || 0).toFixed(2)}
                      </td>
                    )}
                    <td className="p-3 text-gray-300">
                      {Number(product.sellingPrice || 0).toFixed(2)}
                    </td>
                    {showProtected && (
                      <td className="p-3 font-bold text-blue-300">
                        {itemValue.toFixed(2)}
                      </td>
                    )}
                    <td className="p-3">
                      <button
                        onClick={() => handleEdit(product)}
                        className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-sm"
                      >
                        تعديل
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
