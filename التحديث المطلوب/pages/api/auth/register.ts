import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import User from "@/models/User";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI as string;

async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI);
  }
}

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();
  const { username, password } = body;
  if (!username || !password) {
    return NextResponse.json(
      { message: "الرجاء إدخال اسم المستخدم وكلمة المرور" },
      { status: 400 }
    );
  }
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return NextResponse.json(
      { message: "اسم المستخدم مستخدم بالفعل" },
      { status: 409 }
    );
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ username, password: hashedPassword });
  await newUser.save();
  const { password: _, ...userData } = newUser.toObject();
  return NextResponse.json({ user: userData }, { status: 201 });
}
