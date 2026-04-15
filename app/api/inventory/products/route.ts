import { NextRequest, NextResponse } from 'next/server';
import { supabase, toCamel } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json((data ?? []).map(toCamel));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const payload = {
    name: body.name,
    weight: body.weight,
    purchase_price: body.purchasePrice,
    selling_price: body.sellingPrice,
  };
  const { data, error } = await supabase.from('products').insert(payload).select().single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(toCamel(data), { status: 201 });
}
