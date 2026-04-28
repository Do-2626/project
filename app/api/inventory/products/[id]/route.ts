import { NextRequest, NextResponse } from 'next/server';
import { supabase, toCamel } from '@/lib/supabase';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { data, error } = await supabase.from('products').select('*').eq('id', params.id).single();
  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'المنتج غير موجود' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (!data) {
    return NextResponse.json({ error: 'المنتج غير موجود' }, { status: 404 });
  }
  return NextResponse.json({
    ...toCamel(data),
    _id: data.id
  });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const payload = {
    name: body.name,
    weight: body.weight,
    purchase_price: body.purchasePrice,
    selling_price: body.sellingPrice,
  };

  const { data, error } = await supabase
    .from('products')
    .update(payload)
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'المنتج غير موجود' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (!data) {
    return NextResponse.json({ error: 'المنتج غير موجود' }, { status: 404 });
  }

  return NextResponse.json({
    ...toCamel(data),
    _id: data.id
  });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await supabase.from('products').delete().eq('id', params.id);
  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'المنتج غير موجود' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}
