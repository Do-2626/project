import { NextRequest, NextResponse } from "next/server";
import { supabase, toCamel, toSnake } from "@/lib/supabase";
import { contactSchema } from "@/lib/schemas-v3";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(async () => {
  try {
    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .order("name");

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
    const validatedData = contactSchema.parse(body);

    const { data, error } = await supabase
      .from("contacts")
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
