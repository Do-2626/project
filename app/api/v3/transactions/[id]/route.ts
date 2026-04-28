import { NextRequest, NextResponse } from "next/server";
import { supabase, toCamel, toSnake } from "@/lib/supabase";
import { transactionSchema } from "@/lib/schemas-v3";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(async (_req: NextRequest, _user: any, { params }: { params: { id: string } }) => {
  try {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json(toCamel(data));
  } catch (error: any) {
    return NextResponse.json(
      { error: "SERVER_ERROR", message: error.message },
      { status: 500 }
    );
  }
});

export const PATCH = withAuth(async (req: NextRequest, _user: any, { params }: { params: { id: string } }) => {
  try {
    const body = await req.json();
    const validatedData = transactionSchema.partial().parse(body);

    const { data, error } = await supabase
      .from("transactions")
      .update(toSnake(validatedData))
      .eq("id", params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(toCamel(data));
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

export const DELETE = withAuth(async (_req: NextRequest, _user: any, { params }: { params: { id: string } }) => {
  try {
    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", params.id);

    if (error) throw error;

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "SERVER_ERROR", message: error.message },
      { status: 500 }
    );
  }
});
