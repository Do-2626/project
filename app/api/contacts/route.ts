import { NextRequest, NextResponse } from "next/server";
import Contact from "@/models/Contact";
import { dbConnect } from "@/lib/mongoose";

export async function GET(req: NextRequest) {
    await dbConnect();
    try {
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type');
        const filter = type ? { type } : {};
        const contacts = await Contact.find(filter).sort({ name: 1 });
        return NextResponse.json(contacts);
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    await dbConnect();
    try {
        const body = await req.json();
        const contact = await Contact.create(body);
        return NextResponse.json(contact);
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
