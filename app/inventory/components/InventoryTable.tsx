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
  transactions: any[];
  onAddProduct: () => void;
  showProtected: boolean;
  userRole?: string;
  dailyReport?: DailyReportItem[];
  onUpdateProduct: (product: Product) => void;
}

export default function InventoryTable({
  products,
  showProtected,
  userRole,
  dailyReport,
  onUpdateProduct,
}: InventoryTableProps) {
  const getCurrentQuantity = (productId: string) => {
    if (!dailyReport) return 0;
    const reportItem = dailyReport.find(
      (item) => item.product._id === productId
    );
    return reportItem ? reportItem.endQty : 0;
  };

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowEditModal(true);
  };

  const handleUpdate = () => {
    if (editingProduct) {
      onUpdateProduct(editingProduct);
      setShowEditModal(false);
    }
  };

  return (
    <>
      {/* نموذج التعديل المتطور */}
      {showEditModal && editingProduct && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] backdrop-blur-md p-4">
          <div className="bg-[#1b2127] border border-[#3b4754] p-6 rounded-3xl w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-6 text-white text-center">تعديل بيانات المنتج</h3>

            <div className="space-y-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-[#9cabba] px-1 font-medium">اسم المنتج</label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full bg-[#101922] border border-[#3b4754] text-white rounded-xl h-12 px-4 focus:ring-1 focus:ring-[#1173d4] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-[#9cabba] px-1 font-medium">الوزن / الحجم</label>
                  <input
                    type="text"
                    value={editingProduct.weight || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, weight: e.target.value })}
                    className="w-full bg-[#101922] border border-[#3b4754] text-white rounded-xl h-12 px-4 focus:ring-1 focus:ring-[#1173d4] outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-[#9cabba] px-1 font-medium">سعر الشراء</label>
                  <input
                    type="number"
                    value={editingProduct.purchasePrice}
                    onChange={(e) => setEditingProduct({ ...editingProduct, purchasePrice: Number(e.target.value) })}
                    className="w-full bg-[#101922] border border-[#3b4754] text-white rounded-xl h-12 px-4 focus:ring-1 focus:ring-[#1173d4] outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-[#9cabba] px-1 font-medium">سعر البيع</label>
                <input
                  type="number"
                  value={editingProduct.sellingPrice}
                  onChange={(e) => setEditingProduct({ ...editingProduct, sellingPrice: Number(e.target.value) })}
                  className="w-full bg-[#101922] border border-[#3b4754] text-white rounded-xl h-12 px-4 focus:ring-1 focus:ring-[#1173d4] outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all font-bold"
              >
                إلغاء
              </button>
              <button
                onClick={handleUpdate}
                className="flex-1 px-4 py-3 bg-[#1173d4] hover:bg-[#1173d4]/90 text-white rounded-xl shadow-lg shadow-[#1173d4]/20 transition-all font-bold"
              >
                حفظ التعديلات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* جدول المنتجات */}
      <DataTable
        data={products}
        emptyMessage="لا توجد أصناف مسجلة"
        columns={[
          {
            header: "الاسم",
            className: "text-right",
            render: (product) => <span className="font-bold text-gray-200">{product.name}</span>
          },
          {
            header: "الوزن",
            className: "text-center",
            render: (product) => <span className="text-[#9cabba] text-sm">{product.weight || "-"}</span>
          },
          {
            header: "الكمية",
            className: "text-center",
            render: (product) => {
              const qty = getCurrentQuantity(product._id);
              return (
                <span className={`font-black text-lg ${qty <= 0 ? "text-orange-500" : "text-green-500"}`}>
                  {qty}
                </span>
              );
            }
          },
          ...(showProtected && userRole === 'manager' ? [
            {
              header: "الشراء",
              className: "text-center",
              render: (product: Product) => (
                <span className="text-gray-400 font-mono">
                  {Number(product.purchasePrice || 0).toLocaleString()}
                </span>
              )
            }
          ] : []),
          {
            header: "البيع",
            className: "text-center",
            render: (product) => (
              <span className="text-yellow-500 font-bold">
                {Number(product.sellingPrice || 0).toLocaleString()}
              </span>
            )
          },
          ...(showProtected && userRole === 'manager' ? [
            {
              header: "القيمة",
              className: "text-center",
              render: (product: Product) => {
                const qty = getCurrentQuantity(product._id);
                return (
                  <span className="font-black text-[#1173d4]">
                    {(qty * (product.purchasePrice || 0)).toLocaleString()}
                  </span>
                );
              }
            }
          ] : []),
          {
            header: "تعديل",
            className: "text-center",
            render: (product) => (
              <button
                onClick={() => handleEdit(product)}
                className="size-10 bg-[#1173d4]/10 hover:bg-[#1173d4] text-[#1173d4] hover:text-white rounded-xl transition-all flex items-center justify-center shadow-inner group"
              >
                <span className="material-symbols-outlined text-sm group-hover:scale-110">edit</span>
              </button>
            )
          }
        ]}
      />
    </>
  );
}
