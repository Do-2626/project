import { connectDB } from "@/lib/db";
import { Cast } from "@/lib/models/cast";
import { Installment } from "@/lib/models/installment";
import { NextRequest, NextResponse } from "next/server";

// واجهة برمجية للحصول على جميع المهام
// GET /api/cast
export async function GET() {
  await connectDB();
  // ترتيب تصاعدى
  // const sortedCasts = await Cast.find().sort({ area: 1 });
  const sortedCasts = await Cast.find().sort({ customerCode: 1 });
  return NextResponse.json(sortedCasts);
}

// واجهة برمجية لإضافة مهمة جديدة
// POST /api/cast
export async function POST(request: NextRequest) {
  await connectDB();
  const body = await request.json();
  const newCast = new Cast(body);
  await newCast.save();

  // توليد الأقساط تلقائياً
  try {
    // استخراج البيانات المطلوبة
    const castId = newCast._id?.toString();
    const amount = body.amount;
    const installments = body.installments;
    const dateStr = body.date; // صيغة yyyy-mm-dd
    if (castId && amount && installments && dateStr) {
      const date = new Date(dateStr);
      // منطق أول قسط: إذا الشراء بين 25 الشهر السابق و25 الشهر الحالي، أول قسط في بداية الشهر التالي
      const now = new Date();
      const prev25 = new Date(now.getFullYear(), now.getMonth() - 1, 25);
      const curr25 = new Date(now.getFullYear(), now.getMonth(), 25, 23, 59, 59, 999);
      let firstDueDate;
      if (date >= prev25 && date <= curr25) {
        // بداية الشهر القادم
        firstDueDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      } else {
        // بداية الشهر الحالي
        firstDueDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }
      // إنشاء الأقساط
      for (let i = 0; i < installments; i++) {
        const dueDate = new Date(firstDueDate);
        dueDate.setMonth(dueDate.getMonth() + i);
        await Installment.create({
          castId: castId,
          dueDate: dueDate,
          amount: amount,
          number: i + 1,
          status: "DUE",
        });
      }
    }
  } catch (err) {
    console.error("[API/cast] Error creating installments (mongoose):", err);
  }

  return NextResponse.json(newCast);
}

// حذف جميع العملاء
// export async function DELETE() {
//   await connectDB();
//   try {
//     await Cast.deleteMany({});
//     return NextResponse.json({ success: true, message: "تم حذف جميع العملاء" });
//   } catch (error) {
//     return NextResponse.json({ success: false, message: "حدث خطأ أثناء الحذف" }, { status: 500 });
//   }
// }
// {/* زر حذف جميع العملاء */}
// <Button
//   onClick={async () => {
//     if (!confirm("هل أنت متأكد من حذف جميع العملاء؟")) return;
//     try {
//       const response = await fetch("/api/cast", {
//         method: "DELETE",
//         headers: { "Content-Type": "application/json" },
//       });
//       if (!response.ok) throw new Error("فشل في حذف جميع العملاء");
//       setCasts([]);
//       setSearchedCasts([]);
//       alert("تم حذف جميع العملاء بنجاح");
//     } catch (err) {
//       alert("حدث خطأ أثناء حذف جميع العملاء");
//     }
//   }}
//   variant="destructive"
//   className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-md"
// >
//   حذف جميع العملاء
// </Button>