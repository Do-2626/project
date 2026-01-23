import { NextRequest, NextResponse } from "next/server";
import Product from "@/models/Product";
import { dbConnect } from "@/lib/mongoose";

export async function GET(req: Request) {
  await dbConnect();
  const products = await Product.find();
  return NextResponse.json(products);
}
