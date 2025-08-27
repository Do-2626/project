import { NextRequest, NextResponse } from "next/server";
import Product from "@/models/Product";
import { dbConnect } from "@/lib/mongoose";

export async function GET(req: Request) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (id) {
    const product = await Product.findById(id);
    if (product) {
      return NextResponse.json(product);
    } else {
      return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
    }
  } else {
    const products = await Product.find();
    return NextResponse.json(products);
  }
}

export async function PUT(req: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "معرّف المنتج مطلوب" },
        { status: 400 }
      );
    }

    const product = await Product.findByIdAndUpdate(id, await req.json(), {
      new: true,
    });

    if (!product) {
      return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: "فشل في تحديث المنتج" }, { status: 400 });
  }
}
