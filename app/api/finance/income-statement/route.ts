import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json({ message: 'يرجى تحديد تاريخ البداية والنهاية' }, { status: 400 });
    }

    const formattedStartDate = new Date(startDate).toISOString().split('T')[0];
    const formattedEndDate = new Date(endDate).toISOString().split('T')[0];

    const { data: transactions, error: transactionError } = await supabase
      .from('transactions')
      .select('*, product_id(*)')
      .gte('date', formattedStartDate)
      .lte('date', formattedEndDate);

    if (transactionError) {
      return NextResponse.json({ message: transactionError.message }, { status: 500 });
    }

    let sales = 0;
    let costOfGoodsSold = 0;

    (transactions ?? []).forEach((transaction: any) => {
      if (transaction.type === 'outgoing' || transaction.type === 'sale') {
        if (transaction.type === 'sale' && transaction.amount) {
          sales += transaction.amount;
        } else {
          const sellingPrice = transaction.product_id?.selling_price || 0;
          sales += sellingPrice * (transaction.quantity || 0);
        }
        const purchasePrice = transaction.product_id?.purchase_price || 0;
        costOfGoodsSold += purchasePrice * (transaction.quantity || 0);
      }
    });

    const { data: expenseTransactions, error: expenseError } = await supabase
      .from('transactions')
      .select('amount')
      .gte('date', formattedStartDate)
      .lte('date', formattedEndDate)
      .eq('type', 'expense');

    if (expenseError) {
      return NextResponse.json({ message: expenseError.message }, { status: 500 });
    }

    const { data: incomeTransactions, error: incomeError } = await supabase
      .from('transactions')
      .select('amount')
      .gte('date', formattedStartDate)
      .lte('date', formattedEndDate)
      .eq('type', 'income');

    if (incomeError) {
      return NextResponse.json({ message: incomeError.message }, { status: 500 });
    }

    const operatingExpenses = (expenseTransactions ?? []).reduce(
      (total: number, transaction: any) => total + (transaction.amount || 0),
      0
    );

    const otherIncome = (incomeTransactions ?? []).reduce(
      (total: number, transaction: any) => total + (transaction.amount || 0),
      0
    );

    const otherExpenses = 0;
    const totalIncome = sales + otherIncome;
    const totalExpenses = costOfGoodsSold + operatingExpenses + otherExpenses;
    const netProfit = totalIncome - totalExpenses;

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
      netProfit,
    };

    return NextResponse.json(incomeStatement);
  } catch (error: any) {
    console.error('خطأ في استعلام قائمة الدخل:', error);
    const errorMessage = error instanceof Error ? `حدث خطأ أثناء معالجة الطلب: ${error.message}` : 'حدث خطأ أثناء معالجة الطلب';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
