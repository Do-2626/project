import { NextRequest, NextResponse } from 'next/server';
import { supabase, pickSnake, toCamel } from '@/lib/supabase';
import { getUser } from '@/lib/auth';
import { transactionUpdateSchema } from '@/lib/validation';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = params.id;
  const body = await request.json();

  // Validate body with Zod
  const validatedBody = transactionUpdateSchema.parse(body);

  const payload = pickSnake(validatedBody, [
    'productId',
    'quantity',
    'type',
    'party',
    'date',
    'amount',
    'category',
    'branchId',
    'isRecurring',
  ]);

  const { data: updatedTransaction, error } = await supabase
    .from('transactions')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'المعاملة غير موجودة' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (updatedTransaction?.type === 'purchase' || updatedTransaction?.type === 'sale') {
    const financePayload = {
      amount: updatedTransaction.amount,
      date: updatedTransaction.date,
      party: updatedTransaction.party,
      quantity: updatedTransaction.quantity,
      product_id: updatedTransaction.product_id,
      branch_id: updatedTransaction.branch_id,
    };

    await supabase.from('financial_transactions').update(financePayload).eq('transaction_id', id);
  }

  return NextResponse.json(toCamel(updatedTransaction));
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = params.id;

  const { data: deletedTransaction, error: deleteError } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)
    .select()
    .single();

  if (deleteError) {
    if (deleteError.code === 'PGRST116') {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  await supabase.from('financial_transactions').delete().eq('transaction_id', id);

  return NextResponse.json({ message: 'Transaction deleted successfully' });
}