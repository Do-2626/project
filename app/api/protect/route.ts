import { NextResponse } from "next/server";

// كلمات المرور محفوظة فقط في الخادم
const MANAGER_PASSWORD = "mo2626";
const DELEGATE_PASSWORD = "user2626";

export async function POST(req: Request) {
  try {
    const { password } = await req.json();
    if (password === MANAGER_PASSWORD) {
      return NextResponse.json({ success: true, role: "manager" });
    } else if (password === DELEGATE_PASSWORD) {
      return NextResponse.json({ success: true, role: "delegate" });
    } else {
      return NextResponse.json(
        { success: false, error: "كلمة المرور غير صحيحة" },
        { status: 401 }
      );
    }
  } catch (e) {
    return NextResponse.json(
      { success: false, error: "طلب غير صالح" },
      { status: 400 }
    );
  }
}
