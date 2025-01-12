import { connectDB } from "@/lib/db";
import { Cast } from "@/lib/models/cast";
import { NextRequest, NextResponse } from "next/server";

// واجهة برمجية للحصول اكبر كود عميل واضافة 1 عليه
// GET /api/cast/last-customer-code
export async function GET() {
  await connectDB();
  // const sortedCasts = await Cast.find().sort({ customerCode: 1 });

  const lastCast = await Cast.findOne().sort({ customerCode: -1 });
  const nextCode = Number(lastCast?.customerCode) + 1 || "0";
  return NextResponse.json({ nextCode: nextCode });
}
