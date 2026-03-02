import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Payout from "@/models/Payout";
import Pandit from "@/models/Pandit";
import Notification from "@/models/Notification";
import { sendWhatsApp } from "@/lib/whatsapp";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { event, payload } = body;

        console.log(`[RazorpayX Webhook] Received event: ${event}`);

        if (!payload || !payload.payout || !payload.payout.entity) {
            return NextResponse.json({ success: false, message: "Invalid payload" }, { status: 400 });
        }

        const payoutData = payload.payout.entity;
        const payoutId = payoutData.reference_id; // Mapping referenceId back to our DB _id

        await connectDB();
        const payout = await Payout.findById(payoutId);

        if (!payout) {
            console.error(`[RazorpayX Webhook] Payout not found for reference_id: ${payoutId}`);
            return NextResponse.json({ success: false, message: "Payout not found" }, { status: 404 });
        }

        if (event === "payout.processed") {
            payout.status = "paid";
            payout.processedAt = new Date();
            payout.utr = payoutData.utr;
            await payout.save();

            // Decrement Pandit earnings
            const pandit = await Pandit.findById(payout.panditId);
            if (pandit) {
                pandit.unpaidEarnings = Math.max(0, pandit.unpaidEarnings - payout.amount);
                await pandit.save();

                // Notify Pandit
                try {
                    await Notification.create({
                        recipientId: pandit._id,
                        recipientModel: "Pandit",
                        title: "Payment Processed! 💰",
                        message: `Your payout of ₹${payout.amount} has been processed successfully.`,
                        type: "system",
                        link: `/pandit/earnings`
                    });

                    if (pandit.whatsapp) {
                        await sendWhatsApp(
                            pandit.whatsapp,
                            `🙏 *Jai Shri Ram, Panditji!*\n\n*Update:* Your payout has been successfully processed.\n\n💰 *Amount:* ₹${payout.amount}\n✅ *Status:* Paid\n🏦 *UTR:* ${payoutData.utr || 'N/A'}\n\nThe amount has been credited to your account. Thank you for your service.\n\n🛕 *Mandirlok — Divine Blessings Delivered*`
                        );
                    }
                } catch (err) {
                    console.error("[Webhook Notification Error]", err);
                }
            }
        } else if (event === "payout.failed" || event === "payout.rejected") {
            payout.status = "requested"; // Reset to requested so admin can try again or fix details
            payout.failureReason = payoutData.failure_reason || "Transaction failed";
            await payout.save();

            // Notify Admin/Pandit about failure
            console.error(`[RazorpayX Webhook] Payout failed: ${payout.failureReason}`);
        }

        // revalidatePath is tricky in API routes if not correctly configured, but let's try
        // Better to use a reliable way if needed.

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("[RazorpayX Webhook Error]", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
