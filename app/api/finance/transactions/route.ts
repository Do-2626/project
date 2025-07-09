import { NextRequest, NextResponse } from 'next/server';
import FinancialTransaction from '@/models/FinancialTransaction';
import Product from '@/models/Product';
import Transaction from '@/models/Transaction';
import { dbConnect } from '@/lib/mongoose';

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url!);
  const date = searchParams.get('date');
  const category = searchParams.get('category');
  const type = searchParams.get('type');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  
  let filter: any = {};
  
  // تطبيق الفلاتر إذا تم تحديدها
  if (date) filter.date = date;
  if (category) filter.category = category;
  if (type) filter.type = type;
  
  // فلتر نطاق التاريخ
  if (startDate && endDate) {
    filter.date = { $gte: startDate, $lte: endDate };
  }
  
  const transactions = await FinancialTransaction.find(filter).populate('productId');
  return NextResponse.json(transactions);
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const body = await req.json();
  
  try {
    // إذا كانت المعاملة من نوع شراء، تحقق من وجود المنتج
    if (body.type === 'purchase') {
      if (!body.productId) {
        return NextResponse.json(
          { message: 'يجب تحديد المنتج لعمليات الشراء' },
          { status: 400 }
        );
      }
      
      if (!body.quantity || body.quantity <= 0) {
        return NextResponse.json(
          { message: 'يجب تحديد كمية صالحة للشراء' },
          { status: 400 }
        );
      }
      
      // التحقق من وجود المنتج
      const product = await Product.findById(body.productId);
      if (!product) {
        return NextResponse.json(
          { message: 'المنتج غير موجود' },
          { status: 404 }
        );
      }
      
      // إنشاء معاملة مالية للشراء
      const financialTransaction = await FinancialTransaction.create(body);
      
      // إنشاء معاملة مخزون للشراء لتحديث المخزون
      await Transaction.create({
        productId: body.productId,
        quantity: body.quantity,
        type: 'purchase',
        party: body.party,
        date: body.date,
        amount: body.amount,
        category: body.category,
        isRecurring: body.isRecurring || false
      });
      
      return NextResponse.json(financialTransaction, { status: 201 });
    } else {
      // للمعاملات المالية الأخرى (مصروفات، إيرادات)
      const transaction = await FinancialTransaction.create(body);
      return NextResponse.json(transaction, { status: 201 });
    }
  } catch (error) {
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
    if (transaction.type === 'purchase') {
      // البحث عن معاملة المخزون المرتبطة بنفس التاريخ والمنتج والكمية
      await Transaction.deleteOne({
        productId: transaction.productId,
        date: transaction.date,
        type: 'purchase',
        quantity: transaction.quantity
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