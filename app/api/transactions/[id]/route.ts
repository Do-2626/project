import { NextRequest, NextResponse } from 'next/server';
import { supabase, toCamel } from '@/lib/supabase';

// دالة مساعدة لتحويل camelCase إلى snake_case للإدخال في قاعدة البيانات
const pickSnake = (obj: any, keys: string[]) => {
  const snakeMap: Record<string, string> = {
    productId: 'product_id',
    branchId: 'branch_id',
    isRecurring: 'is_recurring'
  };
  
  const result: any = {};
  for (const key of keys) {
    if (obj[key] !== undefined) {
      const snakeKey = snakeMap[key] || key;
      result[snakeKey] = obj[key];
    }
  }
  return result;
};

// دالة مساعدة لتحويل البيانات من قاعدة البيانات مع إضافة _id
const processTransaction = (item: any) => ({
  ...toCamel(item),
  _id: item.id  // تحويل id إلى _id لضمان توافق واجهة المستخدم
});

// ============================================
// GET: جلب المعاملات
// ============================================
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

    // معالجة البيانات وإضافة _id
    const processedData = (data ?? []).map(processTransaction);

    return NextResponse.json(processedData);

  } catch (error: any) {
    console.error('Error in GET /api/transactions:', error);
    return NextResponse.json(
      { error: error.message || 'فشل في جلب المعاملات' },
      { status: 500 }
    );
  }
}

// ============================================
// POST: إنشاء معاملة جديدة
// ============================================
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

      // إضافة الجزء المفقود: تنفيذ الإدخال الفعلي في قاعدة البيانات
      const { data, error } = await supabase
        .from('transactions')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      
      // تحويل البيانات وإضافة _id لضمان توافق واجهة المستخدم
      results.push(processTransaction(data));
    }

    // إرجاع النتائج بعد الحفظ بنجاح
    // إذا كان الإدخال مفرداً نرجع الكائن، وإذا كان مصفوفة نرجع المصفوفة
    return NextResponse.json(
      Array.isArray(body) ? results : results[0], 
      { status: 201 }
    );
    
  } catch (error: any) {
    console.error("Error in POST /api/transactions:", error);
    return NextResponse.json(
      { error: error.message || 'فشل في إنشاء المعاملة' },
      { status: 500 }
    );
  }
}

// ============================================
// PUT: تحديث معاملة (اختياري - للاكتمال)
// ============================================
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'معرف المعاملة مطلوب' },
        { status: 400 }
      );
    }

    const payload = pickSnake(updateData, [
      'productId', 'quantity', 'type', 'party', 'date', 
      'amount', 'category', 'branchId', 'isRecurring'
    ]);

    const { data, error } = await supabase
      .from('transactions')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        { error: 'المعاملة غير موجودة' },
        { status: 404 }
      );
    }

    return NextResponse.json(processTransaction(data));

  } catch (error: any) {
    console.error("Error in PUT /api/transactions:", error);
    return NextResponse.json(
      { error: error.message || 'فشل في تحديث المعاملة' },
      { status: 500 }
    );
  }
}

// ============================================
// DELETE: حذف معاملة (اختياري - للاكتمال)
// ============================================
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'معرف المعاملة مطلوب' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json(
      { message: 'تم حذف المعاملة بنجاح', _id: id },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Error in DELETE /api/transactions:", error);
    return NextResponse.json(
      { error: error.message || 'فشل في حذف المعاملة' },
      { status: 500 }
    );
  }
}