import React from "react";
import AccountSelector from "./AccountSelector";

export default function InventoryTable({ products, transactions, onAddProduct, showProtected }: any) {
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

  const [debitAccount, setDebitAccount] = React.useState("");
  const [creditAccount, setCreditAccount] = React.useState("");
  const [error, setError] = React.useState("");
  const handlePurchase = () => {
    if (!debitAccount || !creditAccount) {
      setError('يجب تحديد الحسابين المدين والدائن');
      return;
    }
    if (debitAccount === creditAccount) {
      setError('الحساب المدين والدائن يجب أن يكونا مختلفين');
      return;
    }
    setError("");
    // هنا يتم استدعاء دالة الشراء مع الحسابات المختارة
    // onAddProduct(product, debitAccount, creditAccount);
  };

  return (
    <> 
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
                    <td className="p-3 font-medium text-gray-300">{product.name}</td>
                    <td className="p-3 text-gray-300">{product.weight || '-'}</td>
                    <td className={`p-3 font-semibold ${qty <= 0 ? 'text-red-400' : 'text-green-400'}`}>{qty}</td>
                    {showProtected && <td className="p-3 text-gray-300">{parseFloat(product.purchasePrice || 0).toFixed(2)}</td>}
                    <td className="p-3 text-gray-300">{parseFloat(product.sellingPrice || 0).toFixed(2)}</td>
                    {showProtected && <td className="p-3 font-bold text-blue-300">{itemValue.toFixed(2)}</td>}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <div className="flex gap-4 mb-4">
        <AccountSelector value={debitAccount} onChange={setDebitAccount} label="الحساب المدين" />
        <AccountSelector value={creditAccount} onChange={setCreditAccount} label="الحساب الدائن" />
        <button className="bg-blue-600 px-4 py-2 rounded text-white" onClick={handlePurchase}>تنفيذ الشراء</button>
      </div>
      {error && <div className="text-red-400 mb-2">{error}</div>}
    </>
  );
}
