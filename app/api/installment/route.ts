import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Installment } from "@/lib/models/installment";
import { Cast } from "@/lib/models/cast";

// جلب العملاء المستحقين لهذا الشهر فقط بناءً على تاريخ الشراء ومعيار 25
export async function GET() {
  await connectDB();
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const prev25 = new Date(now.getFullYear(), now.getMonth() - 1, 25);
    const curr25 = new Date(now.getFullYear(), now.getMonth(), 25, 23, 59, 59, 999);

    // جلب جميع الأقساط المستحقة لهذا الشهر
    let installments = await Installment.find({
      status: "DUE",
      dueDate: { $gte: startOfMonth, $lte: endOfMonth },
    }).lean();

    // جلب بيانات العملاء المرتبطة
    const castIds = installments.map((i) => i.castId);
    const casts = await Cast.find({ _id: { $in: castIds } }).lean();
    const castMap = Object.fromEntries(
      (casts as Array<{ _id: any; [key: string]: any }>).map((c) => [c._id.toString(), c])
    );

    // ربط بيانات العميل بكل قسط
    installments = installments.map((i) => ({ ...i, cast: castMap[i.castId] || null }));

    // فلترة النتائج لإرجاع فقط الأقساط التي لها عميل
    installments = installments.filter((i) => i.cast);

    // إحصائيات
    const totalCollectable = installments.reduce((sum, i) => sum + (i.amount || 0), 0);
    const totalCollected = await Installment.aggregate([
      { $match: { status: "PAID", paidAt: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    return NextResponse.json({
      installments,
      stats: {
        totalCollectable,
        totalCollected: totalCollected[0]?.total || 0,
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        installments: [],
        stats: { totalCollectable: 0, totalCollected: 0 },
        error: String(err),
      },
      { status: 500 }
    );
  }
}

// تحديث حالة القسط (تحصيل أو تأجيل)
export async function PATCH(request: NextRequest) {
  await connectDB();
  const { installmentId, action } = await request.json();
  if (!installmentId || !["PAID", "POSTPONED"].includes(action)) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const now = new Date();
  let updateData = {};

  if (action === "PAID") {
    updateData = { status: "PAID", paidAt: now, postponed: false };
    // إضافة قسط جديد للشهر القادم بنفس بيانات القسط مع زيادة الرقم
    const old = await Installment.findById(installmentId);
    if (old) {
      await Installment.create({
        castId: old.castId,
        dueDate: new Date(now.getFullYear(), now.getMonth() + 1, old.dueDate.getDate()),
        amount: old.amount,
        number: old.number + 1,
        status: "DUE",
      });
    }
  } else if (action === "POSTPONED") {
    updateData = { status: "POSTPONED", postponed: true };
    // إعادة جدولة نفس القسط للشهر القادم بنفس الرقم
    const old = await Installment.findById(installmentId);
    if (old) {
      await Installment.create({
        castId: old.castId,
        dueDate: new Date(now.getFullYear(), now.getMonth() + 1, old.dueDate.getDate()),
        amount: old.amount,
        number: old.number,
        status: "DUE",
      });
    }
  }

  await Installment.findByIdAndUpdate(installmentId, updateData);

  return NextResponse.json({ success: true });
}
