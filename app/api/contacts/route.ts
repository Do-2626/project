import { NextResponse } from "next/server";
import Contact from "@/models/Contact";

export async function GET() {
    try {
        const contacts = await Contact.find({}).sort({ name: 1 });
        return NextResponse.json(contacts);
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const contact = await Contact.create(body);
        return NextResponse.json(contact);
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
