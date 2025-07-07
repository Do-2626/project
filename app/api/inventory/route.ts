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
  const body = await req.json();
  const product = await Product.create(body);
  return NextResponse.json(product, { status: 201 });
}
