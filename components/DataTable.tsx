import React from "react";

/**
 * دليل الأعمدة للجدول الديناميكي
 */
export interface Column<T> {
    header: React.ReactNode;
    /** مفتاح البيانات أو دالة لعرض المحتوى */
    key?: keyof T | string;
    /** دالة مخصصة لتنسيق الخلية (اختياري) */
    render?: (item: T, index: number) => React.ReactNode;
    /** دالة مخصصة لخلية الإجمالي في التذييل (اختياري) */
    footer?: (data: T[]) => React.ReactNode;
    /** تنسيقات مخصصة للعمود (اختياري) */
    className?: string;
}

interface DataTableProps<T> {
    /** البيانات المراد عرضها */
    data: T[];
    /** تعريف الأعمدة */
    columns: Column<T>[];
    /** الرسالة التي تظهر عند فراغ البيانات */
    emptyMessage?: string;
    /** تنسيقات مخصصة للحاوية */
    className?: string;
    /** دالة مخصصة لتنسيق الصف (اختياري) */
    rowClassName?: (item: T, index: number) => string;
    /** هل البيانات في حالة تحميل؟ (اختياري) */
    isLoading?: boolean;
    /** هل يتم إظهار صف الإجمالي في الأسفل؟ */
    showTotal?: boolean;
}

/**
 * مكون جدول عام وديناميكي وقابل لإعادة الاستخدام بصورة مرنة
 * @author Antigravity (Expert Mode)
 */
export default function DataTable<T>({
    data = [],
    columns,
    emptyMessage = "لا توجد بيانات للعرض",
    className = "",
    rowClassName,
    isLoading = false,
    showTotal = false,
}: DataTableProps<T>) {
    const safeData = Array.isArray(data) ? data : [];

    return (
        <div className={`overflow-x-auto rounded-2xl ${className}`}>
            <table className="w-full table-auto border-collapse text-right text-sm md:text-base">
                <thead className="bg-[#2a343e] text-white/50 uppercase text-[10px] md:text-xs tracking-widest font-bold">
                    <tr>
                        {columns.map((col, idx) => (
                            <th
                                key={idx}
                                className={`p-4 md:p-5 font-bold ${col.className || ""}`}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-transparent divide-y divide-[#3b4754]/50 align-middle">
                    {isLoading ? (
                        <tr>
                            <td colSpan={columns.length} className="text-center p-20">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-10 h-10 border-4 border-[#1173d4]/20 border-t-[#1173d4] rounded-full animate-spin"></div>
                                    <span className="text-[#9cabba] text-xs">جاري تحميل البيانات...</span>
                                </div>
                            </td>
                        </tr>
                    ) : safeData.length === 0 ? (
                        <tr>
                            <td
                                colSpan={columns.length}
                                className="text-center p-20 text-[#9cabba] italic text-sm"
                            >
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        safeData.map((item, rowIdx) => (
                            <tr
                                key={rowIdx}
                                className={`px-2 transition-all duration-300 hover:bg-[#1173d4]/5 ${rowClassName ? rowClassName(item, rowIdx) : ""
                                    }`}
                            >
                                {columns.map((col, colIdx) => (
                                    <td
                                        key={colIdx}
                                        className={`px-2 transition-all duration-300 ${col.className || ""}`}
                                    >
                                        {col.render
                                            ? col.render(item, rowIdx)
                                            : col.key
                                                ? (item[col.key as keyof T] as unknown as React.ReactNode)
                                                : null}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
                {showTotal && !isLoading && safeData.length > 0 && (
                    <tfoot className="bg-[#101922] border-t-2 border-[#3b4754] font-black text-white">
                        <tr>
                            {columns.map((col, idx) => {
                                let content: React.ReactNode = null;
                                if (col.footer) {
                                    content = col.footer(safeData);
                                } else if (idx === 0) {
                                    content = <span className="text-[#9cabba] font-medium">الإجمالي</span>;
                                } else if (col.key) {
                                    const sum = safeData.reduce((acc, item) => {
                                        const val = item[col.key as keyof T];
                                        return acc + (typeof val === 'number' ? val : 0);
                                    }, 0);
                                    content = Number.isInteger(sum) ? sum : sum.toFixed(2);
                                }

                                return (
                                    <th key={idx} className={`p-4 md:p-5 ${col.className || ""}`}>
                                        {content}
                                    </th>
                                );
                            })}
                        </tr>
                    </tfoot>
                )}
            </table>
        </div>
    );
}
