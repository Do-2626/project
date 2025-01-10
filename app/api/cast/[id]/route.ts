import { connectDB } from "@/lib/db";
import { Cast } from "@/lib/models/cast";
import { NextResponse, NextRequest } from "next/server";

// واجهة برمجية لجلب عميل واحد
// GET /api/todos/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // اتصال بقاعدة البيانات
  await connectDB();
  // استخراج المعرف من الطلب
  const { id } = params;
  // البحث عن العميل
  const cast = await Cast.findById(id);

  // إرجاع العميل
  return cast
    ? NextResponse.json(cast)
    : NextResponse.json({ error: "Not found" }, { status: 404 });
}

// واجهة برمجية لتعديل عميل واحد
// PATCH /api/todos/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // اتصال بقاعدة البيانات
  await connectDB();
  // استخراج المعرف من الطلب
  const { id } = params;
  // استخراج البيانات المعدلة من الطلب
  const data = await request.json();
  // البحث عن العميل وتحديثه
  const cast = await Cast.findByIdAndUpdate(id, data, { new: true });
  // إرجاع العميل المحدث
  return cast
    ? NextResponse.json(cast)
    : NextResponse.json({ error: "Not found" }, { status: 404 });
}

// واجهة برمجية لحذف عميل واحد
// DELETE /api/todos/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // اتصال بقاعدة البيانات
  await connectDB();
  // استخراج المعرف من الطلب
  const { id } = params;
  // البحث عن العميل وحذفه
  const cast = await Cast.findByIdAndDelete(id);
  // إرجاع العميل المحذوف
  return cast
    ? NextResponse.json({ message: "Deleted successfully" })
    : NextResponse.json({ error: "Not found" }, { status: 404 });
}
