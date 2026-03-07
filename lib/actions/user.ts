"use server";

import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Notification from "@/models/Notification";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import mongoose from "mongoose";

async function getAuthUser() {
  const token = cookies().get("mandirlok_token")?.value;
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded || !decoded.userId) return null;

  return decoded.userId;
}

export async function toggleChadhavaFavorite(chadhavaId: string) {
  try {
    const userId = await getAuthUser();
    if (!userId) return { success: false, message: "Please login to favorite" };

    await connectDB();

    const user = await User.findById(userId);
    if (!user) return { success: false, message: "User not found" };

    const favIndex = user.savedChadhava.findIndex(
      (id) => id.toString() === chadhavaId
    );

    let isAdded = false;
    if (favIndex > -1) {
      user.savedChadhava.splice(favIndex, 1);
    } else {
      user.savedChadhava.push(new mongoose.Types.ObjectId(chadhavaId) as any);
      isAdded = true;
    }

    await user.save();
    return { success: true, isAdded };
  } catch (error: any) {
    console.error("toggleChadhavaFavorite error:", error);
    return { success: false, message: error.message };
  }
}

export async function getUserFavorites() {
  try {
    const userId = await getAuthUser();
    if (!userId) return { success: true, data: [] };

    await connectDB();
    const user = await User.findById(userId).select("savedChadhava");
    return { success: true, data: user?.savedChadhava.map(id => id.toString()) || [] };
  } catch (error: any) {
    console.error("getUserFavorites error:", error);
    return { success: false, message: error.message };
  }
}

export async function toggleTempleFavorite(templeId: string) {
  try {
    const userId = await getAuthUser();
    if (!userId) return { success: false, message: "Please login to favorite" };

    await connectDB();

    const user = await User.findById(userId);
    if (!user) return { success: false, message: "User not found" };

    const favIndex = user.savedTemples.findIndex(
      (id) => id.toString() === templeId
    );

    let isAdded = false;
    if (favIndex > -1) {
      user.savedTemples.splice(favIndex, 1);
    } else {
      user.savedTemples.push(new mongoose.Types.ObjectId(templeId) as any);
      isAdded = true;
    }

    await user.save();
    return { success: true, isAdded };
  } catch (error: any) {
    console.error("toggleTempleFavorite error:", error);
    return { success: false, message: error.message };
  }
}

export async function getUserTempleFavorites() {
  try {
    const userId = await getAuthUser();
    if (!userId) return { success: true, data: [] };

    await connectDB();
    const user = await User.findById(userId).select("savedTemples");
    return { success: true, data: user?.savedTemples.map(id => id.toString()) || [] };
  } catch (error: any) {
    console.error("getUserTempleFavorites error:", error);
    return { success: false, message: error.message };
  }
}
export async function getSavedTemples() {
  try {
    const userId = await getAuthUser();
    if (!userId) return { success: true, data: [] };

    await connectDB();
    const user = await User.findById(userId)
      .populate("savedTemples")
      .lean();

    // Explicitly convert to plain JSON to avoid any Mongoose internal structures
    const savedTemples = JSON.parse(JSON.stringify(user?.savedTemples || []));

    return { success: true, data: savedTemples };
  } catch (error: any) {
    console.error("getSavedTemples error:", error);
    return { success: false, message: error.message };
  }
}

export async function updateProfile(data: { name?: string; email?: string; photo?: string }) {
  try {
    const userId = await getAuthUser();
    if (!userId) return { success: false, message: "Please login to update profile" };

    await connectDB();
    const user = await User.findById(userId);
    if (!user) return { success: false, message: "User not found" };

    if (data.name) user.name = data.name;
    if (data.email) user.email = data.email;
    if (data.photo) user.photo = data.photo;

    await user.save();
    return { success: true, message: "Profile updated successfully" };
  } catch (error: any) {
    console.error("updateProfile error:", error);
    return { success: false, message: error.message };
  }
}

export async function getNotifications() {
  try {
    const userId = await getAuthUser();
    if (!userId) return { success: false, message: "Please login" };

    await connectDB();
    const notifications = await Notification.find({ recipientId: userId, recipientModel: "User" })
      .sort({ createdAt: -1 })
      .lean();

    return { success: true, data: JSON.parse(JSON.stringify(notifications)) };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function markNotificationRead(id: string) {
  try {
    const userId = await getAuthUser();
    if (!userId) return { success: false, message: "Please login" };

    await connectDB();
    await Notification.findOneAndUpdate({ _id: id, recipientId: userId, recipientModel: "User" }, { read: true });

    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function deleteNotification(id: string) {
  try {
    const userId = await getAuthUser();
    if (!userId) return { success: false, message: "Please login" };

    await connectDB();
    await Notification.findOneAndDelete({ _id: id, recipientId: userId, recipientModel: "User" });

    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
