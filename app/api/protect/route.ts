import { NextResponse } from "next/server";

// كلمة المرور الحقيقية محفوظة في ملف البيئة
const PASSWORD = process.env.ADMIN_PASSWORD;

export async function POST(req: Request) {
  try {
    const { password } = await req.json();
    if (password === PASSWORD) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: "كلمة المرور غير صحيحة" }, { status: 401 });
    }
  } catch (e) {
    return NextResponse.json({ success: false, error: "طلب غير صالح" }, { status: 400 });
  }
}
