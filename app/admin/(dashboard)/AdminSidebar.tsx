"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getSettings, getPendingPayoutCount } from "@/lib/actions/admin";
import {
    LayoutDashboard,
    MapPin,
    Star,
    Users,
    IndianRupee,
    ShoppingBag,
    BarChart3,
    Settings,
    LogOut,
    Flower,
    Menu,
    X,
    MessageCircle,
    Bell,
    Music,
    Tag,
} from "lucide-react";
import AdminNotificationBell from "@/components/admin/AdminNotificationBell";
import { getUnreadAdminNotificationCount } from "@/lib/actions/notifications";

const navItems = [
    { label: "Dashboard", href: "/admin", icon: <LayoutDashboard size={18} /> },
    { label: "Analytics", href: "/admin/analytics", icon: <BarChart3 size={18} /> },
    { label: "Orders", href: "/admin/orders", icon: <ShoppingBag size={18} /> },
    { label: "Temples", href: "/admin/temples", icon: <MapPin size={18} /> },
    { label: "Poojas", href: "/admin/poojas", icon: <Star size={18} /> },
    { label: "Chadhava", href: "/admin/chadhava", icon: <Flower size={18} /> },
    { label: "Chadhava Categories", href: "/admin/chadhava-categories", icon: <Tag size={18} /> },
    { label: "Pandits", href: "/admin/pandits", icon: <Users size={18} /> },
    {
        label: "Payments",
        href: "/admin/payments/transactions",
        icon: <IndianRupee size={18} />,
    },
    { label: "Payouts", href: "/admin/payments/payouts", icon: <IndianRupee size={18} /> },
    { label: "Settings", href: "/admin/settings", icon: <Settings size={18} /> },
    { label: "Reviews", href: "/admin/reviews", icon: <MessageCircle size={18} /> },
    { label: "Notifications", href: "/admin/notifications", icon: <Bell size={18} /> },
    { label: "Music", href: "/admin/songs", icon: <Music size={18} /> },
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const [sideOpen, setSideOpen] = useState(false);
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [pendingPayoutCount, setPendingPayoutCount] = useState(0);

    useEffect(() => {
        async function loadLogo() {
            try {
                const setting = await getSettings("website_logo");
                if (setting && setting.value) setLogoUrl(setting.value);
            } catch (err) {
                console.error("Failed to load logo", err);
            }
        }
        loadLogo();
    }, []);

    useEffect(() => {
        const fetchCounts = async () => {
            const [notifRes, payoutRes] = await Promise.all([
                getUnreadAdminNotificationCount(),
                getPendingPayoutCount()
            ]);

            if (notifRes.success) setUnreadCount(notifRes.data);
            if (payoutRes.success) setPendingPayoutCount(payoutRes.count);
        };

        fetchCounts();
        const interval = setInterval(fetchCounts, 30000); // 30 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            {/* Mobile Toggle & Top Bar */}
            {/* Mobile Toggle & Top Bar */}
            <header className="lg:hidden bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setSideOpen(!sideOpen)}
                        className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                        aria-label="Toggle Menu"
                    >
                        <Menu size={22} className="text-gray-700" />
                    </button>
                    {logoUrl ? (
                        <img src={logoUrl} alt="Logo" className="w-8 h-8 object-contain" />
                    ) : (
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ff7f0a] to-[#8b0000] flex items-center justify-center font-bold text-base text-white">
                            म
                        </div>
                    )}
                    <span className="font-display font-bold text-gray-900">Admin</span>
                </div>
                <div className="flex items-center gap-2">
                    <AdminNotificationBell />
                </div>
            </header>

            {/* Sidebar Overlay */}
            {sideOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSideOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1a0a00] text-white flex flex-col transition-all duration-300 ease-in-out ${sideOpen ? "translate-x-0" : "-translate-x-full"
                    } lg:translate-x-0 lg:static lg:flex lg:h-screen`}
            >
                <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
                    {logoUrl ? (
                        <img src={logoUrl} alt="Logo" className="w-9 h-9 object-contain" />
                    ) : (
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ff7f0a] to-[#8b0000] flex items-center justify-center font-bold text-lg">
                            म
                        </div>
                    )}
                    <div>
                        <span className="font-display font-bold text-sm">Mandirlok</span>
                        <span className="block text-[10px] text-[#ff9b30] tracking-widest uppercase">
                            Admin Panel
                        </span>
                    </div>
                    <button
                        onClick={() => setSideOpen(false)}
                        className="ml-auto lg:hidden text-[#b89b7a] hover:text-white"
                    >
                        <X size={18} />
                    </button>
                </div>

                <nav className="flex-1 px-3 py-4 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                onClick={() => setSideOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-sm transition-colors ${isActive
                                    ? "bg-[#ff7f0a] text-white font-medium"
                                    : "text-[#b89b7a] hover:bg-white/10 hover:text-white"
                                    }`}
                            >
                                {item.icon}
                                {item.label}
                                {item.label === "Notifications" && unreadCount > 0 && (
                                    <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] flex items-center justify-center">
                                        {unreadCount > 9 ? "9+" : unreadCount}
                                    </span>
                                )}
                                {item.label === "Payouts" && pendingPayoutCount > 0 && (
                                    <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] flex items-center justify-center animate-pulse">
                                        {pendingPayoutCount > 9 ? "9+" : pendingPayoutCount}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="px-3 py-4 border-t border-white/10">
                    <button
                        onClick={async () => {
                            try {
                                await fetch("/api/auth/logout", { method: "POST" });
                                window.location.href = "/admin/login";
                            } catch {
                                window.location.href = "/admin/login";
                            }
                        }}
                        className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#b89b7a] hover:bg-white/10 hover:text-white transition-colors"
                    >
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </aside>
        </>
    );
}
