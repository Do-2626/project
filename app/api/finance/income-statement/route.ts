import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '../../../../lib/mongoose';
import Transaction from '../../../../models/Transaction';
import Product from '../../../../models/Product';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // استخراج معلمات التاريخ من الاستعلام
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    if (!startDate || !endDate) {
      return NextResponse.json(
        { message: 'يرجى تحديد تاريخ البداية والنهاية' },
        { status: 400 }
      );
    }

    // تحويل التواريخ إلى تنسيق موحد للمقارنة
    const formattedStartDate = new Date(startDate as string).toISOString().split('T')[0];
    const formattedEndDate = new Date(endDate as string).toISOString().split('T')[0];
    
    // الحصول على جميع المعاملات في النطاق الزمني المحدد
    const transactions = await Transaction.find({
      date: { $gte: formattedStartDate, $lte: formattedEndDate }
    }).populate('productId');

    // حساب المبيعات (المعاملات الخارجة)
    let sales = 0;
    let costOfGoodsSold = 0;
    
    // حساب الإيرادات والتكاليف من المعاملات
    transactions.forEach((transaction: any) => {
      if (transaction.type === 'outgoing') {
        // المبيعات: سعر البيع × الكمية
        const sellingPrice = transaction.productId?.sellingPrice || 0;
        sales += sellingPrice * transaction.quantity;
        
        // تكلفة البضاعة المباعة: سعر الشراء × الكمية
        const purchasePrice = transaction.productId?.purchasePrice || 0;
        costOfGoodsSold += purchasePrice * transaction.quantity;
      }
    });

    // الحصول على المصروفات والإيرادات الأخرى
    const expenseTransactions = await Transaction.find({
      date: { $gte: formattedStartDate, $lte: formattedEndDate },
      type: 'expense'
    });

    const incomeTransactions = await Transaction.find({
      date: { $gte: formattedStartDate, $lte: formattedEndDate },
      type: 'income'
    });

    // حساب المصروفات التشغيلية والإيرادات الأخرى
    const operatingExpenses = expenseTransactions.reduce(
      (total: number, transaction: any) => total + (transaction.amount || 0),
      0
    );

    const otherIncome = incomeTransactions.reduce(
      (total: number, transaction: any) => total + (transaction.amount || 0),
      0
    );

    // حساب الإجماليات
    const otherExpenses = 0; // يمكن إضافة فئات أخرى للمصروفات في المستقبل
    const totalIncome = sales + otherIncome;
    const totalExpenses = costOfGoodsSold + operatingExpenses + otherExpenses;
    const netProfit = totalIncome - totalExpenses;

    // إعداد البيانات للاستجابة
    const incomeStatement = {
      startDate,
      endDate,
      sales,
      otherIncome,
      totalIncome,
      costOfGoodsSold,
      operatingExpenses,
      otherExpenses,
      totalExpenses,
      netProfit
    };

    return NextResponse.json(incomeStatement);
  } catch (error) {
    console.error('خطأ في استعلام قائمة الدخل:', error);
    
    // تحسين رسائل الخطأ لتسهيل التشخيص
    let errorMessage = 'حدث خطأ أثناء معالجة الطلب';
    if (error instanceof Error) {
      errorMessage = `${errorMessage}: ${error.message}`;
    }
    
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}