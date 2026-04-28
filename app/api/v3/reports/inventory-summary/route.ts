import { NextRequest, NextResponse } from "next/server";
import { supabase, toCamel } from "@/lib/supabase";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");
    const branchId = searchParams.get("branch_id");

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "VALIDATION_ERROR", message: "start_date and end_date are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.rpc("get_inventory_summary_v2", {
      p_start_date: startDate,
      p_end_date: endDate,
      p_branch_id: branchId || null,
    });

    if (error) throw error;

    return NextResponse.json(toCamel(data));
  } catch (error: any) {
    return NextResponse.json(
      { error: "SERVER_ERROR", message: error.message },
      { status: 500 }
    );
  }
});
