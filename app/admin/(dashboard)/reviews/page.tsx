"use client";

import { useState, useEffect } from "react";
import { Star, Check, X, Trash2, Shield, ShieldAlert, MessageSquare } from "lucide-react";
import { getAdminReviews, updateReviewStatus, deleteReview } from "@/lib/actions/reviews";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");

  const fetchReviews = async () => {
    setLoading(true);
    const res = await getAdminReviews();
    if (res.success) {
      setReviews(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleStatusUpdate = async (id: string, isApproved: boolean) => {
    const res = await updateReviewStatus(id, { isApproved });
    if (res.success) {
      setReviews(reviews.map((r) => (r._id === id ? { ...r, isApproved } : r)));
    }
  };

  const handleToggleFeatured = async (id: string, isFeatured: boolean) => {
    const res = await updateReviewStatus(id, { isFeatured });
    if (res.success) {
      setReviews(reviews.map((r) => (r._id === id ? { ...r, isFeatured } : r)));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    const res = await deleteReview(id);
    if (res.success) {
      setReviews(reviews.filter((r) => r._id !== id));
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (filter === "pending") return !r.isApproved;
    if (filter === "approved") return r.isApproved;
    return true;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="text-orange-500" />
            User Reviews
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage and moderate user feedback appearing on the homepage.
          </p>
        </div>

        <div className="flex bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
          {(["all", "pending", "approved"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filter === f
                  ? "bg-orange-500 text-white shadow-md shadow-orange-100"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white h-48 rounded-2xl border border-gray-100 animate-pulse" />
          ))}
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-3xl p-12 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="text-gray-300" size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No reviews found</h3>
          <p className="text-gray-500 max-w-sm mx-auto mt-2">
            All user reviews will appear here for your moderation and approval.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredReviews.map((review) => (
            <div
              key={review._id}
              className={`bg-white rounded-2xl border transition-all duration-300 ${
                review.isApproved ? "border-gray-100 shadow-sm" : "border-orange-200 shadow-orange-50 shadow-lg"
              }`}
            >
              {/* Review Header */}
              <div className="p-5 border-b border-gray-50 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    {review.userId?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{review.userId?.name || "Unknown User"}</h4>
                    <p className="text-xs text-gray-400">{review.userId?.email || "No email provided"}</p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={14}
                      className={s <= review.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}
                    />
                  ))}
                </div>
              </div>

              {/* Review Body */}
              <div className="p-5">
                <p className="text-sm text-gray-700 leading-relaxed mb-4 italic">
                  "{review.comment || "No comment provided."}"
                </p>
                <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-widest font-bold">
                  <span className="bg-orange-50 text-orange-600 px-2 py-1 rounded border border-orange-100">
                    📿 {review.poojaId?.name || "Deleted Pooja"}
                  </span>
                  <span className="bg-gray-50 text-gray-500 px-2 py-1 rounded border border-gray-100">
                    🛕 {review.templeId?.name || "Deleted Temple"}
                  </span>
                </div>
              </div>

              {/* Review Actions */}
              <div className="p-4 bg-gray-50/50 rounded-b-2xl border-t border-gray-100 flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStatusUpdate(review._id, !review.isApproved)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      review.isApproved
                        ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                        : "bg-green-500 text-white hover:bg-green-600 shadow-md shadow-green-100"
                    }`}
                  >
                    {review.isApproved ? (
                      <>
                        <X size={14} /> Unapprove
                      </>
                    ) : (
                      <>
                        <Check size={14} /> Approve
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleToggleFeatured(review._id, !review.isFeatured)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      review.isFeatured
                        ? "bg-amber-500 text-white hover:bg-amber-600 shadow-md shadow-amber-100"
                        : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {review.isFeatured ? (
                      <>
                        <Shield size={14} /> Featured
                      </>
                    ) : (
                      <>
                        <ShieldAlert size={14} /> Feature
                      </>
                    )}
                  </button>
                </div>

                <button
                  onClick={() => handleDelete(review._id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
