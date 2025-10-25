import { NextRequest, NextResponse } from 'next/server';
import Transaction from '@/models/Transaction';
import FinancialTransaction from '@/models/FinancialTransaction'; // Import FinancialTransaction model
import { dbConnect } from '@/lib/mongoose';

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url!);
  const date = searchParams.get('date');
  let filter: any = {};
  if (date) filter.date = date;
  const transactions = await Transaction.find(filter).populate('productId');
  return NextResponse.json(transactions);
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const body = await req.json();
  const transaction = await Transaction.create(body);

  if (body.type === 'purchase') {
    await FinancialTransaction.create({
      type: 'purchase',
      amount: body.amount,
      category: 'المشتريات',
      date: body.date,
      party: body.party,
      productId: body.productId,
      quantity: body.quantity,
    });
  }

  return NextResponse.json(transaction, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  await dbConnect();
  const { pathname } = new URL(req.url);
  const id = pathname.split('/').pop();

  if (!id) {
    return NextResponse.json({ message: 'Transaction ID is required' }, { status: 400 });
  }

  const deletedTransaction = await Transaction.findByIdAndDelete(id);

  if (!deletedTransaction) {
    return NextResponse.json({ message: 'Transaction not found' }, { status: 404 });
  }

  if (deletedTransaction.type === 'purchase') {
    await FinancialTransaction.deleteOne({ productId: deletedTransaction.productId, quantity: deletedTransaction.quantity, date: deletedTransaction.date });
  }

  return NextResponse.json({ message: 'Transaction deleted successfully' }, { status: 200 });
}
