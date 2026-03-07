"use client";

import { useState, useEffect } from "react";
import { getAdminNotifications, markAdminNotificationRead, deleteAdminNotification } from "@/lib/actions/notifications";
import { Bell, Check, ExternalLink, Inbox, Trash2 } from "lucide-react";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";

export default function AdminNotificationsPage() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotifications();
    }, []);

    async function loadNotifications() {
        setLoading(true);
        const res = await getAdminNotifications();
        if (res.success) {
            setNotifications(res.data);
        }
        setLoading(false);
    }

    async function handleMarkRead(id: string) {
        const res = await markAdminNotificationRead(id);
        if (res.success) {
            setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this notification?")) return;
        const res = await deleteAdminNotification(id);
        if (res.success) {
            setNotifications(notifications.filter(n => n._id !== id));
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-display font-bold text-gray-900">Notifications</h1>
                    <p className="text-gray-500 text-sm">Stay updated with system activities</p>
                </div>
                <button
                    onClick={loadNotifications}
                    className="text-sm text-[#ff7f0a] hover:underline font-medium"
                >
                    Refresh
                </button>
            </div>

            {loading ? (
                <div className="bg-white rounded-2xl p-12 flex flex-col items-center justify-center border border-gray-100 shadow-sm">
                    <div className="w-8 h-8 border-4 border-[#ff7f0a]/30 border-t-[#ff7f0a] rounded-full animate-spin mb-4" />
                    <p className="text-gray-500">Loading notifications...</p>
                </div>
            ) : notifications.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 flex flex-col items-center justify-center border border-gray-100 shadow-sm text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                        <Inbox size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">All caught up!</h3>
                    <p className="text-gray-500 max-w-xs">You don't have any notifications at the moment.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {notifications.map((notif) => (
                        <div
                            key={notif._id}
                            className={`group bg-white rounded-2xl p-4 border transition-all duration-200 ${notif.read ? "border-gray-100 opacity-75" : "border-[#ff7f0a]/20 bg-orange-50/10 shadow-sm"
                                }`}
                        >
                            <div className="flex gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${notif.read ? "bg-gray-100 text-gray-400" : "bg-[#ff7f0a]/10 text-[#ff7f0a]"
                                    }`}>
                                    <Bell size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                                        <h3 className={`font-bold truncate ${notif.read ? "text-gray-700" : "text-gray-900"}`}>
                                            {notif.title}
                                        </h3>
                                        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium whitespace-nowrap">
                                            {formatRelativeTime(new Date(notif.createdAt))}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                                        {notif.message}
                                    </p>
                                    <div className="flex items-center gap-3">
                                        {notif.link && (
                                            <Link
                                                href={notif.link}
                                                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#ff7f0a] hover:text-[#8b0000] transition-colors"
                                            >
                                                View Details <ExternalLink size={12} />
                                            </Link>
                                        )}
                                        {!notif.read && (
                                            <button
                                                onClick={() => handleMarkRead(notif._id)}
                                                className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-green-600 transition-colors"
                                            >
                                                Mark as Read <Check size={12} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(notif._id)}
                                            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            Delete <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
