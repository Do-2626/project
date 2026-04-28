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
    console.error("❌ Database error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  console.log(`📊 Contacts fetched: ${data?.length || 0} records (type: ${type || 'all'})`);

  // تحويل البيانات وإضافة _id للتوافق مع واجهة المستخدم
  const processedData = (data ?? []).map(item => ({
    ...toCamel(item),
    _id: item.id // ضمان وجود _id للتوافق مع المكون Modal
  }));

  return NextResponse.json(processedData);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const payload = pickSnake(body, ['name', 'type', 'phone']);

  const { data, error } = await supabase.from('contacts').insert(payload).select().single();
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ success: false, error: 'فشل إنشاء جهة الاتصال' }, { status: 500 });
  }

  return NextResponse.json({
    ...toCamel(data),
    _id: data.id
  });
}
