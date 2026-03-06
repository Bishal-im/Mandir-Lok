"use client";

import { useState, useEffect } from "react";
import PanditSidebar from "@/components/pandit/PanditSidebar";
import { getPanditNotifications, markPanditNotificationRead } from "@/lib/actions/notifications";
import {
    Bell,
    Calendar,
    IndianRupee,
    Package,
    ChevronRight,
    Clock,
    CheckCircle,
    AlertCircle,
    Trash2
} from "lucide-react";
import Link from "next/link";

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotifications();
    }, []);

    async function loadNotifications() {
        setLoading(true);
        const res = await getPanditNotifications();
        if (res.success) {
            setNotifications(res.data);
        }
        setLoading(false);
    }

    async function handleMarkRead(id: string) {
        const res = await markPanditNotificationRead(id);
        if (res.success) {
            setNotifications(prev =>
                prev.map(n => n._id === id ? { ...n, read: true } : n)
            );
        }
    }

    const getIcon = (type: string) => {
        switch (type) {
            case "booking": return <Calendar className="text-orange-500" size={20} />;
            case "video": return <Package className="text-blue-500" size={20} />;
            case "promotion": return <Bell className="text-purple-500" size={20} />;
            default: return <Bell className="text-gray-500" size={20} />;
        }
    };

    return (
        <div className="min-h-screen bg-[#fdf6ee] flex font-sans">
            <PanditSidebar />
            <div className="flex-1 overflow-auto text-gray-900">
                <header className="bg-white border-b border-[#f0dcc8] px-6 py-4 sticky top-0 z-30">
                    <h1 className="font-display font-bold text-gray-900 text-lg">Notifications</h1>
                    <p className="text-xs text-[#6b5b45]">Stay updated with your assigned pujas and payments.</p>
                </header>

                <main className="p-6 max-w-4xl mx-auto space-y-6">
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-24 bg-white border border-[#f0dcc8] rounded-2xl animate-pulse" />
                            ))}
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center py-20 bg-white border border-dashed border-[#f0dcc8] rounded-3xl shadow-card">
                            <div className="w-16 h-16 bg-[#fff8f0] rounded-full flex items-center justify-center mx-auto mb-4">
                                <Bell className="text-[#ff7f0a]/40" size={32} />
                            </div>
                            <h3 className="text-gray-900 font-bold mb-1">No notifications yet</h3>
                            <p className="text-[#6b5b45] text-sm">We'll notify you when you get a new assignment or payment.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {notifications.map((notif) => (
                                <div
                                    key={notif._id}
                                    onClick={() => !notif.read && handleMarkRead(notif._id)}
                                    className={`group relative p-5 rounded-2xl border transition-all duration-300 cursor-pointer shadow-card ${notif.read
                                        ? "bg-white border-[#f0dcc8] opacity-75"
                                        : "bg-white border-[#ff7f0a]/30 ring-1 ring-[#ff7f0a]/10"
                                        }`}
                                >
                                    <div className="flex gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${notif.read ? "bg-gray-50 text-gray-400" : "bg-[#fff8f0]"
                                            }`}>
                                            {getIcon(notif.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <h3 className={`font-bold transition-colors text-sm md:text-base ${notif.read ? "text-gray-600" : "text-gray-900"
                                                    }`}>
                                                    {notif.title}
                                                </h3>
                                                <span className="text-[10px] text-[#6b5b45] whitespace-nowrap bg-[#fff8f0] px-2 py-1 rounded-full uppercase tracking-wider font-bold border border-[#f0dcc8]">
                                                    {new Date(notif.createdAt).toLocaleString("en-IN", {
                                                        month: "short",
                                                        day: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit"
                                                    })}
                                                </span>
                                            </div>
                                            <p className={`text-xs md:text-sm mb-4 leading-relaxed ${notif.read ? "text-gray-500" : "text-[#6b5b45]"
                                                }`}>
                                                {notif.message}
                                            </p>

                                            {notif.link && (
                                                <Link
                                                    href={notif.link}
                                                    className={`inline-flex items-center gap-2 text-[11px] font-bold px-4 py-2 rounded-xl transition-all ${notif.read
                                                        ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                        : "bg-[#ff7f0a] text-white hover:bg-[#ff7f0a]/90 shadow-lg shadow-orange-500/10"
                                                        }`}
                                                >
                                                    View Details
                                                    <ChevronRight size={14} />
                                                </Link>
                                            )}
                                        </div>
                                    </div>

                                    {!notif.read && (
                                        <div className="absolute top-4 right-4 w-2 h-2 bg-[#ff7f0a] rounded-full animate-pulse shadow-sm" />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
