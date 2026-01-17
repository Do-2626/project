import { NextRequest, NextResponse } from "next/server";
import ExpenseCategory from "@/models/ExpenseCategory";
import { dbConnect } from "@/lib/mongoose";

export async function GET(req: NextRequest) {
  await dbConnect();
  try {
    const categories = await ExpenseCategory.find({ isActive: true });
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch expense categories" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const body = await req.json();
    
    if (!body.name) {
      return NextResponse.json(
        { error: "اسم النوع مطلوب" },
        { status: 400 }
      );
    }

    const existing = await ExpenseCategory.findOne({ name: body.name });
    if (existing) {
      return NextResponse.json(
        { error: "هذا النوع موجود بالفعل" },
        { status: 400 }
      );
    }

    const category = await ExpenseCategory.create(body);
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create expense category" }, { status: 500 });
  }
}
