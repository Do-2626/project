import { dbConnect } from '@/lib/mongoose';
import Transaction from '@/models/Transaction';
import { NextResponse } from 'next/server';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    // Validate transaction ID format
    if (!/^[0-9a-fA-F]{24}$/.test(params.id)) {
      return NextResponse.json({ error: 'معرّف غير صالح' }, { status: 400 });
    }

    const data = await request.json();
    
    console.log(`Updating transaction ID: ${params.id}`);
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      params.id,
      data,
      { new: true }
    );

    if (!updatedTransaction) {
      console.error(`Transaction not found: ${params.id}`);
      return NextResponse.json({ error: 'المعاملة غير موجودة' }, { status: 404 });
    }

    console.log('Transaction updated successfully:', updatedTransaction);

    return NextResponse.json(updatedTransaction);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const deletedTransaction = await Transaction.findByIdAndDelete(params.id);

    if (!deletedTransaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    );
  }
}