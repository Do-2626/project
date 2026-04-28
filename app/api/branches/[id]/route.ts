import { NextRequest, NextResponse } from 'next/server';
import { supabase, pickSnake, toCamel } from '@/lib/supabase';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const body = await req.json();

  const payload = pickSnake(body, ['name', 'location', 'settlementType', 'isActive']);
  if (body.isActive !== undefined) payload.is_active = body.isActive;

  const { data, error } = await supabase
    .from('branches')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: 'لم يتم العثور على الفرع' }, { status: 404 });
  }

  return NextResponse.json({
    ...toCamel(data),
    _id: data.id
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  const { data, error } = await supabase
    .from('branches')
    .update({ is_active: false })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: 'لم يتم العثور على الفرع' }, { status: 404 });
  }

  return NextResponse.json({
    message: 'Branch deleted successfully',
    branch: {
      ...toCamel(data),
      _id: data.id
    }
  });
}
