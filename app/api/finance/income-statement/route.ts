import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import FinancialTransaction, { FinancialTransactionDocument } from '@/models/FinancialTransaction';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // استخراج معلومات التاريخ من الاستعلام
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // التحقق من وجود تواريخ البداية والنهاية
    if (!startDate || !endDate) {
      return NextResponse.json(
        { message: "يرجى تحديد تاريخ البداية والنهاية" },
        { status: 400 }
      );
    }

    // تحويل التواريخ إلى تنسيق موحد للمقارنة
    const formattedStartDate = new Date(startDate as string)
      .toISOString()
      .split("T")[0];
    const formattedEndDate = new Date(endDate as string)
      .toISOString()
      .split("T")[0];

    // تم إزالة كود المخزون غير الضروري

    // حساب الإيرادات من الحركات المالية
    const revenueTransactions = await FinancialTransaction.find({
      date: { $gte: formattedStartDate, $lte: formattedEndDate },
      creditAccount: 'revenue'
    });

    // حساب المصروفات التشغيلية
    const expenseTransactions = await FinancialTransaction.find({
      date: { $gte: formattedStartDate, $lte: formattedEndDate },
      debitAccount: 'expense'
    });

    // حساب تكلفة البضاعة المباعة (COGS)
    const cogsTransactions = await FinancialTransaction.find({
      date: { $gte: formattedStartDate, $lte: formattedEndDate },
      debitAccount: 'expense',
      category: 'cost_of_goods_sold'
    });

    // حساب الإجماليات
    const sales = revenueTransactions.reduce((sum: number, t: FinancialTransactionDocument) => sum + t.amount, 0);
    const costOfGoodsSold = cogsTransactions.reduce((sum: number, t: FinancialTransactionDocument) => sum + t.amount, 0);
    const operatingExpenses = expenseTransactions
      .filter((t: FinancialTransactionDocument) => t.category !== 'cost_of_goods_sold')
      .reduce((sum: number, t: FinancialTransactionDocument) => sum + t.amount, 0);

    // حساب الإيرادات الأخرى (غير التشغيلية)
    const otherIncomeTransactions = await FinancialTransaction.find({
      date: { $gte: formattedStartDate, $lte: formattedEndDate },
      creditAccount: 'revenue',
      category: { $ne: 'sales' }
    });

    const otherIncome = otherIncomeTransactions.reduce((sum: number, t: FinancialTransactionDocument) => sum + t.amount, 0);

    // حساب الإجماليات
    const otherExpenses = 0; // يمكن إضافة فئات أخرى للمصروفات في المستقبل
    const totalIncome = sales + otherIncome;
    const totalExpenses = costOfGoodsSold + operatingExpenses + otherExpenses;
    const netProfit = totalIncome - totalExpenses;

    // إعداد البيانات للاستجابة
    const incomeStatement = {
      startDate,
      endDate,
      sales: sales || 0,
      otherIncome: otherIncome || 0,
      totalIncome: totalIncome || 0,
      costOfGoodsSold: costOfGoodsSold || 0,
      operatingExpenses: operatingExpenses || 0,
      otherExpenses: otherExpenses || 0,
      totalExpenses: totalExpenses || 0,
      netProfit: netProfit || 0,
    };

    return NextResponse.json(incomeStatement);
  } catch (error) {
    console.error("خطأ في استعلام قائمة الدخل:", error);

    // تحسين رسائل الخطأ لتسهيل التشخيص
    let errorMessage = "حدث خطأ أثناء معالجة الطلب";
    if (error instanceof Error) {
      errorMessage = `${errorMessage}: ${error.message}`;
    }
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
