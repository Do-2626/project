import React from "react";

export default function DailyLog({ report, during }: any) {
  return (
    <div className="bg-gray-700 p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-3 text-gray-200 border-b border-gray-600 pb-2">سجل عمليات اليوم</h3>
      {during.length === 0 ? (
        <div className="text-gray-500 text-center p-4">لا توجد عمليات مسجلة لهذا اليوم.</div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="p-2">النوع</th>
              <th className="p-2">الصنف</th>
              <th className="p-2">الكمية</th>
              <th className="p-2">الجهة</th>
            </tr>
          </thead>
          <tbody>
            {during.map((t: any, i: number) => (
              <tr key={i} className="bg-gray-800 rounded-md">
                <td className="p-2 flex items-center gap-2">
                  <i className={`fas ${iconMap[t.type]} ${colorMap[t.type]} w-5 text-center`}></i>
                  <span className="font-semibold">{typeMap[t.type]}</span>
                </td>
                <td className="p-2">{t.productId?.name || ''}</td>
                <td className="p-2">{t.quantity}</td>
                <td className="p-2">{t.party || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const typeMap: any = {
  purchase: 'مشتريات',
  outgoing: 'صادر',
  incoming: 'وارد',
  damaged: 'تالف',
};
const colorMap: any = {
  purchase: 'text-green-400',
  outgoing: 'text-red-400',
  incoming: 'text-yellow-400',
  damaged: 'text-purple-400',
};
const iconMap: any = {
  purchase: 'fa-shopping-cart',
  outgoing: 'fa-arrow-up',
  incoming: 'fa-arrow-down',
  damaged: 'fa-heart-broken',
};
