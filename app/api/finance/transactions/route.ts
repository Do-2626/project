import { NextRequest, NextResponse } from 'next/server';
import { supabase, pickSnake, toCamel } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  const category = searchParams.get('category');
  const type = searchParams.get('type');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  let query = supabase
    .from('financial_transactions')
    .select('*, product_id(*), branch_id(*)')
    .order('date', { ascending: true });

  if (date) query = query.eq('date', date);
  if (category) query = query.eq('category', category);
  if (type) query = query.eq('type', type);
  if (startDate && endDate) query = query.gte('date', startDate).lte('date', endDate);

  const { data, error } = await query;
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

  try {
    if (body.type === 'purchase') {
      if (!body.productId) {
        return NextResponse.json({ message: 'يجب تحديد المنتج لعمليات الشراء' }, { status: 400 });
      }
      if (!body.quantity || body.quantity <= 0) {
        return NextResponse.json({ message: 'يجب تحديد كمية صالحة للشراء' }, { status: 400 });
      }

      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id')
        .eq('id', body.productId)
        .single();

      if (productError) {
        if (productError.code === 'PGRST116') {
          return NextResponse.json({ message: 'المنتج غير موجود' }, { status: 404 });
        }
        return NextResponse.json({ message: productError.message }, { status: 500 });
      }

      if (!product) {
        return NextResponse.json({ message: 'المنتج غير موجود' }, { status: 404 });
      }

      const financialPayload = pickSnake(body, [
        'type',
        'amount',
        'category',
        'description',
        'party',
        'date',
        'invoiceNumber',
        'productId',
        'quantity',
        'branchId',
        'expenseCategoryId',
        'expenseSubtype',
        'transactionId',
        'isRecurring',
      ]);

      const { data: financialTransaction, error: financialError } = await supabase
        .from('financial_transactions')
        .insert(financialPayload)
        .select()
        .single();

      if (financialError) {
        return NextResponse.json({ message: financialError.message }, { status: 500 });
      }

      if (!financialTransaction) {
        return NextResponse.json({ message: 'فشل إنشاء المعاملة المالية' }, { status: 500 });
      }

      const inventoryPayload = {
        product_id: body.productId,
        quantity: body.quantity,
        type: 'purchase',
        party: body.party,
        date: body.date,
        amount: body.amount,
        category: body.category,
        branch_id: body.branchId,
        is_recurring: body.isRecurring || false,
      };

      const { error: inventoryError } = await supabase.from('transactions').insert(inventoryPayload);
      if (inventoryError) {
        return NextResponse.json({ message: inventoryError.message }, { status: 500 });
      }

      return NextResponse.json({
        ...toCamel(financialTransaction),
        _id: financialTransaction.id
      }, { status: 201 });
    }

    const payload = pickSnake(body, [
      'type',
      'amount',
      'category',
      'description',
      'party',
      'date',
      'invoiceNumber',
      'productId',
      'quantity',
      'branchId',
      'expenseCategoryId',
      'expenseSubtype',
      'transactionId',
      'isRecurring',
    ]);

    const { data: transaction, error } = await supabase
      .from('financial_transactions')
      .insert(payload)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    if (!transaction) {
      return NextResponse.json({ message: 'فشل إنشاء المعاملة المالية' }, { status: 500 });
    }

    return NextResponse.json({
      ...toCamel(transaction),
      _id: transaction.id
    }, { status: 201 });
  } catch (error) {
    console.error('خطأ في إنشاء المعاملة المالية:', error);
    let errorMessage = 'حدث خطأ أثناء معالجة الطلب';
    if (error instanceof Error) {
      errorMessage = `${errorMessage}: ${error.message}`;
    }

    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ message: 'يجب تحديد معرف المعاملة' }, { status: 400 });
  }

  const { data: transaction, error: transactionError } = await supabase
    .from('financial_transactions')
    .select('*')
    .eq('id', id)
    .single();

  if (transactionError) {
    if (transactionError.code === 'PGRST116') {
      return NextResponse.json({ message: 'المعاملة غير موجودة' }, { status: 404 });
    }
    return NextResponse.json({ message: transactionError.message }, { status: 500 });
  }

  if (!transaction) {
    return NextResponse.json({ message: 'المعاملة غير موجودة' }, { status: 404 });
  }

  if (transaction.type === 'purchase') {
    await supabase.from('transactions').delete().match({
      product_id: transaction.product_id,
      date: transaction.date,
      type: 'purchase',
      quantity: transaction.quantity,
    });
  }

  const { error: deleteError } = await supabase.from('financial_transactions').delete().eq('id', id);
  if (deleteError) {
    return NextResponse.json({ message: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'تم حذف المعاملة بنجاح' });
}
