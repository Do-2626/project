import { NextRequest, NextResponse } from 'next/server';
import Account from '@/models/Account';
import { dbConnect } from '@/lib/mongoose';

export async function GET(req: NextRequest) {
  await dbConnect();
  try {
    const accounts = await Account.find({ isActive: true });
    return NextResponse.json(accounts);
  } catch (error) {
    return NextResponse.json({ message: 'فشل في جلب الحسابات' }, { status: 500 });
  }
}