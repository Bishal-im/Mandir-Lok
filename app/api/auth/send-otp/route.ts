import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Otp from "@/models/Otp";
import nodemailer from "nodemailer";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email: rawEmail, isAdmin } = await req.json();
    const email = rawEmail?.toLowerCase().trim();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    // ─── ADMIN CHECK ────────────────────────────────────────────────────────
    if (isAdmin) {
      const adminEmails = process.env.ADMIN_EMAILS?.toLowerCase().split(",").map(e => e.trim()) || [];
      if (!adminEmails.includes(email)) {
        return NextResponse.json(
          { success: false, message: "Wrong email ID. Access denied." },
          { status: 403 }
        );
      }
    }
    // ────────────────────────────────────────────────────────────────────────

    await connectDB();

    // Generate secure 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 mins

    // Delete old OTP for this email
    await Otp.deleteMany({ email });

    // Save new OTP
    await Otp.create({
      email,
      otp,
      expiresAt,
    });

    // Create email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send email
    await transporter.sendMail({
      from: `"MandirLok" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code",
      html: `
        <h2>Your OTP Code</h2>
        <p>Your OTP is: <strong>${otp}</strong></p>
        <p>This OTP will expire in 2 minutes.</p>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}