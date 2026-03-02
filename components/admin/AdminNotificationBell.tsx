"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { getUnreadAdminNotificationCount } from "@/lib/actions/notifications";

export default function AdminNotificationBell() {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const fetchCount = async () => {
            const res = await getUnreadAdminNotificationCount();
            if (res.success) {
                setCount(res.data);
            }
        };

        fetchCount();
        // Refresh count every 30 seconds
        const interval = setInterval(fetchCount, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <Link href="/admin/notifications" className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
            <Bell size={20} className="text-gray-600" />
            {count > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                    {count > 9 ? "9+" : count}
                </span>
            )}
        </Link>
    );
}
