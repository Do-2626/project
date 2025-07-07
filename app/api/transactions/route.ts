import { NextRequest, NextResponse } from 'next/server';
import Transaction from '@/models/Transaction';
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
  return NextResponse.json(transaction, { status: 201 });
}
