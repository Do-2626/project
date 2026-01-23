import { NextRequest, NextResponse } from "next/server";
import Contact from "@/models/Contact";
import { dbConnect } from "@/lib/mongoose";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    await dbConnect();
    try {
        const id = params.id;
        const body = await req.json();
        const contact = await Contact.findByIdAndUpdate(id, body, { new: true });
        if (!contact) return NextResponse.json({ error: "Contact not found" }, { status: 404 });
        return NextResponse.json(contact);
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    await dbConnect();
    try {
        const id = params.id;
        const contact = await Contact.findByIdAndDelete(id);
        if (!contact) return NextResponse.json({ error: "Contact not found" }, { status: 404 });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
