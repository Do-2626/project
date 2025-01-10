import { connectDB } from "@/lib/db";
import { Cast } from "@/lib/models/cast";
import { NextRequest, NextResponse } from "next/server";

// واجهة برمجية للحصول على جميع المهام
// GET /api/todos
export async function GET() {
  await connectDB();
  const Casts = await Cast.find();
  return NextResponse.json(Casts);
}

// واجهة برمجية لإضافة مهمة جديدة
// POST /api/todos
// export async function POST(request: NextRequest) {
//   await connectDB();
//   const { title, description } = await request.json();
//   const todo = await Todo.create({ title, description, completed: false });
//   // const todo = await Todo.create({ title, completed: false });
//   return NextResponse.json(todo);
// }
