import { NextRequest, NextResponse } from 'next/server';
import { supabase, toCamel, pickSnake } from '@/lib/supabase';

// GET: جلب المعاملات
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type');
    const party = searchParams.get('party');

    let query = supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    // تطبيق الفلاتر
    if (startDate) query = query.gte('date', startDate);
    if (endDate) query = query.lte('date', endDate);
    if (type) query = query.eq('type', type);
    if (party) query = query.eq('party', party);

    const { data, error } = await query;

    if (error) throw error;

    // تحويل البيانات وإضافة _id
    const processedData = (data ?? []).map((item: any) => ({
      ...toCamel(item),
      _id: item.id
    }));

    return NextResponse.json(processedData);

  } catch (error: any) {
    console.error('Error in GET /api/transactions:', error);
    return NextResponse.json(
      { error: error.message || 'فشل في جلب المعاملات' },
      { status: 500 }
    );
  }
}

// POST: إنشاء معاملة جديدة (باستخدام الكود الذي قدمته)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items = Array.isArray(body) ? body : [body];
    const results: any[] = [];

    for (const item of items) {
      const payload = pickSnake(item, [
        'productId', 'quantity', 'type', 'party', 'date', 
        'amount', 'category', 'branchId', 'isRecurring'
      ]);

      // إضافة أمر الحفظ المفقود في المصدر
      const { data, error } = await supabase
        .from('transactions')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      
      // تحويل البيانات وإضافة _id
      results.push({
        ...toCamel(data),
        _id: data.id
      });
    }

    // إرجاع نفس الشكل الذي استقبلته (مفرد أو مصفوفة)
    return NextResponse.json(
      Array.isArray(body) ? results : results[0], 
      { status: 201 }
    );
    
  } catch (error: any) {
    console.error('Error in POST /api/transactions:', error);
    return NextResponse.json(
      { error: error.message || 'فشل في إنشاء المعاملة' },
      { status: 500 }
    );
  }
}