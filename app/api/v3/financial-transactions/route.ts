import { NextRequest, NextResponse } from "next/server";
import { supabase, toCamel, toSnake } from "@/lib/supabase";
import { financialTransactionSchema } from "@/lib/schemas-v3";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const branchId = searchParams.get("branch_id");
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");

    let query = supabase.from("financial_transactions").select("*");

    if (type) query = query.eq("type", type);
    if (branchId) query = query.eq("branch_id", branchId);
    if (startDate) query = query.gte("date", startDate);
    if (endDate) query = query.lte("date", endDate);

    const { data, error } = await query.order("date", { ascending: false });

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
    const validatedData = financialTransactionSchema.parse(body);

    const { data, error } = await supabase
      .from("financial_transactions")
      .insert(toSnake(validatedData))
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
