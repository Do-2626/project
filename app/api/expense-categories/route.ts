import { NextRequest, NextResponse } from 'next/server';
import { supabase, pickSnake, toCamel } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { data, error } = await supabase
    .from('expense_categories')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json((data ?? []).map(toCamel));
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.name) {
    return NextResponse.json({ error: 'اسم النوع مطلوب' }, { status: 400 });
  }

  const { data: existing, error: existingError } = await supabase
    .from('expense_categories')
    .select('id')
    .eq('name', body.name)
    .single();

  if (existingError && existingError.code !== 'PGRST116') {
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }

  if (existing) {
    return NextResponse.json({ error: 'هذا النوع موجود بالفعل' }, { status: 400 });
  }

  const payload = {
    ...pickSnake(body, ['name', 'classification', 'isActive']),
    is_active: body.isActive ?? true,
  };

  const { data, error } = await supabase.from('expense_categories').insert(payload).select().single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(toCamel(data), { status: 201 });
}
