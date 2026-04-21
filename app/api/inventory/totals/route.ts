import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: products, error: productError } = await supabase
    .from('products')
    .select('id, purchase_price');

  if (productError) {
    return NextResponse.json({ error: productError.message }, { status: 500 });
  }

  const { data: transactions, error: transactionError } = await supabase
    .from('transactions')
    .select('product_id, quantity, type');

  if (transactionError) {
    return NextResponse.json({ error: transactionError.message }, { status: 500 });
  }

  const stockMap = new Map<string, number>();
  transactions?.forEach((t: any) => {
    const qty = stockMap.get(t.product_id) || 0;
    if (t.type === 'purchase' || t.type === 'incoming') {
      stockMap.set(t.product_id, qty + t.quantity);
    } else if (t.type === 'outgoing' || t.type === 'damaged' || t.type === 'sale') {
      stockMap.set(t.product_id, qty - t.quantity);
    }
  });

  let totalValue = 0;
  products?.forEach((p: any) => {
    const stock = stockMap.get(p.id) || 0;
    totalValue += stock * (p.purchase_price || 0);
  });

  return NextResponse.json({ totalValue });
}