import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Pandit from "@/models/Pandit";
import Otp from "@/models/Otp";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    let { phone, email } = await req.json();
    if (email) email = email.toLowerCase();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find active pandit by email
    const pandit = await Pandit.findOne({ email, isActive: true });

    if (!pandit) {
      return NextResponse.json(
        { success: false, message: `No active pandit found with this email` },
        { status: 404 }
      );
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete old OTPs
    await Otp.deleteMany({ email });

    // Save new OTP
    await Otp.create({
      email,
      otp,
      expiresAt,
    });

    console.log(`[Pandit OTP] Email: ${email} | OTP: ${otp}`);

    if (email) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || "smtp.gmail.com",
          port: Number(process.env.SMTP_PORT || 587),
          auth: {
            user: process.env.SMTP_USER || process.env.EMAIL_USER,
            pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
          },
        });

        await transporter.sendMail({
          from: `"MandirLok Pandit Portal" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
          to: email,
          subject: "Your Pandit Portal OTP",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #f0dcc8; border-radius: 10px; background-color: #fdf6ee;">
              <h2 style="color: #ff7f0a; text-align: center;">MandirLok Pandit Portal</h2>
              <p>🙏 Namaste <strong>${pandit.name}</strong>ji,</p>
              <p>Your 6-digit OTP for logging into the MandirLok Pandit Portal is:</p>
              <div style="font-size: 32px; font-weight: bold; text-align: center; padding: 20px; color: #1a1209; background-color: #fff8f0; border: 2px dashed #ff7f0a; border-radius: 8px; margin: 20px 0;">
                ${otp}
              </div>
              <p style="color: #6b5b45; font-size: 14px;">This OTP will expire in 10 minutes. Please do not share this with anyone.</p>
              <p style="text-align: center; color: #ff7f0a; font-weight: bold;">Jai Shree Ram 🛕</p>
            </div>
          `,
        });
      } catch (e) {
        console.error("Email OTP send failed:", e);
        return NextResponse.json({ success: false, message: "Failed to send Email OTP" }, { status: 500 });
      }
    } else if (phone) {
      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        try {
          const { sendWhatsApp } = await import("@/lib/whatsapp");
          await sendWhatsApp(
            pandit.whatsapp,
            `🙏 Namaste ${pandit.name} ji, Your login OTP is: ${otp}. It expires in 10 minutes. Jai Shree Ram 🛕`
          );
        } catch (e) {
          console.error("WhatsApp OTP send failed, OTP logged above:", e);
        }
      }
    }

    return NextResponse.json({ success: true, message: `OTP sent to your registered ${email ? "Email" : "WhatsApp"}` });
  } catch (error) {
    console.error("Pandit send-otp error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
