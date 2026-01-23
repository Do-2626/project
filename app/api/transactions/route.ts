import { NextRequest, NextResponse } from 'next/server';
import Transaction from '@/models/Transaction';
import Branch from '@/models/Branch';
import FinancialTransaction from '@/models/FinancialTransaction'; // Import FinancialTransaction model
import { dbConnect } from '@/lib/mongoose';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url!);
  const date = searchParams.get('date');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  let filter: any = {};
  if (date) {
    filter.date = date;
  } else if (startDate && endDate) {
    filter.date = { $gte: startDate, $lte: endDate };
  }

  const transactions = await Transaction.find(filter)
    .populate('productId')
    .populate('branchId')
    .sort({ date: 1 });

  return NextResponse.json(transactions);
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const body = await req.json();
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const isBulk = Array.isArray(body);
    const data = isBulk ? body : [body];
    const results = [];

    for (const item of data) {
      const [transaction] = await Transaction.create([item], { session });

      if (item.type === 'purchase' || item.type === 'sale') {
        await FinancialTransaction.create([{
          type: item.type === 'purchase' ? 'purchase' : 'income',
          amount: item.amount,
          category: item.type === 'purchase' ? 'المشتريات' : 'المبيعات',
          date: item.date,
          party: item.party,
          branchId: item.branchId,
          productId: item.productId,
          quantity: item.quantity,
          transactionId: transaction._id,
        }], { session });
      }
      results.push(transaction);
    }

    await session.commitTransaction();
    session.endSession();

    return NextResponse.json(isBulk ? results : results[0], { status: 201 });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    console.error("Transaction error:", error);
    return NextResponse.json({
      error: "Failed to process transaction(s)",
      details: error.message
    }, { status: 500 });
  }
}
