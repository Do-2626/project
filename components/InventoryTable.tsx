import React from "react";

export default function InventoryTable({ products, transactions, onAddProduct }: any) {
  // حساب الكميات الحالية لكل منتج
  const getCurrentQuantity = (productId: string) => {
    const filtered = transactions.filter((t: any) => t.productId._id === productId);
    let qty = 0;
    filtered.forEach((t: any) => {
      if (t.type === "purchase" || t.type === "incoming") qty += t.quantity;
      else if (t.type === "outgoing" || t.type === "damaged") qty -= t.quantity;
    });
    return qty;
  };

  return (
    <>
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-semibold text-white">قائمة الأصناف</h2>
        <button onClick={onAddProduct} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow transition duration-300 flex items-center gap-2">
          <i className="fas fa-plus-circle"></i> إضافة صنف جديد
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse text-sm md:text-base">
          <thead className="bg-gray-700 text-gray-300 uppercase">
            <tr>
              <th className="p-3">الاسم</th>
              <th className="p-3">الوزن</th>
              <th className="p-3">الكمية الحالية</th>
              <th className="p-3">سعر الشراء</th>
              <th className="p-3">سعر البيع</th>
              <th className="p-3">قيمة الصنف</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {products.length === 0 ? (
              <tr><td colSpan={6} className="text-center p-8 text-gray-400">لا توجد أصناف. قم بإضافة صنف جديد للبدء.</td></tr>
            ) : (
              products.map((product: any) => {
                const qty = getCurrentQuantity(product._id);
                const itemValue = qty * (product.purchasePrice || 0);
                return (
                  <tr key={product._id} className="hover:bg-gray-700 transition-colors duration-200">
                    <td className="p-3 font-medium">{product.name}</td>
                    <td className="p-3 text-gray-300">{product.weight || '-'}</td>
                    <td className={`p-3 font-semibold ${qty <= 0 ? 'text-red-400' : 'text-green-400'}`}>{qty}</td>
                    <td className="p-3 text-gray-300">{parseFloat(product.purchasePrice || 0).toFixed(2)}</td>
                    <td className="p-3 text-gray-300">{parseFloat(product.sellingPrice || 0).toFixed(2)}</td>
                    <td className="p-3 font-bold text-blue-300">{itemValue.toFixed(2)}</td>
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
