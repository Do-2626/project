import { NextRequest, NextResponse } from 'next/server';
import { supabase, toCamel } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const startDate = searchParams.get('startDate') || date;
    const endDate = searchParams.get('endDate') || date;
    const branchId = searchParams.get('branchId');

    const [prodRes, snapRes, summRes, invRes, finRes] = await Promise.all([
      supabase.from('products').select('*').order('name'),
      supabase.from('inventory_snapshots').select('*').lt('snapshot_date', startDate),
      supabase.rpc('get_inventory_summary_v2', { p_start_date: startDate, p_end_date: endDate, p_branch_id: branchId || null }),
      supabase.from('transactions').select('*, product_id(*)').gte('date', startDate).lte('date', endDate),
      supabase.from('financial_transactions').select('*, product_id(*)').gte('date', startDate).lte('date', endDate)
    ]);

    const report = (prodRes.data ?? []).map(prod => {
      const stats = (summRes.data as any[])?.find(s => s.product_id === prod.id) || {};
      const snap = (snapRes.data as any[])?.find(sn => sn.product_id === prod.id) || { quantity_on_hand: 0 };
      const opening = Number(snap.quantity_on_hand);

      return {
        ...toCamel(prod),
        _id: prod.id, // للتوافق مع التعديل في Frontend [4]
        openingBalance: opening,
        purchase: Number(stats.qty_purchase) || 0,
        sale: Number(stats.qty_sale) || 0,
        incoming: Number(stats.qty_incoming) || 0,
        outgoing: Number(stats.qty_outgoing) || 0,
        damaged: Number(stats.qty_damaged) || 0,
        closingBalance: opening + (Number(stats.net_change) || 0)
      };
    });

    const during = [
      ...(invRes.data ?? []).map(toCamel),
      ...(finRes.data ?? []).map(item => ({ ...toCamel(item), isFinancial: true }))
    ];

    return NextResponse.json({ report, during });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

