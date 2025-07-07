import { NextRequest, NextResponse } from 'next/server';
import Transaction from '@/models/Transaction';
import Product from '@/models/Product';
import { dbConnect } from '@/lib/mongoose';

// احسب حالة المخزون في بداية ونهاية اليوم
export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url!);
  const date = searchParams.get('date');
  if (!date) return NextResponse.json({ error: 'date required' }, { status: 400 });

  // جميع المنتجات
  const products = await Product.find({});

  // العمليات حتى بداية اليوم (قبل هذا اليوم)
  const before = await Transaction.aggregate([
    { $match: { date: { $lt: date } } },
    { $group: {
      _id: '$productId',
      purchase: { $sum: { $cond: [{ $eq: ['$type', 'purchase'] }, '$quantity', 0] } },
      outgoing: { $sum: { $cond: [{ $eq: ['$type', 'outgoing'] }, '$quantity', 0] } },
      incoming: { $sum: { $cond: [{ $eq: ['$type', 'incoming'] }, '$quantity', 0] } },
      damaged: { $sum: { $cond: [{ $eq: ['$type', 'damaged'] }, '$quantity', 0] } },
    } }
  ]);

  // العمليات خلال اليوم
  const during = await Transaction.find({ date }).populate('productId');

  // العمليات حتى نهاية اليوم (<= هذا اليوم)
  const after = await Transaction.aggregate([
    { $match: { date: { $lte: date } } },
    { $group: {
      _id: '$productId',
      purchase: { $sum: { $cond: [{ $eq: ['$type', 'purchase'] }, '$quantity', 0] } },
      outgoing: { $sum: { $cond: [{ $eq: ['$type', 'outgoing'] }, '$quantity', 0] } },
      incoming: { $sum: { $cond: [{ $eq: ['$type', 'incoming'] }, '$quantity', 0] } },
      damaged: { $sum: { $cond: [{ $eq: ['$type', 'damaged'] }, '$quantity', 0] } },
    } }
  ]);

  // تحويل النتائج إلى كائنات يسهل التعامل معها
  const beforeMap = Object.fromEntries(before.map(b => [String(b._id), b]));
  const afterMap = Object.fromEntries(after.map(b => [String(b._id), b]));

  // بناء تقرير لكل منتج
  const report = products.map(prod => {
    const b = beforeMap[prod._id] || { purchase: 0, outgoing: 0, incoming: 0, damaged: 0 };
    const a = afterMap[prod._id] || { purchase: 0, outgoing: 0, incoming: 0, damaged: 0 };
    return {
      product: prod,
      startQty: (b.purchase + b.incoming) - (b.outgoing + b.damaged),
      endQty: (a.purchase + a.incoming) - (a.outgoing + a.damaged)
    };
  });

  return NextResponse.json({
    report,
    during
  });
}
