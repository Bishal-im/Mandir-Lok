"use server";

import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Notification from "@/models/Notification";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

async function getAuthPandit() {
    const token = cookies().get("mandirlok_pandit_token")?.value;
    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded || !decoded.panditId) return null;

    return decoded.panditId;
}

export async function getPanditNotifications() {
    try {
        const panditId = await getAuthPandit();
        if (!panditId) return { success: false, message: "Please login" };

        await connectDB();
        const notifications = await Notification.find({
            recipientId: panditId,
            recipientModel: "Pandit"
        })
            .sort({ createdAt: -1 })
            .lean();

        return { success: true, data: JSON.parse(JSON.stringify(notifications)) };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function markPanditNotificationRead(id: string) {
    try {
        const panditId = await getAuthPandit();
        if (!panditId) return { success: false, message: "Please login" };

        await connectDB();
        await Notification.findOneAndUpdate(
            { _id: id, recipientId: panditId, recipientModel: "Pandit" },
            { read: true }
        );

        return { success: true };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function deletePanditNotification(id: string) {
    try {
        const panditId = await getAuthPandit();
        if (!panditId) return { success: false, message: "Please login" };

        await connectDB();
        await Notification.findOneAndDelete({
            _id: id,
            recipientId: panditId,
            recipientModel: "Pandit"
        });

        return { success: true };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function getUnreadNotificationCount() {
    try {
        const panditId = await getAuthPandit();
        if (!panditId) return { success: false, data: 0 };

        await connectDB();
        const count = await Notification.countDocuments({
            recipientId: panditId,
            recipientModel: "Pandit",
            read: false
        });

        return { success: true, data: count };
    } catch (error: any) {
        return { success: false, data: 0 };
    }
}

// =======================
// ADMIN NOTIFICATIONS
// =======================

async function getAuthAdmin() {
    const token = cookies().get("mandirlok_token")?.value;
    if (!token) {
        return null;
    }

    const decoded = verifyToken(token);
    if (!decoded) {
        return null;
    }

    if (decoded.role !== "admin") {
        return null;
    }

    return decoded.userId;
}

export async function getAdminNotifications() {
    try {
        const adminId = await getAuthAdmin();
        if (!adminId) return { success: false, message: "Please login as admin" };

        await connectDB();
        const notifications = await Notification.find({
            recipientId: adminId,
            recipientModel: "Admin"
        })
            .sort({ createdAt: -1 })
            .lean();

        return { success: true, data: JSON.parse(JSON.stringify(notifications)) };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function markAdminNotificationRead(id: string) {
    try {
        const adminId = await getAuthAdmin();
        if (!adminId) return { success: false, message: "Please login as admin" };

        await connectDB();
        await Notification.findByIdAndUpdate(id, { read: true });

        const { revalidatePath } = await import("next/cache");
        revalidatePath("/admin/notifications");
        revalidatePath("/admin");

        return { success: true };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function deleteAdminNotification(id: string) {
    try {
        const adminId = await getAuthAdmin();
        if (!adminId) return { success: false, message: "Please login as admin" };

        await connectDB();
        await Notification.findOneAndDelete({
            _id: id,
            recipientId: adminId,
            recipientModel: "Admin"
        });

        const { revalidatePath } = await import("next/cache");
        revalidatePath("/admin/notifications");
        revalidatePath("/admin");

        return { success: true };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function getUnreadAdminNotificationCount() {
    try {
        const adminId = await getAuthAdmin();
        if (!adminId) return { success: false, data: 0 };

        await connectDB();
        const count = await Notification.countDocuments({
            recipientId: new mongoose.Types.ObjectId(adminId),
            recipientModel: "Admin",
            read: false
        });

        return { success: true, data: count };
    } catch (error: any) {
        return { success: false, data: 0 };
    }
}
