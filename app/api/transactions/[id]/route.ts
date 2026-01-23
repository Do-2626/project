import { NextRequest, NextResponse } from 'next/server';
import Transaction from '@/models/Transaction';
import FinancialTransaction from '@/models/FinancialTransaction';
import { dbConnect } from '@/lib/mongoose';
import mongoose from 'mongoose';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const id = params.id;
    const body = await request.json();

    const updatedTransaction = await Transaction.findByIdAndUpdate(id, body, { new: true, session });
    if (!updatedTransaction) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json({ error: 'المعاملة غير موجودة' }, { status: 404 });
    }

    // تحديث القيد المالي المرتبط إذا وجد
    if (updatedTransaction.type === 'purchase' || updatedTransaction.type === 'sale') {
      await FinancialTransaction.findOneAndUpdate(
        { transactionId: id },
        {
          amount: updatedTransaction.amount,
          date: updatedTransaction.date,
          party: updatedTransaction.party,
          quantity: updatedTransaction.quantity,
          productId: updatedTransaction.productId,
          branchId: updatedTransaction.branchId,
        },
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();
    return NextResponse.json(updatedTransaction);
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const id = params.id;
    const deletedTransaction = await Transaction.findByIdAndDelete(id).session(session);

    if (!deletedTransaction) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // حذف القيد المالي المرتبط
    const deleteResult = await FinancialTransaction.deleteOne({ transactionId: id }).session(session);

    // دعم البيانات القديمة
    if (deleteResult.deletedCount === 0 && (deletedTransaction.type === 'purchase' || deletedTransaction.type === 'sale')) {
      await FinancialTransaction.deleteOne({
        productId: deletedTransaction.productId,
        quantity: deletedTransaction.quantity,
        date: deletedTransaction.date,
        type: deletedTransaction.type === 'purchase' ? 'purchase' : 'income',
        transactionId: { $exists: false }
      }).session(session);
    }

    await session.commitTransaction();
    session.endSession();
    return NextResponse.json({ message: 'Transaction deleted successfully' });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}