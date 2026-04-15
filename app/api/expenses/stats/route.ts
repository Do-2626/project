import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('financial_transactions')
      .select('amount, branch_id(id, name), expense_category_id(id, name)')
      .eq('type', 'expense');

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const stats = (data ?? []).reduce((acc: any[], row: any) => {
      const categoryName = row.expense_category_id?.name || 'غير محدد';
      const branchName = row.branch_id?.name || 'غير محدد';
      const idx = acc.findIndex((item: any) => item.categoryName === categoryName && item.branchName === branchName);

      if (idx !== -1) {
        acc[idx].totalAmount += row.amount || 0;
      } else {
        acc.push({ categoryName, branchName, totalAmount: row.amount || 0 });
      }

      return acc;
    }, []);

    return NextResponse.json(stats);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
