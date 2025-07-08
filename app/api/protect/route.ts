import { NextResponse } from "next/server";

// كلمة المرور الحقيقية محفوظة فقط في الخادم
const PASSWORD = "admin2626";

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
