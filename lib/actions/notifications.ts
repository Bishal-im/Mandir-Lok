"use server";

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
    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "admin") return null;

    return decoded.userId;
}

export async function getAdminNotifications() {
    try {
        const adminId = await getAuthAdmin();
        if (!adminId) return { success: false, message: "Please login as admin" };

        await connectDB();
        const notifications = await Notification.find({
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

export async function getUnreadAdminNotificationCount() {
    try {
        const adminId = await getAuthAdmin();
        if (!adminId) return { success: false, data: 0 };

        await connectDB();
        const count = await Notification.countDocuments({
            recipientModel: "Admin",
            read: false
        });

        return { success: true, data: count };
    } catch (error: any) {
        return { success: false, data: 0 };
    }
}

// =======================
// USER NOTIFICATIONS (SHARED)
// =======================

async function getAuthUser() {
    const token = cookies().get("mandirlok_token")?.value;
    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) return null;

    return decoded.userId;
}

export async function getUnreadUserNotificationCount() {
    try {
        const userId = await getAuthUser();
        if (!userId) return { success: false, data: 0 };

        await connectDB();
        const count = await Notification.countDocuments({
            recipientId: userId,
            recipientModel: "User",
            read: false
        });

        return { success: true, data: count };
    } catch (error: any) {
        return { success: false, data: 0 };
    }
}

export async function markAllNotificationsRead(role: "Admin" | "Pandit" | "User") {
    try {
        let recipientId;
        if (role === "Admin") recipientId = await getAuthAdmin();
        else if (role === "Pandit") recipientId = await getAuthPandit();
        else recipientId = await getAuthUser();

        if (!recipientId && role !== "Admin") return { success: false, message: "Please login" };

        await connectDB();
        const query: any = { recipientModel: role, read: false };
        if (role !== "Admin") query.recipientId = recipientId;

        await Notification.updateMany(query, { read: true });

        const { revalidatePath } = await import("next/cache");
        if (role === "Admin") revalidatePath("/admin/notifications");
        else if (role === "Pandit") revalidatePath("/pandit/notifications");
        else revalidatePath("/dashboard/notifications");

        return { success: true };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

