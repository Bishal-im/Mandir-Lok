import { NextResponse } from "next/server";
import { sendBookingReminders } from "@/lib/cron/reminders";

export async function GET(req: Request) {
    try {
        // Basic security check (could use a secret token in headers)
        const { searchParams } = new URL(req.url);
        const secret = searchParams.get("secret");

        if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        await sendBookingReminders();

        return NextResponse.json({ success: true, message: "Reminders processed" });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
