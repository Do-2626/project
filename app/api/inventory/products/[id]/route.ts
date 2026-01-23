import { NextRequest, NextResponse } from "next/server";
import Product from "@/models/Product";
import { dbConnect } from "@/lib/mongoose";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    await dbConnect();
    try {
        const product = await Product.findById(params.id);
        if (!product) return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
        return NextResponse.json(product);
    } catch (error) {
        return NextResponse.json({ error: "فشل في جلب المنتج" }, { status: 400 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    await dbConnect();
    try {
        const product = await Product.findByIdAndUpdate(params.id, await req.json(), { new: true });
        if (!product) return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
        return NextResponse.json(product);
    } catch (error) {
        return NextResponse.json({ error: "فشل في تحديث المنتج" }, { status: 400 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    await dbConnect();
    try {
        const product = await Product.findByIdAndDelete(params.id);
        if (!product) return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "فشل في حذف المنتج" }, { status: 400 });
    }
}
