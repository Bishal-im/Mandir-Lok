import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Pandit from "@/models/Pandit";
import Otp from "@/models/Otp";
import { generateToken } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    const { phone, email, otp } = await req.json();

    if ((!phone && !email) || !otp) {
      return NextResponse.json(
        { success: false, message: "Identifier (Phone or Email) and OTP are required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find OTP record using correct field
    const query = phone ? { phone, otp } : { email, otp };
    const otpRecord = await Otp.findOne(query);

    if (!otpRecord) {
      return NextResponse.json(
        { success: false, message: "OTP not found. Please request a new one." },
        { status: 400 }
      );
    }

    // Check expiry
    if (new Date() > otpRecord.expiresAt) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return NextResponse.json(
        { success: false, message: "OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Find pandit
    const panditQuery = phone ? { phone, isActive: true } : { email, isActive: true };
    const pandit = await Pandit.findOne(panditQuery);
    if (!pandit) {
      return NextResponse.json(
        { success: false, message: "Pandit account not found or deactivated" },
        { status: 404 }
      );
    }

    // Delete used OTP
    await Otp.deleteOne({ _id: otpRecord._id });

    // Check if phone or whatsapp is missing
    const needsPhoneUpdate = !pandit.phone || !pandit.whatsapp;

    // Generate JWT
    const token = generateToken({ panditId: pandit._id.toString() });

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      needsPhoneUpdate,
      panditId: pandit._id.toString()
    });
    response.cookies.set("mandirlok_pandit_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Pandit verify-otp error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
