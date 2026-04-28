import { NextRequest, NextResponse } from 'next/server';
import { supabase, pickSnake, toCamel } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json((data ?? []).map(item => ({
    ...toCamel(item),
    _id: item.id
  })));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  
  // دعم إضافة منتج واحد أو عدة منتجات
  const productsArray = Array.isArray(body) ? body : [body];
  
  const payloads = productsArray.map(item => 
    pickSnake(item, ['name', 'weight', 'purchasePrice', 'sellingPrice'])
  );
  
  const { data, error } = await supabase.from('products').insert(payloads).select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ error: 'فشل إضافة المنتجات' }, { status: 500 });
  }

  return NextResponse.json((data ?? []).map(item => ({
    ...toCamel(item),
    _id: item.id
  })), { status: 201 });
}
