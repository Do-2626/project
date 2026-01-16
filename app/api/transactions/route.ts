import { NextRequest, NextResponse } from 'next/server';
import Transaction from '@/models/Transaction';
import Branch from '@/models/Branch';
import FinancialTransaction from '@/models/FinancialTransaction'; // Import FinancialTransaction model
import { dbConnect } from '@/lib/mongoose';

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

  // التحقق مما إذا كان الطلب عبارة عن مصفوفة (Bulk Insert)
  if (Array.isArray(body)) {
    try {
      const results = [];
      for (const item of body) {
        const transaction = await Transaction.create(item);
        
        // إنشاء قيد مالي إذا كانت عملية شراء أو بيع
        if (item.type === 'purchase') {
          await FinancialTransaction.create({
            type: 'purchase',
            amount: item.amount,
            category: 'المشتريات',
            date: item.date,
            party: item.party,
            branchId: item.branchId,
            productId: item.productId,
            quantity: item.quantity,
          });
        } else if (item.type === 'sale') {
          await FinancialTransaction.create({
            type: 'income',
            amount: item.amount,
            category: 'المبيعات',
            date: item.date,
            party: item.party,
            branchId: item.branchId,
            productId: item.productId,
            quantity: item.quantity,
          });
        }
        results.push(transaction);
      }
      return NextResponse.json(results, { status: 201 });
    } catch (error: any) {
      console.error("Bulk insert error details:", {
        message: error.message,
        stack: error.stack,
        errors: error.errors
      });
      return NextResponse.json({ 
        error: "Failed to process bulk transactions",
        details: error.message 
      }, { status: 500 });
    }
  }

  // المعالجة الفردية (للتوافق مع الكود القديم إذا لزم الأمر)
  try {
    const transaction = await Transaction.create(body);

    if (body.type === 'purchase') {
      await FinancialTransaction.create({
        type: 'purchase',
        amount: body.amount,
        category: 'المشتريات',
        date: body.date,
        party: body.party,
        branchId: body.branchId,
        productId: body.productId,
        quantity: body.quantity,
      });
    } else if (body.type === 'sale') {
      await FinancialTransaction.create({
        type: 'income',
        amount: body.amount,
        category: 'المبيعات',
        date: body.date,
        party: body.party,
        branchId: body.branchId,
        productId: body.productId,
        quantity: body.quantity,
      });
    }

    return NextResponse.json(transaction, { status: 201 });
  } catch (error: any) {
    console.error("Single insert error details:", {
      message: error.message,
      stack: error.stack,
      errors: error.errors
    });
    return NextResponse.json({ 
      error: "Failed to process transaction",
      details: error.message 
    }, { status: 500 });
  }
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

  if (deletedTransaction.type === 'purchase' || deletedTransaction.type === 'sale') {
    await FinancialTransaction.deleteOne({ 
      productId: deletedTransaction.productId, 
      quantity: deletedTransaction.quantity, 
      date: deletedTransaction.date,
      type: deletedTransaction.type === 'purchase' ? 'purchase' : 'income'
    });
  }

  return NextResponse.json({ message: 'Transaction deleted successfully' }, { status: 200 });
}
