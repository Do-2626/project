import { NextRequest, NextResponse } from "next/server";
import { supabase, toCamel } from "@/lib/supabase";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const productId = searchParams.get("product_id");

    let query = supabase.from("daily_inventory_summary").select("*");

    if (date) query = query.eq("date", date);
    if (productId) query = query.eq("product_id", productId);

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
