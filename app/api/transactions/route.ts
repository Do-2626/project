import { NextRequest, NextResponse } from 'next/server';
import { supabase, pickSnake, toCamel } from '@/lib/supabase';
import { getUser } from '@/lib/auth';
import { transactionSchema } from '@/lib/validation';

export async function GET(req: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');

  let query = supabase
    .from('transactions')
    .select('*, product_id(*), branch_id(*)')
    .order('date', { ascending: true })
    .limit(limit)
    .range(offset, offset + limit - 1);

  if (date) {
    query = query.eq('date', date);
  } else if (startDate && endDate) {
    query = query.gte('date', startDate).lte('date', endDate);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json((data ?? []).map(toCamel));
}

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const items = Array.isArray(body) ? body : [body];

  // Validate items with Zod
  const validatedItems = items.map(item => transactionSchema.parse(item));

  const results: any[] = [];

  for (const item of items) {
    const payload = pickSnake(item, [
      'productId',
      'quantity',
      'type',
      'party',
      'date',
      'amount',
      'category',
      'branchId',
      'isRecurring',
    ]);

    const { data: insertedTransaction, error: transactionError } = await supabase
      .from('transactions')
      .insert(payload)
      .select()
      .single();

    if (transactionError) {
      return NextResponse.json({ error: transactionError.message }, { status: 500 });
    }

    if (item.type === 'purchase' || item.type === 'sale') {
      const financialPayload = {
        type: item.type === 'purchase' ? 'purchase' : 'income',
        amount: item.amount,
        category: item.type === 'purchase' ? 'المشتريات' : 'المبيعات',
        date: item.date,
        party: item.party,
        branch_id: item.branchId,
        product_id: item.productId,
        quantity: item.quantity,
        transaction_id: insertedTransaction.id,
      };

      const { error: financeError } = await supabase.from('financial_transactions').insert(financialPayload);
      if (financeError) {
        return NextResponse.json({ error: financeError.message }, { status: 500 });
      }
    }

    results.push(toCamel(insertedTransaction));
  }

  return NextResponse.json(Array.isArray(body) ? results : results[0], { status: 201 });
}
