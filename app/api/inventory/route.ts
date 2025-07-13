import { NextRequest, NextResponse } from 'next/server';
import Product from '@/models/Product';
import { dbConnect } from '@/lib/mongoose';

export async function GET() {
  await dbConnect();
  const products = await Product.find({}).sort({ createdAt: -1 });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const body = await req.json();
    if (!body.name || !body.purchasePrice || !body.sellingPrice) {
      return NextResponse.json(
        { message: 'جميع الحقول الأساسية مطلوبة' },
        { status: 400 }
      );
    }
    const product = await Product.create({
      name: body.name,
      weight: body.weight,
      purchasePrice: Number(body.purchasePrice),
      sellingPrice: Number(body.sellingPrice)
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: 'فشل في إنشاء الصنف' },
      { status: 500 }
    );
  }
}
