import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { date, branchId, sales, isWeekly } = await req.json();

    if (!date || !branchId || !sales) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    for (const sale of sales) {
      const { productId, amount, quantity } = sale;
      const query = {
        type: 'income',
        category: 'المبيعات',
        branch_id: branchId,
        date,
        product_id: productId,
      };

      const { data: existing, error: existingError } = await supabase
        .from('financial_transactions')
        .select('*')
        .match(query)
        .single();

      if (existingError && existingError.code !== 'PGRST116') {
        return NextResponse.json({ error: existingError.message }, { status: 500 });
      }

      const record = {
        type: 'income',
        amount,
        quantity: quantity || 0,
        date,
        branch_id: branchId,
        product_id: productId,
        category: 'المبيعات',
        description: isWeekly
          ? 'تسجيل مبيعات أسبوعية مجمعة للفرع'
          : 'تسجيل مبيعات فعلية يومية للفرع',
      };

      if (existing) {
        await supabase
          .from('financial_transactions')
          .update(record)
          .match({ id: existing.id });
      } else if (amount > 0) {
        await supabase.from('financial_transactions').insert(record);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error saving actual sales:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
