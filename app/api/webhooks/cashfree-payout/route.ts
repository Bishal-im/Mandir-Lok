import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Payout from "@/models/Payout";
import Pandit from "@/models/Pandit";
import Notification from "@/models/Notification";
import { sendWhatsApp } from "@/lib/whatsapp";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { event, transferId, referenceId, utr, amount } = body;

        console.log(`[Cashfree Payout Webhook] Received event: ${event} for transferId: ${transferId}`);

        // Extract our DB payout ID from transferId (which we prefixed with 'payout_')
        const payoutId = transferId.replace("payout_", "");

        await connectDB();
        const payout = await Payout.findById(payoutId);

        if (!payout) {
            console.error(`[Cashfree Payout Webhook] Payout not found for ID: ${payoutId}`);
            return NextResponse.json({ success: false, message: "Payout not found" }, { status: 404 });
        }

        if (event === "TRANSFER_SUCCESS") {
            payout.status = "paid";
            payout.processedAt = new Date();
            payout.utr = utr;
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
                            `🙏 *Jai Shri Ram, Panditji!*\n\n*Update:* Your payout has been successfully processed.\n\n💰 *Amount:* ₹${payout.amount}\n✅ *Status:* Paid\n🏦 *UTR:* ${utr || 'N/A'}\n\nThe amount has been credited to your account. Thank you for your service.\n\n🛕 *Mandirlok — Divine Blessings Delivered*`
                        );
                    }
                } catch (err) {
                    console.error("[Webhook Notification Error]", err);
                }
            }
        } else if (event === "TRANSFER_FAILED" || event === "TRANSFER_REJECTED") {
            payout.status = "requested"; 
            payout.failureReason = body.reason || "Transaction failed";
            await payout.save();

            console.error(`[Cashfree Payout Webhook] Payout failed: ${payout.failureReason}`);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("[Cashfree Payout Webhook Error]", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
