import { NextRequest, NextResponse } from "next/server";
import Branch from "@/models/Branch";
import { dbConnect } from "@/lib/mongoose";

export async function GET(req: NextRequest) {
  await dbConnect();
  try {
    const branches = await Branch.find({ isActive: true });
    return NextResponse.json(branches);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch branches" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const body = await req.json();
    
    // التحقق من وجود الاسم
    if (!body.name) {
      return NextResponse.json(
        { error: "اسم الفرع مطلوب" },
        { status: 400 }
      );
    }

    // التحقق من عدم تكرار الاسم
    const existingBranch = await Branch.findOne({ name: body.name });
    if (existingBranch) {
      return NextResponse.json(
        { error: "هذا الفرع موجود بالفعل" },
        { status: 400 }
      );
    }

    const branch = await Branch.create(body);
    return NextResponse.json(branch, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create branch" }, { status: 500 });
  }
}
