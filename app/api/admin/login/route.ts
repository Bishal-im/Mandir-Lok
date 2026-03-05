import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { generateToken } from "@/lib/jwt";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    await connectDB();

    const user = await User.findOne({ email, role: "admin" });
    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH!);
    if (!valid) {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });
    }

    const token = generateToken({ userId: user._id.toString(), role: "admin" });
    const res = NextResponse.json({ success: true });
    res.cookies.set("mandirlok_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
      ...(process.env.COOKIE_DOMAIN && { domain: process.env.COOKIE_DOMAIN }),
    });
    return res;
  } catch (err: any) {
    return NextResponse.json({ success: false, message: "Login failed" }, { status: 500 });
  }
}
