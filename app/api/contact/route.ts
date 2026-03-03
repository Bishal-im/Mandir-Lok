import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, subject, message } = body;

    // Connect to DB to get support email from settings
    const { connectDB } = require("@/lib/db");
    const Settings = require("@/models/Settings").default;
    await connectDB();
    const contactSettingsRes = await Settings.findOne({ key: "contact_settings" }).lean();
    const contactSettings = contactSettingsRes?.value || {};

    // Basic validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email and message are required" },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Create transporter (uses same SMTP config as OTP)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || process.env.EMAIL_USER,
        pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
      },
    });

    const senderEmail = process.env.SMTP_USER || process.env.EMAIL_USER;
    const adminEmail = contactSettings.supportEmail || process.env.ADMIN_EMAIL || senderEmail;

    // Email to admin
    await transporter.sendMail({
      from: `"Mandirlok Contact" <${senderEmail}>`,
      to: adminEmail,
      subject: `[Contact] ${subject || "New message from " + name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #f97316; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="color: white; margin: 0;">🛕 New Contact Message — Mandirlok</h2>
          </div>
          <div style="background: #fff7ed; padding: 24px; border: 1px solid #fed7aa; border-top: none; border-radius: 0 0 8px 8px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; width: 120px; font-size: 14px;">Name</td>
                <td style="padding: 8px 0; font-weight: 600; color: #111827;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Email</td>
                <td style="padding: 8px 0; font-weight: 600; color: #111827;">${email}</td>
              </tr>
              ${phone ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Phone</td>
                <td style="padding: 8px 0; font-weight: 600; color: #111827;">${phone}</td>
              </tr>` : ""}
              ${subject ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Subject</td>
                <td style="padding: 8px 0; font-weight: 600; color: #111827;">${subject}</td>
              </tr>` : ""}
            </table>
            <hr style="border: none; border-top: 1px solid #fed7aa; margin: 16px 0;" />
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 8px;">Message:</p>
            <p style="color: #111827; line-height: 1.6; white-space: pre-wrap;">${message}</p>
          </div>
        </div>
      `,
    });

    // Auto-reply to user
    await transporter.sendMail({
      from: `"Mandirlok" <${senderEmail}>`,
      to: email,
      subject: "We received your message — Mandirlok 🛕",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f97316, #dc2626); padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🛕 Mandirlok</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Connecting you with sacred temples of India</p>
          </div>
          <div style="background: #fff7ed; padding: 28px; border: 1px solid #fed7aa; border-top: none; border-radius: 0 0 8px 8px;">
            <p style="color: #111827; font-size: 16px;">Namaste ${name} 🙏</p>
            <p style="color: #374151; line-height: 1.6;">Thank you for reaching out to us. We've received your message and our team will get back to you within <strong>24 hours</strong>.</p>
            <div style="background: white; border-left: 4px solid #f97316; padding: 16px; border-radius: 4px; margin: 20px 0;">
              <p style="color: #6b7280; font-size: 13px; margin: 0 0 6px;">Your message:</p>
              <p style="color: #111827; margin: 0; font-style: italic;">"${message.substring(0, 200)}${message.length > 200 ? "..." : ""}"</p>
            </div>
            <p style="color: #374151;">🕉️ May the blessings of the divine be with you and your family.</p>
            <hr style="border: none; border-top: 1px solid #fed7aa; margin: 20px 0;" />
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">Mandirlok — Book sacred poojas from anywhere in the world</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: "Message sent successfully" });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again." },
      { status: 500 }
    );
  }
}