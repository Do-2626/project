import { NextRequest, NextResponse } from 'next/server';
import { supabase, toCamel } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const startDate = searchParams.get('startDate') || date;
    const endDate = searchParams.get('endDate') || date;
    const branchId = searchParams.get('branchId');

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'التاريخ مطلوب' }, { status: 400 });
    }

    // تنفيذ استعلامات متوازية لتقليل زمن الاستجابة (توصية الأداء)
    const [productsRes, snapshotRes, summaryRes, duringInvRes, duringFinRes] = await Promise.all([
      supabase.from('products').select('*').order('name'),
      
      // جلب الأرصدة من آخر Snapshot (الأرصدة الافتتاحية)
      supabase.from('inventory_snapshots')
        .select('product_id, quantity_on_hand')
        .lt('snapshot_date', startDate)
        .order('snapshot_date', { ascending: false }),

      // استخدام SQL Aggregation (توصية الأداء) لملخص الكميات
      supabase.rpc('get_inventory_summary_v2', { 
        p_start_date: startDate, 
        p_end_date: endDate,
        p_branch_id: branchId || null
      }),

      // سجل العمليات المخزنية (للعرض في سجل العمليات بالصفحة)
      supabase.from('transactions')
        .select('*, product_id(*), branch_id(*)')
        .gte('date', startDate)
        .lte('date', endDate)
        .eq(branchId ? 'branch_id' : '', branchId || ''),

      // سجل العمليات المالية (المصاريف والدخل المرتبط بالمنتجات)
      supabase.from('financial_transactions')
        .select('*, product_id(*), branch_id(*), expense_category_id(*)')
        .gte('date', startDate)
        .lte('date', endDate)
        .in('type', ['expense', 'income'])
        .eq(branchId ? 'branch_id' : '', branchId || '')
    ]);

    if (summaryRes.error) throw summaryRes.error;

    const products = productsRes.data ?? [];
    const snapshots = snapshotRes.data ?? [];
    const summary = summaryRes.data ?? [];

    // بناء الـ report المطلوب لجدول InventoryTable
    const report = products.map(prod => {
      const stats = summary.find((s: any) => s.product_id === prod.id) || {};
      const snap = snapshots.find((sn: any) => sn.product_id === prod.id) || { quantity_on_hand: 0 };
      
      const openingBalance = Number(snap.quantity_on_hand);
      const netChange = Number(stats.net_change) || 0;

      return {
        ...toCamel(prod),
        _id: prod.id, // لضمان التوافق مع مكونات Frontend التي تستخدم _id [2]
        openingBalance,
        purchase: Number(stats.qty_purchase) || 0,
        sale: Number(stats.qty_sale) || 0,
        incoming: Number(stats.qty_incoming) || 0,
        outgoing: Number(stats.qty_outgoing) || 0,
        damaged: Number(stats.qty_damaged) || 0,
        closingBalance: openingBalance + netChange
      };
    });

    // بناء مصفوفة during لعرض "سجل العمليات" أسفل الصفحة
    const during = [
      ...(duringInvRes.data ?? []).map(toCamel),
      ...(duringFinRes.data ?? []).map(item => ({ ...toCamel(item), isFinancial: true }))
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return NextResponse.json({ report, during });

  } catch (error: any) {
    console.error('Inventory report failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
