import { connectDB } from "@/lib/db";
import { Todo } from "@/lib/models/todo";
import { NextResponse, NextRequest } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { completed } = await request.json();
    await connectDB();
    const todo = await Todo.findByIdAndUpdate(
      params.id,
      { completed },
      { new: true }
    );
    return NextResponse.json(todo);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update todo" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    await Todo.findByIdAndDelete(params.id);
    return NextResponse.json({ message: "Todo deleted" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete todo" },
      { status: 500 }
    );
  }
}

// واجهة برمجية لتحديث حالة المهمة
// PATCH /api/todos/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectDB();
  const { id } = params;
  const { description } = await request.json();
  const todo = await Todo.findById(id);
  if (!todo) {
    return NextResponse.json({ error: "Todo not found" }, { status: 404 });
  }
  todo.description = description;
  await todo.save();
  return NextResponse.json(todo);
}
