import 'dayjs/locale/ar';
import dayjs from 'dayjs';
import React from 'react';

export default function Calendar({ selectedDate, onChange }: { selectedDate: string, onChange: (date: string) => void }) {
  return (
    <input
      type="date"
      value={selectedDate}
      onChange={e => onChange(e.target.value)}
      className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
    />
  );
}
