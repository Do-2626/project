import React from "react";

export default function DailyLog({ report, during }: any) {
  return (
    <div className="bg-gray-700 p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-3 text-gray-200 border-b border-gray-600 pb-2">سجل عمليات اليوم</h3>
      {during.length === 0 ? (
        <div className="text-gray-500 text-center p-4">لا توجد عمليات مسجلة لهذا اليوم.</div>
      ) : (
        <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
          {during.map((t: any, i: number) => (
            <li key={i} className="flex justify-between items-center p-2 bg-gray-800 rounded-md">
              <div className="flex items-center gap-3">
                <i className={`fas ${iconMap[t.type]} ${colorMap[t.type]} w-5 text-center`}></i>
                <span className="font-semibold">{typeMap[t.type]}</span>
              </div>
              <div>
                <span className={`${colorMap[t.type]} font-bold`}>{t.quantity}</span>
                <span className="text-gray-400"> x {t.productId?.name || ''}</span>
              </div>
            </li>
          ))}
        </ul>
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
