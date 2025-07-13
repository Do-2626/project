import React from "react";
import Calendar from "@/components/Calendar";

interface DateRangeSelectorProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onRefresh: () => void;
  loading: boolean;
}

export default function DateRangeSelector({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onRefresh,
  loading
}: DateRangeSelectorProps) {
  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-gray-300 mb-2">من تاريخ</label>
          <Calendar selectedDate={startDate} onChange={onStartDateChange} />
        </div>
        
        <div>
          <label className="block text-gray-300 mb-2">إلى تاريخ</label>
          <Calendar selectedDate={endDate} onChange={onEndDateChange} />
        </div>
        
        <div className="md:col-span-2 flex items-end">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg transition w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin">↻</span>
                جاري التحميل...
              </>
            ) : (
              'تحديث البيانات'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
