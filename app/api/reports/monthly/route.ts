import { NextRequest, NextResponse } from 'next/server';
import { supabase, toCamel } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { data: financialRows, error: financialError } = await supabase
      .from('financial_transactions')
      .select('type, amount, category, date');

    if (financialError) {
      return NextResponse.json({ error: financialError.message }, { status: 500 });
    }

    const { data: inventoryRows, error: inventoryError } = await supabase
      .from('transactions')
      .select('type, amount, quantity, date, product_id(id, purchase_price, selling_price)')
      .in('type', ['outgoing', 'sale']);

    if (inventoryError) {
      return NextResponse.json({ error: inventoryError.message }, { status: 500 });
    }

    const monthlyData: Record<string, any> = {};

    (financialRows ?? []).forEach((item: any) => {
      const monthKey = `${item.date?.slice(0, 4)}-${item.date?.slice(5, 7)}`;
      if (!monthlyData[monthKey]) monthlyData[monthKey] = { sales: 0, cogs: 0, expenses: 0, otherIncome: 0 };

      if (item.type === 'expense') {
        monthlyData[monthKey].expenses += item.amount || 0;
      } else if (item.type === 'income' && item.category !== 'المبيعات') {
        monthlyData[monthKey].otherIncome += item.amount || 0;
      }
    });

    (inventoryRows ?? []).forEach((tx: any) => {
      const monthKey = `${tx.date?.slice(0, 4)}-${tx.date?.slice(5, 7)}`;
      if (!monthlyData[monthKey]) monthlyData[monthKey] = { sales: 0, cogs: 0, expenses: 0, otherIncome: 0 };

      const sellingPrice = tx.amount ?? (tx.product_id?.selling_price ?? 0) * (tx.quantity ?? 0);
      const purchasePrice = (tx.product_id?.purchase_price ?? 0) * (tx.quantity ?? 0);

      monthlyData[monthKey].sales += sellingPrice;
      monthlyData[monthKey].cogs += purchasePrice;
    });

    const result = Object.entries(monthlyData)
      .map(([month, data]: any) => ({
        month,
        ...data,
        netProfit: (data.sales + data.otherIncome) - (data.cogs + data.expenses),
      }))
      .sort((a, b) => b.month.localeCompare(a.month));

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Monthly report error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
