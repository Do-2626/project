// app/api/payments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Payment } from "@/lib/models/payment";

export async function GET(req: NextRequest) {
  await connectDB();
  const castId = req.nextUrl.searchParams.get("castId");
  if (!castId) {
    return NextResponse.json({ success: false, error: "castId is required" }, { status: 400 });
  }
  try {
    const result = await Payment.find({ castId }).sort({ number: 1 });
    return NextResponse.json({ success: true, data: result });
  } catch (e) {
    return NextResponse.json({ success: false, error: "DB Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();
  if (!body.castId || !body.amount || !body.number || !body.date) {
    return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
  }
  try {
    // Prevent duplicate for same castId, number
    const exists = await Payment.findOne({ castId: body.castId, number: body.number });
    if (exists) {
      return NextResponse.json({ success: false, error: "Installment already paid" }, { status: 400 });
    }
    const payment = await Payment.create(body);
    return NextResponse.json({ success: true, data: payment });
  } catch (e) {
    return NextResponse.json({ success: false, error: "DB Error" }, { status: 500 });
  }
}
