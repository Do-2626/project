import { NextRequest, NextResponse } from "next/server";
import Account from "@/models/Account";
import { dbConnect } from "@/lib/mongoose";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const accounts = await Account.find({}).populate("parentId");
    return NextResponse.json(accounts);
  } catch (error) {
    return NextResponse.json(
      { message: "Server error", error },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    
    // Validate required fields
    const requiredFields = ['name', 'type', 'code'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { message: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    const newAccount = await Account.create({
      name: body.name,
      type: body.type,
      description: body.description,
      parentId: body.parentId || null, // Ensure parentId is optional
      code: body.code,
      isActive: body.isActive !== undefined ? body.isActive : true, // Default to true if not provided
      currency: body.currency || "USD", // Default to USD if not provided
      openingBalance: body.openingBalance || 0, // Default to 0 if not provided
      openingBalanceDate: body.openingBalanceDate || new Date(), // Default to current date if not provided
    });

    // const newAccount = new Account(body);
    // await newAccount.save();
    return NextResponse.json(newAccount, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error creating account", error },
      { status: 400 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const { _id, ...updateData } = await req.json();
    const updatedAccount = await Account.findByIdAndUpdate(_id, updateData, {
      new: true,
    });
    return NextResponse.json(updatedAccount);
  } catch (error) {
    return NextResponse.json(
      { message: "Error updating account", error },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();
    const { id } = await req.json();
    await Account.findByIdAndDelete(id);
    return NextResponse.json({ message: "Account deleted" });
  } catch (error) {
    return NextResponse.json(
      { message: "Error deleting account", error },
      { status: 400 }
    );
  }
}
