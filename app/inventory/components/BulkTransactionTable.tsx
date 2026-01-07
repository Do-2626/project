import React from "react";

interface Product {
  _id: string;
  name: string;
  purchasePrice?: number;
}

interface DailyReportItem {
  product: Product;
  endQty: number; // المخزون الحالي (رصيد النهاية في التقرير)
}

interface BulkTransactionTableProps {
  products: Product[];
  dailyReport: DailyReportItem[];
  type: string; // "outgoing", "incoming", "damaged", "purchase"
  quantities: Record<string, number>; // { productId: quantity }
  onQuantityChange: (productId: string, quantity: number) => void;
}

export default function BulkTransactionTable({
  products,
  dailyReport,
  type,
  quantities,
  onQuantityChange,
}: BulkTransactionTableProps) {
  // دالة لحساب الرصيد المتوقع
  const calculateExpected = (current: number, qty: number) => {
    if (type === "purchase" || type === "incoming") {
      return current + qty;
    } else if (type === "outgoing" || type === "damaged") {
      return current - qty;
    }
    return current;
  };

  return (
    <div className="overflow-x-auto max-h-[400px] overflow-y-auto border border-gray-600 rounded-lg">
      <table className="w-full text-sm text-right text-gray-300">
        <thead className="text-xs uppercase bg-gray-700 text-gray-300 sticky top-0 z-10">
          <tr>
            <th className="px-4 py-3">الصنف</th>
            <th className="px-4 py-3 text-center">المخزون الحالي</th>
            <th className="px-4 py-3 text-center">الكمية</th>
            <th className="px-4 py-3 text-center">المتوقع</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            // البحث عن المخزون الحالي للمنتج من التقرير اليومي
            const reportItem = dailyReport?.find(
              (item) => item.product._id === product._id
            );
            const currentStock = reportItem ? reportItem.endQty : 0;
            const quantity = quantities[product._id] || 0;
            const expected = calculateExpected(currentStock, quantity);
            const isModified = quantity > 0;
            const isNegative = expected < 0;

            return (
              <tr
                key={product._id}
                className={`border-b border-gray-700 hover:bg-gray-700 transition-colors ${
                  isModified ? "bg-gray-800 bg-opacity-60" : "bg-gray-800"
                }`}
              >
                <td className="px-4 py-2 font-medium text-white">
                  {product.name}
                </td>
                <td className="px-4 py-2 text-center">{currentStock}</td>
                <td className="px-4 py-2 text-center">
                  <input
                    type="number"
                    min="0"
                    value={quantity === 0 ? "" : quantity}
                    onChange={(e) =>
                      onQuantityChange(
                        product._id,
                        parseInt(e.target.value) || 0
                      )
                    }
                    className={`w-20 text-center rounded p-1 text-white bg-gray-700 border ${
                      isModified ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-600"
                    } focus:outline-none focus:border-blue-500`}
                    placeholder="0"
                  />
                </td>
                <td
                  className={`px-4 py-2 text-center font-bold ${
                    isNegative ? "text-red-500" : "text-green-400"
                  }`}
                >
                  {expected}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
