"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Bell, Check, Loader2, Info, Package, Video, AlertCircle, ChevronRight } from "lucide-react";
import { getNotifications, markNotificationRead } from "@/lib/actions/user";

interface Notification {
    _id: string;
    title: string;
    message: string;
    type: "booking" | "video" | "system" | "promotion";
    read: boolean;
    link?: string;
    createdAt: string;
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const [notifRes, profileRes] = await Promise.all([
                    getNotifications(),
                    fetch("/api/auth/me").then(r => r.json())
                ]);

                if (notifRes.success) {
                    setNotifications(notifRes.data);
                }
                if (profileRes.success) {
                    setProfile(profileRes.data);
                }
            } catch (err) {
                console.error("Error fetching notifications:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const handleMarkAsRead = async (id: string) => {
        try {
            const res = await markNotificationRead(id);
            if (res.success) {
                setNotifications(prev =>
                    prev.map(n => n._id === id ? { ...n, read: true } : n)
                );
            }
        } catch (err) {
            console.error("Error marking notification as read:", err);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "booking": return <Package className="text-blue-500" size={18} />;
            case "video": return <Video className="text-green-500" size={18} />;
            case "promotion": return <Bell className="text-orange-500" size={18} />;
            default: return <Info className="text-amber-500" size={18} />;
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-IN", {
            day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
        });
    };

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = "/";
    };

    return (
        <>
            <Navbar />
            <main className="pt-20 min-h-screen bg-[#fdf6ee]">
                <div className="container-app py-8">
                    <div className="grid lg:grid-cols-4 gap-8">
                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="bg-white border border-[#f0dcc8] rounded-2xl p-5 shadow-card">
                                <div className="text-center mb-5 pb-5 border-b border-[#f0dcc8]">
                                    {profile?.photo ? (
                                        <img
                                            src={profile.photo}
                                            alt={profile.name}
                                            className="w-16 h-16 rounded-full object-cover mx-auto mb-3 border-2 border-[#ff7f0a]"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#ff7f0a] to-[#8b0000] text-white font-display font-bold text-2xl flex items-center justify-center mx-auto mb-3">
                                            {profile?.name ? profile.name.charAt(0).toUpperCase() : "🙏"}
                                        </div>
                                    )}
                                    <h2 className="font-display font-semibold text-[#1a1209]">
                                        {profile?.name || "Devotee"}
                                    </h2>
                                    <p className="text-xs text-[#6b5b45]">{profile?.email || ""}</p>
                                </div>

                                <nav className="space-y-1">
                                    {[
                                        { label: "My Bookings", href: "/dashboard" },
                                        { label: "Profile", href: "/dashboard/profile" },
                                        { label: "Saved Temples", href: "/dashboard/saved" },
                                        { label: "Notifications", href: "/dashboard/notifications", active: true },
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
                                        onClick={handleLogout}
                                        className="flex w-full text-left items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-[#6b5b45] hover:bg-red-50 hover:text-red-500 transition-colors"
                                    >
                                        Logout
                                    </button>
                                </nav>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="lg:col-span-3">
                            <div className="bg-white border border-[#f0dcc8] rounded-2xl p-6 md:p-8 shadow-card min-h-[500px]">
                                <h1 className="heading-md text-[#1a1209] mb-6 flex items-center gap-2">
                                    <Bell className="text-[#ff7f0a]" /> Notifications
                                </h1>

                                {loading ? (
                                    <div className="flex flex-col items-center justify-center py-20">
                                        <Loader2 size={32} className="animate-spin text-[#ff7f0a] mb-4" />
                                        <p className="text-sm text-[#6b5b45]">Fetching your notifications...</p>
                                    </div>
                                ) : notifications.length === 0 ? (
                                    <div className="text-center py-20 bg-[#fffcf8] rounded-3xl border border-dashed border-[#f0dcc8]">
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                            <Bell size={24} className="text-[#f0dcc8]" />
                                        </div>
                                        <h3 className="font-display font-semibold text-[#1a1209] mb-2">Internal Clarity</h3>
                                        <p className="text-sm text-[#6b5b45]">You don't have any notifications at the moment.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {notifications.map((notif) => (
                                            <div
                                                key={notif._id}
                                                className={`group relative p-5 rounded-2xl border transition-all duration-300 ${notif.read
                                                    ? "bg-white border-[#f0dcc8] opacity-75"
                                                    : "bg-[#fff8f0] border-[#ffd9a8] shadow-sm hover:shadow-md"
                                                    }`}
                                            >
                                                {!notif.read && (
                                                    <div className="absolute top-5 right-5">
                                                        <button
                                                            onClick={() => handleMarkAsRead(notif._id)}
                                                            className="p-1.5 bg-white rounded-full shadow-sm text-green-600 hover:text-green-700 hover:scale-110 transition-all border border-green-100"
                                                            title="Mark as read"
                                                        >
                                                            <Check size={14} />
                                                        </button>
                                                    </div>
                                                )}

                                                <div className="flex gap-4">
                                                    <div className="mt-1 w-10 h-10 rounded-xl bg-white border border-[#f0dcc8] flex items-center justify-center shrink-0">
                                                        {getIcon(notif.type)}
                                                    </div>
                                                    <div className="flex-1 pr-6">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <h4 className="font-bold text-[#1a1209] text-sm md:text-base">
                                                                {notif.title}
                                                            </h4>
                                                            <span className="text-[10px] md:text-xs text-[#6b5b45]">
                                                                {formatDate(notif.createdAt)}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs md:text-sm text-[#6b5b45] leading-relaxed mb-3">
                                                            {notif.message}
                                                        </p>
                                                        {notif.link && (
                                                            <Link
                                                                href={notif.link}
                                                                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#ff7f0a] hover:underline"
                                                            >
                                                                View Details <ChevronRight size={12} />
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
