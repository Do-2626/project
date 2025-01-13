import { connectDB } from "@/lib/db";
import { Cast } from "@/lib/models/cast";
import { NextRequest, NextResponse } from "next/server";

// واجهة برمجية للحصول على جميع المهام
// GET /api/cast
export async function GET() {
  await connectDB();
  // ترتيب تصاعدى
  // const sortedCasts = await Cast.find().sort({ area: 1 });
  const sortedCasts = await Cast.find().sort({ customerCode: 1 });
  return NextResponse.json(sortedCasts);
}

// واجهة برمجية لإضافة مهمة جديدة
// POST /api/cast
export async function POST(request: NextRequest) {
  await connectDB();
  const newCast = new Cast(await request.json());
  await newCast.save();
  return NextResponse.json(newCast);
}
