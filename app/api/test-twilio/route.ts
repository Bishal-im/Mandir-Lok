import { NextResponse } from "next/server";
import { sendWhatsApp } from "@/lib/whatsapp";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const to = searchParams.get("to");
  const message = searchParams.get("message") || "Test message from MandirLok using Twilio Template";
  const contentSid = searchParams.get("contentSid");

  if (!to) {
    return NextResponse.json({ 
      success: false, 
      message: "Please provide 'to' parameter (e.g. /api/test-twilio?to=91XXXXXXXXXX)" 
    });
  }

  try {
    const options = contentSid ? { contentSid } : undefined;
    const result = await sendWhatsApp(to, message, options);
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
