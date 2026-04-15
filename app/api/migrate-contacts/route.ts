import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const [transactionsRes, financialRes, branchesRes] = await Promise.all([
      supabase.from('transactions').select('party'),
      supabase.from('financial_transactions').select('party'),
      supabase.from('branches').select('name'),
    ]);

    if (transactionsRes.error) {
      return NextResponse.json({ success: false, error: transactionsRes.error.message }, { status: 500 });
    }
    if (financialRes.error) {
      return NextResponse.json({ success: false, error: financialRes.error.message }, { status: 500 });
    }
    if (branchesRes.error) {
      return NextResponse.json({ success: false, error: branchesRes.error.message }, { status: 500 });
    }

    const branchNames = new Set((branchesRes.data ?? []).map((b: any) => b.name));
    const parties = Array.from(new Set([
      ...(transactionsRes.data ?? []).map((row: any) => row.party),
      ...(financialRes.data ?? []).map((row: any) => row.party),
    ]))
      .filter((p) => p && p.trim() !== '' && !branchNames.has(p));

    let count = 0;
    for (const name of parties) {
      const { data: existing, error: existingError } = await supabase
        .from('contacts')
        .select('id')
        .eq('name', name)
        .single();

      if (existingError && existingError.code !== 'PGRST116') {
        return NextResponse.json({ success: false, error: existingError.message }, { status: 500 });
      }

      if (!existing) {
        const { error: insertError } = await supabase.from('contacts').insert({ name, type: 'other' });
        if (insertError) {
          return NextResponse.json({ success: false, error: insertError.message }, { status: 500 });
        }
        count++;
      }
    }

    return NextResponse.json({ success: true, migratedCount: count });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
