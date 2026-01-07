import { NextRequest, NextResponse } from "next/server";
import Branch from "@/models/Branch";
import { dbConnect } from "@/lib/mongoose";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  try {
    const id = params.id;
    const body = await req.json();
    
    const branch = await Branch.findByIdAndUpdate(id, body, { new: true });
    
    if (!branch) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 });
    }

    return NextResponse.json(branch);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update branch" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  try {
    const id = params.id;
    
    // Soft delete by setting isActive to false
    const branch = await Branch.findByIdAndUpdate(id, { isActive: false }, { new: true });
    
    if (!branch) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Branch deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete branch" }, { status: 500 });
  }
}
