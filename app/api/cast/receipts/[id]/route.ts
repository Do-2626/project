import { NextRequest, NextResponse } from "next/server";

// GET request handler
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({ message: "Hello from API" });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST request handler 
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    return NextResponse.json({ 
      message: "Data received",
      data: data 
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}