import React from "react";

/**
 * دليل الأعمدة للجدول الديناميكي
 */
export interface Column<T> {
    header: React.ReactNode;
    /** مفتاح البيانات أو دالة لعرض المحتوى */
    key?: keyof T | string;
    /** دالة مخصصة لعرض الخلية (اختياري) */
    render?: (item: T, index: number) => React.ReactNode;
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
}: DataTableProps<T>) {
    const safeData = Array.isArray(data) ? data : [];

    return (
        <div className={`overflow-x-auto rounded-xl ${className}`}>
            <table className="w-full table-auto border-collapse text-right text-sm md:text-base">
                <thead className="bg-gray-700 text-gray-300 uppercase">
                    <tr>
                        {columns.map((col, idx) => (
                            <th
                                key={idx}
                                className={`p-4 font-semibold ${col.className || ""}`}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700 align-middle">
                    {isLoading ? (
                        <tr>
                            <td colSpan={columns.length} className="text-center p-12">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                                    <span className="text-gray-400">جاري تحميل البيانات...</span>
                                </div>
                            </td>
                        </tr>
                    ) : safeData.length === 0 ? (
                        <tr>
                            <td
                                colSpan={columns.length}
                                className="text-center p-12 text-gray-500 italic"
                            >
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        safeData.map((item, rowIdx) => (
                            <tr
                                key={rowIdx}
                                className={`transition-colors duration-200 hover:bg-gray-750 ${rowClassName ? rowClassName(item, rowIdx) : ""
                                    }`}
                            >
                                {columns.map((col, colIdx) => (
                                    <td
                                        key={colIdx}
                                        className={`p-4 transition-all duration-300 ${col.className || ""}`}
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
            </table>
        </div>
    );
}
