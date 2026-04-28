import { NextRequest, NextResponse } from "next/server";
import { supabase, toCamel, toSnake } from "@/lib/supabase";
import { inventorySnapshotSchema } from "@/lib/schemas-v3";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const branchId = searchParams.get("branch_id");

    let query = supabase.from("inventory_snapshots").select("*");

    if (date) query = query.eq("snapshot_date", date);
    if (branchId) query = query.eq("branch_id", branchId);

    const { data, error } = await query.order("snapshot_date", { ascending: false });

    if (error) throw error;

    return NextResponse.json(toCamel(data));
  } catch (error: any) {
    return NextResponse.json(
      { error: "SERVER_ERROR", message: error.message },
      { status: 500 }
    );
  }
});

export const POST = withAuth(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const validatedData = inventorySnapshotSchema.parse(body);
    
    const { data, error } = await supabase
      .from("inventory_snapshots")
      .upsert(toSnake(validatedData))
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(toCamel(data), { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "VALIDATION_ERROR", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "SERVER_ERROR", message: error.message },
      { status: 500 }
    );
  }
});
