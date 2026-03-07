"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Calendar, Clock, Download, ChevronRight, Video, Star, Building2, Flame, BookOpen, CheckCircle2, CalendarOff } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { formatCurrency, convertINRtoUSD } from "@/lib/currency";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Order {
  _id: string;
  bookingId: string;
  poojaId: {
    _id: string;
    name: string;
    emoji: string;
    duration: string;
    images?: string[];
  };
  templeId: {
    _id: string;
    name: string;
    location: string;
  };
  panditId?: {
    _id: string;
    name: string;
    phone: string;
  };
  bookingDate: string;
  sankalpName: string;
  totalAmount: number;
  orderStatus: "pending" | "assigned" | "confirmed" | "in-progress" | "completed" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  isDonation: boolean;
  chadhavaItems?: { name: string; price: number; emoji?: string }[];
  videoUrl?: string;
  poojaImage?: string;
  createdAt: string;
}

interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  photo?: string;
}

// ── Status Config ─────────────────────────────────────────────────────────────
const statusConfig = {
  pending: { label: "Pending", bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700" },
  assigned: { label: "Assigned", bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700" },
  confirmed: { label: "Confirmed", bg: "bg-[#fff8f0]", border: "border-[#ffd9a8]", text: "text-[#ff7f0a]" },
  "in-progress": { label: "In Progress", bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700" },
  completed: { label: "Completed", bg: "bg-green-50", border: "border-green-200", text: "text-green-700" },
  cancelled: { label: "Cancelled", bg: "bg-red-50", border: "border-red-200", text: "text-red-600" },
};

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonBooking() {
  return (
    <div className="bg-white border border-[#f0dcc8] rounded-2xl p-5 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-gray-200 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-3 bg-gray-200 rounded w-1/3" />
          <div className="h-3 bg-gray-200 rounded w-2/3" />
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
        <div className="h-4 bg-gray-200 rounded w-20" />
        <div className="h-4 bg-gray-200 rounded w-32" />
      </div>
    </div>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { currency, exchangeRate } = useCurrency();
  const [orders, setOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "upcoming" | "completed">("all");
  const [dashSettings, setDashSettings] = useState({
    bannerUrl: "",
    welcomeMessage: "Welcome to your Divine Journey"
  });

  // Fetch orders and profile
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [ordersRes, profileRes, settingsRes] = await Promise.all([
          fetch("/api/orders/mine"),
          fetch("/api/auth/me"),
          fetch("/api/settings/dashboard_settings")
        ]);

        const [ordersData, profileData, settingsData] = await Promise.all([
          ordersRes.json(),
          profileRes.json(),
          settingsRes.json()
        ]);

        if (ordersData.success) setOrders(ordersData.data);
        if (profileData.success) setProfile(profileData.data);
        if (settingsData.success && settingsData.data) setDashSettings(settingsData.data);

        if (!ordersData.success) setError("Failed to load bookings.");
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter orders by tab
  const filtered = orders.filter((o) => {
    if (activeTab === "upcoming") return o.orderStatus === "pending" || o.orderStatus === "assigned" || o.orderStatus === "confirmed" || o.orderStatus === "in-progress";
    if (activeTab === "completed") return o.orderStatus === "completed";
    return true;
  });

  // Stats
  const totalBookings = orders.length;
  const completedCount = orders.filter((o) => o.orderStatus === "completed").length;
  const videosReceived = orders.filter((o) => o.videoUrl).length;

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });
  };

  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen bg-[#fdf6ee]">
        <div className="container-app py-8">
          <div className="grid lg:grid-cols-4 gap-8">

            {/* ── Sidebar ── */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-[#f0dcc8] rounded-2xl p-5 shadow-card">
                {/* Profile */}
                <div className="text-center mb-5 pb-5 border-b border-[#f0dcc8]">
                  {profile?.photo ? (
                    <img
                      src={profile.photo}
                      alt={profile.name}
                      className="w-16 h-16 rounded-full object-cover mx-auto mb-3 border-2 border-[#ff7f0a]"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#ff7f0a] to-[#8b0000] text-white font-display font-bold text-2xl flex items-center justify-center mx-auto mb-3">
                      {profile?.name ? profile.name.charAt(0).toUpperCase() : ""}
                    </div>
                  )}
                  <h2 className="font-display font-semibold text-[#1a1209]">
                    {profile?.name || "Devotee"}
                  </h2>
                  <p className="text-xs text-[#6b5b45]">{profile?.email || ""}</p>
                  <span className="badge-saffron mt-2 inline-block">Devotee</span>
                </div>

                {/* Nav */}
                <nav className="space-y-1">
                  {[
                    { label: "My Bookings", href: "/dashboard", active: true },
                    { label: "Profile", href: "/dashboard/profile" },
                    { label: "Saved Temples", href: "/dashboard/saved" },
                    { label: "Notifications", href: "/dashboard/notifications" },
                  ].map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-colors ${item.active
                        ? "bg-[#fff8f0] text-[#ff7f0a] font-semibold border border-[#ffd9a8]"
                        : "text-[#6b5b45] hover:bg-[#fdf6ee] hover:text-[#ff7f0a]"
                        }`}
                    >
                      {item.label}
                    </Link>
                  ))}

                  <button
                    onClick={async () => {
                      try {
                        await fetch("/api/auth/logout", { method: "POST" });
                        window.location.href = "/";
                      } catch {
                        window.location.href = "/";
                      }
                    }}
                    className="flex w-full text-left items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-[#6b5b45] hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    Logout
                  </button>
                </nav>
              </div>
            </div>

            {/* ── Main Content ── */}
            <div className="lg:col-span-3 space-y-5">

              {/* Dynamic Banner */}
              <div className="relative h-40 md:h-48 rounded-3xl overflow-hidden shadow-card border border-[#f0dcc8]">
                <img
                  src={dashSettings.bannerUrl || "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=2074&auto=format&fit=crop"}
                  className="w-full h-full object-cover"
                  alt="Dashboard Banner"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center px-8">
                  <div className="max-w-md">
                    <h1 className="text-2xl md:text-3xl font-display font-bold text-white mb-2">
                      {dashSettings.welcomeMessage}
                    </h1>
                    <p className="text-orange-200 text-sm font-medium">
                      Manage your spiritual journey and pooja bookings in one place.
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "Total Bookings", value: totalBookings, icon: <BookOpen size={18} className="text-[#ff7f0a]" /> },
                  { label: "Completed", value: completedCount, icon: <CheckCircle2 size={18} className="text-green-500" /> },
                  { label: "Videos Received", value: videosReceived, icon: <Video size={18} className="text-blue-500" /> },
                ].map((s) => (
                  <div key={s.label} className="bg-white border border-[#f0dcc8] rounded-2xl p-4 text-center shadow-card">
                    <div className="flex justify-center mb-1">{s.icon}</div>
                    <div className="text-2xl font-display font-bold text-[#ff7f0a]">
                      {loading ? "—" : s.value}
                    </div>
                    <div className="text-xs text-[#6b5b45]">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Tabs */}
              <div className="flex gap-2">
                {(["all", "upcoming", "completed"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all ${activeTab === tab
                      ? "bg-[#ff7f0a] text-white shadow-sm"
                      : "bg-white border border-[#f0dcc8] text-[#6b5b45] hover:border-[#ffbd6e]"
                      }`}
                  >
                    {tab === "all" ? "All Bookings" : tab === "upcoming" ? "Upcoming" : "Completed"}
                  </button>
                ))}
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Loading Skeletons */}
              {loading && (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => <SkeletonBooking key={i} />)}
                </div>
              )}

              {/* Empty State */}
              {!loading && !error && filtered.length === 0 && (
                <div className="bg-white border border-[#f0dcc8] rounded-2xl p-10 text-center shadow-card">
                  <div className="flex justify-center mb-4"><CalendarOff size={40} className="text-[#f0dcc8]" /></div>
                  <h3 className="font-display font-semibold text-[#1a1209] mb-2">No bookings yet</h3>
                  <p className="text-xs text-[#6b5b45] mb-5">
                    You haven't booked any pooja yet. Start your divine journey today!
                  </p>
                  <Link href="/poojas" className="btn-saffron text-sm">
                    Book a Pooja →
                  </Link>
                </div>
              )}

              {/* Bookings List */}
              {!loading && !error && filtered.length > 0 && (
                <div className="space-y-4">
                  {filtered.map((order) => {
                    const sc = statusConfig[order.orderStatus] || statusConfig.pending;
                    return (
                      <div key={order._id} className="bg-white border border-[#f0dcc8] rounded-2xl p-5 shadow-card">
                        <div className="flex items-start gap-4">
                          {/* Emoji */}
                          <div className="w-12 h-12 bg-[#fff8f0] rounded-xl flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
                            {order.poojaImage ? (
                              <img src={order.poojaImage} alt={order.poojaId?.name || "Chadhava"} className="w-full h-full object-cover" />
                            ) : order.poojaId?.images?.[0] ? (
                              <img src={order.poojaId.images[0]} alt={order.poojaId.name} className="w-full h-full object-cover" />
                            ) : order.chadhavaItems && order.chadhavaItems.length > 0 && (order.chadhavaItems[0] as any).chadhavaId?.image ? (
                              <img src={(order.chadhavaItems[0] as any).chadhavaId.image} alt={order.chadhavaItems[0].name} className="w-full h-full object-cover" />
                            ) : order.chadhavaItems && order.chadhavaItems.length > 0 && order.chadhavaItems[0].emoji ? (
                              <span className="text-2xl">{order.chadhavaItems[0].emoji}</span>
                            ) : (
                              <Flame size={22} className="text-[#ff7f0a]" />
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h3 className="font-display font-semibold text-[#1a1209]">
                                {order.isDonation
                                  ? "Direct Temple Donation"
                                  : order.poojaId?.name
                                    ? order.poojaId.name
                                    : (order.chadhavaItems && order.chadhavaItems.length > 0)
                                      ? order.chadhavaItems.map((c: any) => c.name).join(", ")
                                      : "Pooja"}
                              </h3>
                              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${sc.bg} ${sc.border} ${sc.text}`}>
                                {sc.label}
                              </span>
                            </div>

                            <p className="text-xs text-[#ff7f0a] mb-2 flex items-center gap-1">
                              <Building2 size={11} className="shrink-0" /> {order.templeId?.name}
                            </p>

                            <div className="flex flex-wrap gap-4 text-xs text-[#6b5b45]">
                              <span className="flex items-center gap-1">
                                <Calendar size={11} className="text-[#ff7f0a]" />
                                {formatDate(order.bookingDate)}
                              </span>
                              {order.poojaId?.duration && (
                                <span className="flex items-center gap-1">
                                  <Clock size={11} className="text-[#ff7f0a]" />
                                  {order.poojaId.duration}
                                </span>
                              )}
                              <span>
                                Pandit: {order.panditId?.name || "TBD"}
                              </span>
                            </div>

                            <p className="text-xs text-[#6b5b45] mt-1">
                              Booking ID: <strong className="text-[#ff7f0a]">{order.bookingId}</strong>
                            </p>
                          </div>
                        </div>

                        {/* Bottom Actions */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4 pt-4 border-t border-[#f0dcc8]">
                          <span className="font-bold text-[#ff7f0a]">
                            {formatCurrency(currency === "USD" ? convertINRtoUSD(order.totalAmount, exchangeRate) : order.totalAmount, currency)}
                          </span>
                          <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
                            {order.videoUrl && (
                              <a
                                href={order.videoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1.5 text-xs bg-[#f0fdf4] border border-green-200 text-green-700 px-3 py-1.5 rounded-full font-medium hover:bg-green-50"
                              >
                                <Video size={12} /> Watch Video
                              </a>
                            )}
                            {order.orderStatus === "completed" && !order.videoUrl && (
                              <button className="flex items-center gap-1.5 text-xs btn-outline-saffron py-1.5 px-3">
                                <Download size={12} /> Receipt
                              </button>
                            )}
                            {order.orderStatus === "completed" && order.poojaId && !order.isDonation && (
                              <Link
                                href={`/bookings/${order._id}#review-section`}
                                className="flex items-center gap-1.5 text-xs bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1.5 rounded-full font-medium hover:bg-amber-100"
                              >
                                <Star size={12} className="fill-amber-500 text-amber-500" /> Rate Pooja
                              </Link>
                            )}
                            {order.paymentStatus !== "paid" && (order.orderStatus === "pending" || order.orderStatus === "confirmed") && (
                              <button
                                onClick={async () => {
                                  if (!confirm("Are you sure you want to cancel this pooja booking?")) return;
                                  try {
                                    const res = await fetch(`/api/orders/${order._id}/cancel`, { method: "POST" });
                                    const data = await res.json();
                                    if (data.success) {
                                      setOrders(prev => prev.map(o => o._id === order._id ? { ...o, orderStatus: 'cancelled' } : o));
                                      alert("Booking Cancelled.");
                                    } else {
                                      alert(data.message || "Could not cancel booking");
                                    }
                                  } catch (err) {
                                    alert("Server error connecting to cancellation service.");
                                  }
                                }}
                                className="text-xs text-red-500 border border-red-200 px-3 py-1.5 rounded-full hover:bg-red-50 transition"
                              >
                                Cancel
                              </button>
                            )}
                            <Link
                              href={`/bookings/${order._id}`}
                              className="flex items-center gap-1 text-xs text-[#ff7f0a] font-medium hover:underline"
                            >
                              Details <ChevronRight size={12} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}