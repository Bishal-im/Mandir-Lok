"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "../db";
import Review from "../../models/Review";
import Order from "../../models/Order";
import Notification from "../../models/Notification";
import { Types } from "mongoose";

export async function submitReview(data: {
  userId: string;
  orderId: string;
  poojaId: string;
  templeId: string;
  panditId?: string;
  rating: number;
  comment: string;
}) {
  try {
    await connectDB();

    // Check if order exists and is completed
    const order = await Order.findById(data.orderId);
    if (!order) throw new Error("Order not found");
    if (order.orderStatus !== "completed") {
      throw new Error("Review can only be submitted for completed orders");
    }

    // Use findOneAndUpdate to handle both creation and editing
    const review = await Review.findOneAndUpdate(
      { orderId: new Types.ObjectId(data.orderId) },
      {
        userId: new Types.ObjectId(data.userId),
        poojaId: new Types.ObjectId(data.poojaId),
        templeId: new Types.ObjectId(data.templeId),
        panditId: data.panditId ? new Types.ObjectId(data.panditId) : null,
        rating: data.rating,
        comment: data.comment,
        isApproved: false, // Reset approval on any change
        isFeatured: false,
      },
      { upsert: true, new: true }
    );

    revalidatePath(`/bookings/${data.orderId}`);
    revalidatePath("/dashboard");

    // Create Admin Notification for review submission
    try {
      await Notification.create({
        recipientId: new Types.ObjectId(data.userId),
        recipientModel: "Admin",
        title: "New Review Submitted! ⭐",
        message: `A new ${data.rating}-star review has been submitted for ${(order.poojaId as any)?.name || 'a pooja'}.`,
        type: "system",
        link: "/admin/reviews"
      });
    } catch (notifError) {
      console.error("Failed to create admin notification (review):", notifError);
    }

    return { success: true, data: JSON.parse(JSON.stringify(review)) };
  } catch (error: any) {
    console.error("[SUBMIT_REVIEW_ERROR]", error);
    return { success: false, error: error.message };
  }
}

export async function getHomepageReviews() {
  try {
    await connectDB();
    // Fetch approved reviews, prioritized featured ones, latest first
    const reviews = await Review.find({ isApproved: true })
      .populate("userId", "name photo")
      .populate("templeId", "name location")
      .sort({ isFeatured: -1, createdAt: -1 })
      .limit(10) // Fetch a few more to allow for filtering
      .lean();

    // Filter out reviews where population failed (referenced doc deleted)
    const validReviews = (reviews as any[]).filter(rev => rev.userId && rev.templeId).slice(0, 6);

    return { success: true, data: JSON.parse(JSON.stringify(validReviews)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAdminReviews() {
  try {
    await connectDB();
    const reviews = await Review.find()
      .populate("userId", "name email phone")
      .populate("poojaId", "name")
      .populate("templeId", "name")
      .sort({ createdAt: -1 })
      .lean();

    return { success: true, data: JSON.parse(JSON.stringify(reviews)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateReviewStatus(id: string, updates: { isApproved?: boolean; isFeatured?: boolean }) {
  try {
    await connectDB();
    const review = await Review.findByIdAndUpdate(id, updates, { new: true });

    revalidatePath("/"); // Update homepage
    revalidatePath("/admin/reviews");

    return { success: true, data: JSON.parse(JSON.stringify(review)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteReview(id: string) {
  try {
    await connectDB();
    await Review.findByIdAndDelete(id);
    revalidatePath("/");
    revalidatePath("/admin/reviews");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getReviewByOrder(orderId: string) {
  try {
    await connectDB();
    const review = await Review.findOne({ orderId }).lean();
    return review ? JSON.parse(JSON.stringify(review)) : null;
  } catch (error) {
    return null;
  }
}
