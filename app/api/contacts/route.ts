import { NextRequest, NextResponse } from 'next/server';
import { supabase, pickSnake, toCamel } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  let query = supabase.from('contacts').select('*').order('name', { ascending: true });

  if (type) {
    query = query.eq('type', type);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json((data ?? []).map(toCamel));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const payload = pickSnake(body, ['name', 'type', 'phone']);

  const { data, error } = await supabase.from('contacts').insert(payload).select().single();
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json(toCamel(data));
}
