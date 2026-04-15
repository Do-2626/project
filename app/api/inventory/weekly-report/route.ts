import { NextRequest, NextResponse } from 'next/server';
import { supabase, toCamel } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  if (!startDate || !endDate) {
    return NextResponse.json({ error: 'startDate and endDate are required' }, { status: 400 });
  }

  try {
    const [inventoryRes, financialRes] = await Promise.all([
      supabase
        .from('transactions')
        .select('*, product_id(*), branch_id(*)')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true }),
      supabase
        .from('financial_transactions')
        .select('*, branch_id(*), expense_category_id(*)')
        .eq('type', 'expense')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true }),
    ]);

    if (inventoryRes.error) {
      console.error('Failed to fetch inventory weekly report', inventoryRes.error);
      return NextResponse.json({ error: inventoryRes.error.message }, { status: 500 });
    }
    if (financialRes.error) {
      console.error('Failed to fetch financial weekly report', financialRes.error);
      return NextResponse.json({ error: financialRes.error.message }, { status: 500 });
    }

    const combined = [
      ...(inventoryRes.data ?? []).map(toCamel),
      ...(financialRes.data ?? []).map((f) => ({
        ...toCamel(f),
        isFinancial: true,
        type: 'expense',
      })),
    ];

    combined.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    return NextResponse.json(combined);
  } catch (error) {
    console.error('Failed to fetch weekly report', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
