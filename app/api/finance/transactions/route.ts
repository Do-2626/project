import { NextRequest, NextResponse } from 'next/server';
import FinancialTransaction from '@/models/FinancialTransaction';
import Product from '@/models/Product';
import Transaction from '@/models/Transaction';
import { dbConnect } from '@/lib/mongoose';
import { FinancialTransactionSchema } from '@/lib/transactionSchema';

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url!);
  const date = searchParams.get('date');
  const category = searchParams.get('category');
  const debitAccount = searchParams.get('debitAccount');
  const creditAccount = searchParams.get('creditAccount');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  
  let filter: any = {};
  
  // تطبيق الفلاتر إذا تم تحديدها
  if (date) filter.date = date;
  if (category) filter.category = category;
  if (debitAccount) filter.debitAccount = debitAccount;
  if (creditAccount) filter.creditAccount = creditAccount;
  
  // فلتر نطاق التاريخ
  if (startDate && endDate) {
    filter.date = { $gte: startDate, $lte: endDate };
  }
  
  try {
    const transactions = await FinancialTransaction.find(filter).populate({
      path: 'productId',
      options: { strictPopulate: false }
    });
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('خطأ في جلب المعاملات:', error);
    return NextResponse.json(
      { message: 'حدث خطأ أثناء جلب البيانات' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const body = await req.json();
  try {
    // التحقق من صحة البيانات باستخدام Zod
    const validation = FinancialTransactionSchema.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      return NextResponse.json(
        { message: 'بيانات غير صالحة', errors },
        { status: 400 }
      );
    }
    const validatedData = validation.data;

    // إذا كانت الحركة مرتبطة بمنتج
    if (validatedData.referenceModel === 'Product') {
      if (!validatedData.referenceId) {
        return NextResponse.json(
          { message: 'يجب تحديد المنتج المرتبط' },
          { status: 400 }
        );
      }
      
      const product = await Product.findById(validatedData.referenceId);
      if (!product) {
        return NextResponse.json(
          { message: 'المنتج غير موجود' },
          { status: 404 }
        );
      }
    }

    const transaction = await FinancialTransaction.create({
      ...validatedData,
      status: 'posted'
    });
    
    return NextResponse.json(transaction, { status: 201 });
  } 
  catch (error) {
    console.error('خطأ في إنشاء المعاملة المالية:', error);
    
    let errorMessage = 'حدث خطأ أثناء معالجة الطلب';
    if (error instanceof Error) {
      errorMessage = `${errorMessage}: ${error.message}`;
    }
    
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url!);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json(
      { message: 'يجب تحديد معرف المعاملة' },
      { status: 400 }
    );
  }
  
  try {
    // التحقق من وجود المعاملة
    const transaction = await FinancialTransaction.findById(id);
    if (!transaction) {
      return NextResponse.json(
        { message: 'المعاملة غير موجودة' },
        { status: 404 }
      );
    }
    
    // إذا كانت المعاملة من نوع شراء، يجب أيضًا حذف معاملة المخزون المرتبطة
    if (transaction.referenceModel === 'Product') {
      await Transaction.deleteOne({
        _id: transaction.referenceId
      });
    }
    
    // حذف المعاملة المالية
    await FinancialTransaction.findByIdAndDelete(id);
    
    return NextResponse.json({ message: 'تم حذف المعاملة بنجاح' });
  } catch (error) {
    console.error('خطأ في حذف المعاملة المالية:', error);
    
    let errorMessage = 'حدث خطأ أثناء معالجة الطلب';
    if (error instanceof Error) {
      errorMessage = `${errorMessage}: ${error.message}`;
    }
    
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}
