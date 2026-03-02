"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "../db";
import Temple from "../../models/Temple";
import Pooja from "../../models/Pooja";
import Chadhava from "../../models/Chadhava";
import Pandit from "../../models/Pandit";
import Order from "../../models/Order";
import User from "../../models/User";
import Settings from "../../models/Settings";
import Payout from "../../models/Payout"; // Import Payout model
import Notification from "../../models/Notification"; // Import Notification model
import { sendWhatsApp } from "../whatsapp";
import mongoose from "mongoose";
import * as RazorpayX from "../razorpayX";

// =======================
// DASHBOARD STATS
// =======================
export async function getDashboardStats() {
    await connectDB();

    try {
        const totalOrders = await Order.countDocuments();

        // Revenue is calculated only for completed or paid orders
        const result = await Order.aggregate([
            { $match: { paymentStatus: "paid" } },
            { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }
        ]);
        const totalRevenue = result.length > 0 ? result[0].totalRevenue : 0;

        const totalUsers = await User.countDocuments();
        const totalPandits = await Pandit.countDocuments({ isActive: true });

        return { totalOrders, totalRevenue, totalUsers, totalPandits, success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// =======================
// TEMPLE CRUD
// =======================
export async function getTemplesAdmin() {
    await connectDB();
    const temples = await Temple.find().sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(temples));
}

export async function createTemple(data: any) {
    try {
        await connectDB();
        const temple = await Temple.create(data);
        revalidatePath("/admin/temples");
        return { success: true, temple: JSON.parse(JSON.stringify(temple)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateTemple(id: string, data: any) {
    try {
        await connectDB();
        const temple = await Temple.findByIdAndUpdate(id, data, { new: true });
        if (!temple) return { success: false, error: "Temple not found" };
        revalidatePath("/admin/temples");
        revalidatePath("/temples");
        revalidatePath(`/temples/${id}`);
        if (temple.slug) revalidatePath(`/temples/${temple.slug}`);
        return { success: true, temple: JSON.parse(JSON.stringify(temple)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteTemple(id: string) {
    try {
        await connectDB();
        const temple = await Temple.findByIdAndDelete(id);
        revalidatePath("/admin/temples");
        revalidatePath("/temples");
        revalidatePath(`/temples/${id}`);
        if (temple && "slug" in temple && temple.slug) {
            revalidatePath(`/temples/${temple.slug}`);
        }
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getTempleById(id: string) {
    await connectDB();
    const temple = await Temple.findById(id).lean();
    return temple ? JSON.parse(JSON.stringify(temple)) : null;
}

// =======================
// POOJA CRUD
// =======================
export async function getPoojasAdmin() {
    await connectDB();
    const poojas = await Pooja.find().populate("templeId", "name").sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(poojas));
}

export async function createPooja(data: any) {
    try {
        await connectDB();
        const pooja = await Pooja.create(data);
        // Sync Temple pujasAvailable count
        if (data.templeId) {
            await Temple.findByIdAndUpdate(data.templeId, { $inc: { pujasAvailable: 1 } });
        }
        revalidatePath("/admin/poojas");
        return { success: true, pooja: JSON.parse(JSON.stringify(pooja)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updatePooja(id: string, data: any) {
    try {
        await connectDB();
        const pooja = await Pooja.findByIdAndUpdate(id, data, { new: true });
        revalidatePath("/admin/poojas");
        revalidatePath("/poojas");
        return { success: true, pooja: JSON.parse(JSON.stringify(pooja)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deletePooja(id: string) {
    try {
        await connectDB();
        const pooja = await Pooja.findById(id);
        if (pooja) {
            await Pooja.findByIdAndDelete(id);
            // Sync Temple pujasAvailable count
            await Temple.findByIdAndUpdate(pooja.templeId, { $inc: { pujasAvailable: -1 } });
        }
        revalidatePath("/admin/poojas");
        revalidatePath("/poojas");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getPoojaById(id: string) {
    await connectDB();
    const pooja = await Pooja.findById(id).lean();
    return pooja ? JSON.parse(JSON.stringify(pooja)) : null;
}

// =======================
// CHADHAVA CRUD
// =======================
export async function getChadhavaAdmin() {
    await connectDB();
    const chadhava = await Chadhava.find().populate("templeId", "name").sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(chadhava));
}

export async function createChadhava(data: any) {
    try {
        await connectDB();
        const chadhava = await Chadhava.create(data);
        revalidatePath("/admin/chadhava");
        return { success: true, chadhava: JSON.parse(JSON.stringify(chadhava)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateChadhava(id: string, data: any) {
    try {
        await connectDB();
        const chadhava = await Chadhava.findByIdAndUpdate(id, data, { new: true });
        revalidatePath("/admin/chadhava");
        return { success: true, chadhava: JSON.parse(JSON.stringify(chadhava)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteChadhava(id: string) {
    try {
        await connectDB();
        await Chadhava.findByIdAndDelete(id);
        revalidatePath("/admin/chadhava");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getChadhavaById(id: string) {
    await connectDB();
    const item = await Chadhava.findById(id).lean();
    return item ? JSON.parse(JSON.stringify(item)) : null;
}

// =======================
// PANDIT CRUD
// =======================
export async function getPanditsAdmin() {
    await connectDB();
    const pandits = await Pandit.find().populate("assignedTemples", "name").sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(pandits));
}

export async function createPandit(data: any) {
    try {
        await connectDB();
        const pandit = await Pandit.create(data);
        revalidatePath("/admin/pandits");
        return { success: true, pandit: JSON.parse(JSON.stringify(pandit)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updatePandit(id: string, data: any) {
    try {
        await connectDB();
        const pandit = await Pandit.findByIdAndUpdate(id, data, { new: true });
        revalidatePath("/admin/pandits");
        return { success: true, pandit: JSON.parse(JSON.stringify(pandit)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deletePandit(id: string) {
    try {
        await connectDB();
        await Pandit.findByIdAndDelete(id);
        revalidatePath("/admin/pandits");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getPanditById(id: string) {
    await connectDB();
    const pandit = await Pandit.findById(id).lean();
    return pandit ? JSON.parse(JSON.stringify(pandit)) : null;
}

// =======================
// ORDER MANAGEMENT
// =======================
export async function getOrdersAdmin() {
    await connectDB();
    const orders = await Order.find()
        .populate("userId", "name email phone")
        .populate("templeId", "name")
        .populate("poojaId", "name")
        .populate("panditId", "name")
        .sort({ createdAt: -1 })
        .lean();
    return JSON.parse(JSON.stringify(orders));
}

export async function getOrderById(id: string) {
    await connectDB();
    const order = await Order.findById(id)
        .populate("userId", "name email phone")
        .populate("templeId", "name")
        .populate("poojaId", "name")
        .populate("panditId", "name")
        .lean();
    return order ? JSON.parse(JSON.stringify(order)) : null;
}

export async function updateOrderStatus(id: string, status: string) {
    try {
        await connectDB();
        const order = await Order.findByIdAndUpdate(id, { orderStatus: status }, { returnDocument: 'after' });
        revalidatePath("/admin/orders");
        revalidatePath("/admin");
        return { success: true, order: JSON.parse(JSON.stringify(order)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function assignPanditToOrder(orderId: string, panditId: string) {
    try {
        await connectDB();
        const order = await Order.findByIdAndUpdate(
            orderId,
            { panditId, orderStatus: "assigned" },
            { returnDocument: 'after' }
        ).populate("panditId", "name whatsapp").populate("poojaId", "name");

        if (order) {
            try {
                await sendWhatsApp(
                    order.whatsapp,
                    `🙏 *Jai Shri Ram!*\n\n*Update:* A Pandit has been assigned for your pooja.\n\n📿 *Pooja:* ${(order.poojaId as any)?.name}\n🧘 *Pandit:* ${(order.panditId as any)?.name}\n📋 *Booking ID:* ${order.bookingId}\n\nYou will receive another update when the pooja starts.\n\n🛕 *Mandirlok — Divine Blessings Delivered*`
                );
            } catch (e) {
                console.error("[WhatsApp pandit assigned notification failed]", e);
            }

            // Notify Pandit via WhatsApp
            if ((order.panditId as any)?.whatsapp) {
                try {
                    await sendWhatsApp(
                        (order.panditId as any).whatsapp,
                        `🛕 *New Pooja Assigned — Mandirlok*\n\n📿 *Pooja:* ${(order.poojaId as any)?.name}\n📅 *Date:* ${new Date(order.bookingDate).toLocaleDateString("en-IN")}\n📋 *Booking ID:* ${order.bookingId}\n\nPlease log in to your Pandit Portal to view full details.`
                    );
                } catch (waError) {
                    console.error("[WhatsApp pandit assignment notification failed]", waError);
                }
            }

            // Create in-app notification for Pandit
            try {
                await Notification.create({
                    recipientId: panditId,
                    recipientModel: "Pandit",
                    title: "New Puja Assigned! 📿",
                    message: `You have been assigned to a new pooja: ${(order.poojaId as any)?.name}.`,
                    type: "booking",
                    link: `/pandit/orders`
                });
            } catch (notifError) {
                console.error("Failed to create in-app notification for pandit (assignment):", notifError);
            }
        }

        revalidatePath("/admin/orders");
        return { success: true, order: JSON.parse(JSON.stringify(order)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateOrderVideo(orderId: string, videoUrl: string) {
    try {
        await connectDB();
        const order = await Order.findByIdAndUpdate(
            orderId,
            { videoUrl, videoSentAt: new Date(), orderStatus: "completed" },
            { returnDocument: 'after' }
        ).populate("poojaId", "name");

        if (order) {
            try {
                await sendWhatsApp(
                    order.whatsapp,
                    `🙏 *Jai Shri Ram!*\n\n*Update:* Your pooja has been successfully completed.\n\n📿 *Pooja:* ${(order.poojaId as any)?.name}\n📋 *Booking ID:* ${order.bookingId}\n📹 *Video Link:* ${videoUrl}\n\nMay the deities bless you and your family.\n\n🛕 *Mandirlok — Divine Blessings Delivered*`
                );
            } catch (e) {
                console.error("[WhatsApp pooja completed notification failed]", e);
            }
        }

        revalidatePath("/admin/orders");
        return { success: true, order: JSON.parse(JSON.stringify(order)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// =======================
// PAYMENT & FINANCE ACTIONS
// =======================
export async function getTransactionsAdmin() {
    await connectDB();
    try {
        const transactions = await Order.find({ paymentStatus: "paid" })
            .populate("userId", "name email")
            .populate("poojaId", "name")
            .populate("templeId", "name")
            .sort({ createdAt: -1 })
            .lean();
        return JSON.parse(JSON.stringify(transactions));
    } catch (error: any) {
        console.error("getTransactionsAdmin error:", error);
        return [];
    }
}

export async function getPayoutsAdmin() {
    await connectDB();
    try {
        const Payout = mongoose.models.Payout || mongoose.model("Payout");
        const payouts = await Payout.find()
            .populate("panditId", "name")
            .sort({ createdAt: -1 })
            .lean();
        return JSON.parse(JSON.stringify(payouts));
    } catch (error: any) {
        console.error("getPayoutsAdmin error:", error);
        return [];
    }
}

export async function updatePayoutStatus(id: string, status: string) {
    try {
        await connectDB();
        const Payout = mongoose.models.Payout || mongoose.model("Payout");

        // Find existing payout
        const existingPayout = await Payout.findById(id);
        if (!existingPayout) return { success: false, error: "Payout not found" };

        // If transitioning to "paid", decrement pandit earnings
        if (status === "paid" && existingPayout.status !== "paid") {
            const pandit = await Pandit.findById(existingPayout.panditId);
            if (pandit) {
                // Ensure they don't go below 0 (should already be checked by request logic but for safety)
                pandit.unpaidEarnings = Math.max(0, pandit.unpaidEarnings - existingPayout.amount);
                await pandit.save();
            }
        }

        // Handle Rejection: If status was "paid" and now is changed back (though rare), maybe we should increment? 
        // But the user specifically asked for "already paid" fix.
        // Actually, if we reject a "requested" payout, no change to earnings is needed.

        existingPayout.status = status;
        if (status === "paid") existingPayout.processedAt = new Date();
        await existingPayout.save();

        // Create in-app notification for Pandit on payment
        if (status === "paid") {
            try {
                const pandit = await Pandit.findById(existingPayout.panditId);

                // In-app Notification
                await Notification.create({
                    recipientId: existingPayout.panditId,
                    recipientModel: "Pandit",
                    title: "Payment Processed! 💰",
                    message: `Your payout of ₹${existingPayout.amount} has been processed successfully.`,
                    type: "system",
                    link: `/pandit/earnings`
                });

                // WhatsApp Notification
                if (pandit && pandit.whatsapp) {
                    await sendWhatsApp(
                        pandit.whatsapp,
                        `🙏 *Jai Shri Ram, Panditji!*\n\n*Update:* Your payout request has been processed.\n\n💰 *Amount:* ₹${existingPayout.amount}\n✅ *Status:* Paid\n📅 *Date:* ${new Date().toLocaleDateString("en-IN")}\n\nThe amount has been transferred to your registered account. Thank you for your divine service.\n\n🛕 *Mandirlok — Divine Blessings Delivered*`
                    );
                }
            } catch (notifError) {
                console.error("Failed to send payment notifications to pandit:", notifError);
            }
        }

        revalidatePath("/admin/payments/payouts");
        return { success: true, payout: JSON.parse(JSON.stringify(existingPayout)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// =======================
// ANALYTICS ACTIONS
// =======================
export async function getAnalyticsData() {
    await connectDB();
    try {
        // Daily Revenue for last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const revenueData = await Order.aggregate([
            { $match: { paymentStatus: "paid", createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    revenue: { $sum: "$totalAmount" },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // Top Temples
        const topTemples = await Order.aggregate([
            { $match: { paymentStatus: "paid" } },
            {
                $group: {
                    _id: "$templeId",
                    revenue: { $sum: "$totalAmount" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { revenue: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "temples",
                    localField: "_id",
                    foreignField: "_id",
                    as: "temple"
                }
            },
            { $unwind: "$temple" },
            {
                $project: {
                    name: "$temple.name",
                    revenue: 1,
                    count: 1
                }
            }
        ]);

        // Top Poojas
        const topPoojas = await Order.aggregate([
            { $match: { paymentStatus: "paid" } },
            {
                $group: {
                    _id: "$poojaId",
                    revenue: { $sum: "$totalAmount" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { revenue: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "poojas",
                    localField: "_id",
                    foreignField: "_id",
                    as: "pooja"
                }
            },
            { $unwind: "$pooja" },
            {
                $project: {
                    name: "$pooja.name",
                    revenue: 1,
                    count: 1
                }
            }
        ]);

        return {
            success: true,
            revenueData,
            topTemples,
            topPoojas
        };
    } catch (error: any) {
        console.error("getAnalyticsData error:", error);
        return { success: false, error: error.message };
    }
}

// =======================
// SETTINGS MANAGEMENT
// =======================
export async function getSettings(key: string) {
    await connectDB();
    const setting = await Settings.findOne({ key }).lean();
    return setting ? JSON.parse(JSON.stringify(setting)) : null;
}

export async function updateSettings(key: string, value: any, description?: string) {
    try {
        await connectDB();
        const setting = await Settings.findOneAndUpdate(
            { key },
            { value, description },
            { new: true, upsert: true }
        );
        revalidatePath("/"); // Revalidate landing page
        return { success: true, setting: JSON.parse(JSON.stringify(setting)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function processPayoutWithRazorpayX(payoutId: string) {
    try {
        await connectDB();
        const PayoutModel = mongoose.models.Payout || mongoose.model("Payout");
        const payout = await PayoutModel.findById(payoutId).populate("panditId");

        if (!payout) return { success: false, error: "Payout not found" };
        if (payout.status !== "requested" && payout.status !== "processing") {
            return { success: false, error: `Cannot process payout in ${payout.status} status` };
        }

        const pandit = payout.panditId;
        if (!pandit) return { success: false, error: "Pandit not found" };

        if (!pandit.razorpayContactId) {
            const contact = await RazorpayX.createContact(
                pandit.name,
                pandit.email || "pandit@mandirlok.com",
                pandit.phone,
                pandit._id.toString()
            );
            pandit.razorpayContactId = contact.id;
            await pandit.save();
        }

        if (!pandit.razorpayFundAccountId) {
            let fundAccount;
            if (payout.upiId) {
                fundAccount = await RazorpayX.createFundAccount(pandit.razorpayContactId, "vpa", { vpa: payout.upiId });
            } else {
                return { success: false, error: "Only UPI payouts are supported automatically for now." };
            }
            pandit.razorpayFundAccountId = fundAccount.id;
            await pandit.save();
        }

        const razorpayXAccount = process.env.RAZORPAYX_ACCOUNT_NUMBER?.trim();
        if (!razorpayXAccount) return { success: false, error: "RazorpayX account number (RAZORPAYX_ACCOUNT_NUMBER) not configured" };

        const rpPayout = await RazorpayX.createRazorpayPayout({
            accountNumber: razorpayXAccount,
            fundAccountId: pandit.razorpayFundAccountId,
            amount: payout.amount,
            currency: "INR",
            mode: "UPI",
            purpose: "payout",
            queueIfLowBalance: true,
            referenceId: payout._id.toString(),
            narrative: "Pandit Payout - Mandirlok"
        });

        payout.status = "processing";
        payout.razorpayPayoutId = rpPayout.id;
        await payout.save();

        revalidatePath("/admin/payments/payouts");
        return { success: true, payout: JSON.parse(JSON.stringify(payout)) };

    } catch (error: any) {
        console.error("processPayoutWithRazorpayX error:", error);
        return { success: false, error: error.message || "Failed to initiate payout" };
    }
}
