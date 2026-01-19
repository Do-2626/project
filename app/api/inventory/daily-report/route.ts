import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Transaction from '@/models/Transaction';
import Product from '@/models/Product';
import Branch from '@/models/Branch';
import FinancialTransaction from '@/models/FinancialTransaction';
import { dbConnect } from '@/lib/mongoose';

// احسب حالة المخزون في بداية ونهاية اليوم
export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url!);
  const date = searchParams.get('date');
  const startDate = searchParams.get('startDate') || date;
  const endDate = searchParams.get('endDate') || date;
  const branchId = searchParams.get('branchId');

  if (!startDate || !endDate) {
    return NextResponse.json({ error: "Date or range is required" }, { status: 400 });
  }

  const matchStageBefore: any = { date: { $lt: startDate } };
  const matchStageAfter: any = { date: { $lte: endDate } };
  const duringInventoryFilter: any = { date: { $gte: startDate, $lte: endDate } };
  const duringFinanceFilter: any = { date: { $gte: startDate, $lte: endDate }, type: { $in: ['expense', 'income'] } };

  if (branchId) {
    const bId = new mongoose.Types.ObjectId(branchId);
    matchStageBefore.branchId = bId;
    matchStageAfter.branchId = bId;
    duringInventoryFilter.branchId = bId;
    duringFinanceFilter.branchId = bId;
  }

  // جميع المنتجات
  const products = await Product.find({});

  // العمليات حتى بداية اليوم (قبل هذا اليوم)
  const before = await Transaction.aggregate([
    { $match: matchStageBefore },
    {
      $group: {
        _id: '$productId',
        purchase: { $sum: { $cond: [{ $eq: ['$type', 'purchase'] }, '$quantity', 0] } },
        outgoing: { $sum: { $cond: [{ $eq: ['$type', 'outgoing'] }, '$quantity', 0] } },
        incoming: { $sum: { $cond: [{ $eq: ['$type', 'incoming'] }, '$quantity', 0] } },
        damaged: { $sum: { $cond: [{ $eq: ['$type', 'damaged'] }, '$quantity', 0] } },
        sale: { $sum: { $cond: [{ $eq: ['$type', 'sale'] }, '$quantity', 0] } },
      }
    }
  ]);

  // العمليات المخزنية خلال اليوم
  const duringInventory = await Transaction.find(duringInventoryFilter).populate('productId').populate('branchId');

  // العمليات المالية (المصاريف) خلال اليوم
  const duringFinance = await FinancialTransaction.find(duringFinanceFilter).populate('branchId').populate('expenseCategoryId');

  // دمج العمليات
  const during = [
    ...duringInventory.map(t => t.toObject()),
    ...duringFinance.map(f => ({
      ...f.toObject(),
      isFinancial: true
    }))
  ];

  // العمليات حتى نهاية اليوم (<= هذا اليوم)
  const after = await Transaction.aggregate([
    { $match: matchStageAfter },
    {
      $group: {
        _id: '$productId',
        purchase: { $sum: { $cond: [{ $eq: ['$type', 'purchase'] }, '$quantity', 0] } },
        outgoing: { $sum: { $cond: [{ $eq: ['$type', 'outgoing'] }, '$quantity', 0] } },
        incoming: { $sum: { $cond: [{ $eq: ['$type', 'incoming'] }, '$quantity', 0] } },
        damaged: { $sum: { $cond: [{ $eq: ['$type', 'damaged'] }, '$quantity', 0] } },
        sale: { $sum: { $cond: [{ $eq: ['$type', 'sale'] }, '$quantity', 0] } },
      }
    }
  ]);

  // المبيعات المسجلة فعلياً (كمية ومبالغ)
  const actualSalesAggr = await FinancialTransaction.aggregate([
    { $match: { ...duringFinanceFilter, type: 'income', productId: { $exists: true } } },
    {
      $group: {
        _id: '$productId',
        totalAmount: { $sum: '$amount' },
        totalQuantity: { $sum: '$quantity' }
      }
    }
  ]);

  // تحويل النتائج إلى كائنات يسهل التعامل معها
  const beforeMap = Object.fromEntries(before.map(b => [String(b._id), b]));
  const afterMap = Object.fromEntries(after.map(b => [String(b._id), b]));
  const actualSalesMap = Object.fromEntries(actualSalesAggr.map(s => [String(s._id), s]));

  // بناء تقرير لكل منتج
  const report = products.map(prod => {
    const productIdStr = String(prod._id);
    const b = beforeMap[productIdStr] || { purchase: 0, outgoing: 0, incoming: 0, damaged: 0, sale: 0 };
    const a = afterMap[productIdStr] || { purchase: 0, outgoing: 0, incoming: 0, damaged: 0, sale: 0 };

    // حساب المبيعات المتوقعة للفترة المختارة: إجمالي التحميل - إجمالي المرتجع خلال هذه الفترة
    // هذا يدعم المناديب الذين يسوون حساباتهم بعد عدة أيام عند اختيار الفترة (أسبوع مثلاً)
    const periodLoading = duringInventory.filter(t => String(t.productId._id) === productIdStr && t.type === 'outgoing').reduce((acc, curr) => acc + curr.quantity, 0);
    const periodReturns = duringInventory.filter(t => String(t.productId._id) === productIdStr && t.type === 'incoming').reduce((acc, curr) => acc + curr.quantity, 0);

    return {
      product: prod,
      startQty: (b.purchase + b.incoming) - (b.outgoing + b.damaged + b.sale),
      endQty: (a.purchase + a.incoming) - (a.outgoing + a.damaged + a.sale),
      expectedSales: (periodLoading - periodReturns),
      actualSalesAmount: actualSalesMap[productIdStr]?.totalAmount || 0,
      actualSalesQty: actualSalesMap[productIdStr]?.totalQuantity || 0
    };
  });

  return NextResponse.json({
    report,
    during
  });
}
