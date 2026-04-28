import { NextRequest, NextResponse } from 'next/server';
import { supabase, toCamel, pickSnake } from '@/lib/supabase';

// ============================================
// دوال مساعدة عامة
// ============================================
const processItem = (item: any) => ({
  ...toCamel(item),
  _id: item.id
});

// ============================================
// GET الرئيسية - جلب جميع البيانات الأساسية
// ============================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dataType = searchParams.get('type'); // لتحديد نوع البيانات المطلوبة
    
    // إذا كان الطلب لجلب المعاملات
    if (dataType === 'transactions') {
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');
      const type = searchParams.get('type');
      const contactId = searchParams.get('contactId');

      let query = supabase
        .from('transactions')
        .select(`
          *,
          contact:contacts(*),
          items:transaction_items(*, product:products(*))
        `)
        .order('date', { ascending: false });

      if (startDate) query = query.gte('date', startDate);
      if (endDate) query = query.lte('date', endDate);
      if (type) query = query.eq('type', type);
      if (contactId) query = query.eq('contact_id', contactId);

      const { data, error } = await query;
      if (error) throw error;

      const processedData = (data ?? []).map(processItem);
      return NextResponse.json(processedData);
    }

    // الطلب الافتراضي: جلب جميع البيانات الأساسية (لصفحة إدارة البيانات المركزية)
    const [branchesRes, productsRes, contactsRes, categoriesRes] = await Promise.all([
      supabase.from('branches').select('*').order('name'),
      supabase.from('products').select('*').order('name'),
      supabase.from('contacts').select('*').order('name'),
      supabase.from('expense_categories').select('*').order('name')
    ]);

    const process = (data: any[]) => (data ?? []).map(item => ({
      ...toCamel(item),
      _id: item.id // الربط الضروري لعمل الصفحة
    }));

    const allContacts = process(contactsRes.data ?? []);

    return NextResponse.json({
      branches: process(branchesRes.data ?? []),
      products: process(productsRes.data ?? []),
      contacts: allContacts.filter(c => c.type !== 'supplier'),
      suppliers: allContacts.filter(c => c.type === 'supplier'),
      categories: process(categoriesRes.data ?? [])
    });

  } catch (error: any) {
    console.error('Error in GET /api/v2/master-data:', error);
    return NextResponse.json(
      { error: error.message || 'فشل في جلب البيانات' },
      { status: 500 }
    );
  }
}

// ============================================
// POST - إنشاء معاملة جديدة
// ============================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // التحقق إذا كانت البيانات قادمة بصيغة المصفوفة (للتعدد)
    const items = Array.isArray(body) ? body : [body];
    const results: any[] = [];

    for (const item of items) {
      // استخدام pickSnake للتوافق مع الكود الأصلي
      const payload = pickSnake(item, [
        'productId', 'quantity', 'type', 'party', 'date', 
        'amount', 'category', 'branchId', 'isRecurring'
      ]);

      // إضافة أمر الحفظ الفعلي
      const { data, error } = await supabase
        .from('transactions')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      
      results.push(processItem(data));
    }

    return NextResponse.json(
      Array.isArray(body) ? results : results[0],
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Error in POST /api/v2/master-data:', error);
    return NextResponse.json(
      { error: error.message || 'فشل في إنشاء المعاملة' },
      { status: 500 }
    );
  }
}