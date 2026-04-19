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
      return NextResponse.json({ error: 'Date or range is required' }, { status: 400 });
    }

    const productRes = await supabase.from('products').select('*');
    if (productRes.error) {
      return NextResponse.json({ error: productRes.error.message }, { status: 500 });
    }

  const baseBeforeQuery = supabase.from('transactions').select('product_id, type, quantity').lt('date', startDate);
  const baseAfterQuery = supabase.from('transactions').select('product_id, type, quantity').lte('date', endDate);
  const duringInventoryQuery = supabase
    .from('transactions')
    .select('product_id, type, quantity, branch_id')
    .gte('date', startDate)
    .lte('date', endDate);
  const duringFinanceQuery = supabase
    .from('financial_transactions')
    .select('product_id, amount, quantity, date, type, branch_id, expense_category_id')
    .gte('date', startDate)
    .lte('date', endDate)
    .in('type', ['expense', 'income']);

  if (branchId) {
    baseBeforeQuery.eq('branch_id', branchId);
    baseAfterQuery.eq('branch_id', branchId);
    duringInventoryQuery.eq('branch_id', branchId);
    duringFinanceQuery.eq('branch_id', branchId);
  }

  const [beforeRes, duringInventoryRes, duringFinanceRes, afterRes, actualSalesRes] = await Promise.all([
    baseBeforeQuery,
    duringInventoryQuery,
    duringFinanceQuery,
    baseAfterQuery,
    supabase
      .from('financial_transactions')
      .select('product_id, amount, quantity, date')
      .gte('date', startDate)
      .lte('date', endDate)
      .eq('type', 'income')
      .not('product_id', 'is', null),
  ]);

  if (beforeRes.error) return NextResponse.json({ error: beforeRes.error.message }, { status: 500 });
  if (duringInventoryRes.error) return NextResponse.json({ error: duringInventoryRes.error.message }, { status: 500 });
  if (duringFinanceRes.error) return NextResponse.json({ error: duringFinanceRes.error.message }, { status: 500 });
  if (afterRes.error) return NextResponse.json({ error: afterRes.error.message }, { status: 500 });
  if (actualSalesRes.error) return NextResponse.json({ error: actualSalesRes.error.message }, { status: 500 });

  const products = productRes.data ?? [];
  const before = beforeRes.data ?? [];
  const duringInventory = duringInventoryRes.data ?? [];
  const duringFinance = duringFinanceRes.data ?? [];
  const actualSales = actualSalesRes.data ?? [];

  const aggregateByProduct = (rows: any[]) =>
    rows.reduce((map, row) => {
      const key = String(row.product_id);
      const item = map[key] || { purchase: 0, outgoing: 0, incoming: 0, damaged: 0, sale: 0 };
      if (row.type === 'purchase') item.purchase += row.quantity ?? 0;
      if (row.type === 'outgoing') item.outgoing += row.quantity ?? 0;
      if (row.type === 'incoming') item.incoming += row.quantity ?? 0;
      if (row.type === 'damaged') item.damaged += row.quantity ?? 0;
      if (row.type === 'sale') item.sale += row.quantity ?? 0;
      map[key] = item;
      return map;
    }, {} as Record<string, any>);

  const beforeMap = aggregateByProduct(before);
  const afterMap = aggregateByProduct(afterRes.data ?? []);
  const actualSalesMap = (actualSales as any[]).reduce((map, row) => {
    const key = String(row.product_id);
    map[key] = {
      totalAmount: (map[key]?.totalAmount || 0) + (row.amount || 0),
      totalQuantity: (map[key]?.totalQuantity || 0) + (row.quantity || 0),
    };
    return map;
  }, {} as Record<string, any>);

  const during = [
    ...(duringInventory as any[]).map(toCamel),
    ...(duringFinance as any[]).map((item) => ({ ...toCamel(item), isFinancial: true })),
  ];

  const report = (products as any[])
    .map((prod) => {
      const productIdStr = String(prod.id);
      const b = beforeMap[productIdStr] || { purchase: 0, outgoing: 0, incoming: 0, damaged: 0, sale: 0 };
      const a = afterMap[productIdStr] || { purchase: 0, outgoing: 0, incoming: 0, damaged: 0, sale: 0 };

      const periodLoading = (duringInventory as any[])
        .filter((t) => String(t.product_id) === productIdStr && t.type === 'outgoing')
        .reduce((acc, curr) => acc + (curr.quantity || 0), 0);
      const periodReturns = (duringInventory as any[])
        .filter((t) => String(t.product_id) === productIdStr && t.type === 'incoming')
        .reduce((acc, curr) => acc + (curr.quantity || 0), 0);

      return {
        product: toCamel(prod),
        startQty: (b.purchase + b.incoming) - (b.outgoing + b.damaged + b.sale),
        endQty: (a.purchase + a.incoming) - (a.outgoing + a.damaged + a.sale),
        expectedSales: periodLoading - periodReturns,
        actualSalesAmount: actualSalesMap[productIdStr]?.totalAmount || 0,
        actualSalesQty: actualSalesMap[productIdStr]?.totalQuantity || 0,
        hasActivity:
          periodLoading !== 0 || periodReturns !== 0 || (actualSalesMap[productIdStr]?.totalQuantity || 0) !== 0,
      };
    })
    .filter((item) => item.startQty !== 0 || item.endQty !== 0 || item.hasActivity);

  return NextResponse.json({ report, during });
  } catch (error: any) {
    console.error('Daily report failed:', error);
    return NextResponse.json({ error: error?.message || 'Unknown error' }, { status: 500 });
  }
}
