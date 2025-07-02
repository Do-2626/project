import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/lib/models/product";

export async function GET() {
  await connectDB();
  const products = await Product.find({}).sort({ created_at: -1 });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  await connectDB();
  const data = await req.json();
  const product = await Product.create({
    name: data.name,
    weight: data.weight,
    purchase_price: data.purchase_price,
    price_selling: data.price_selling,
    current_stock: data.current_stock,
    updated_at: new Date(),
    created_at: new Date(),
  });
  console.log(product);
  
  return NextResponse.json(product);
}
