"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Music2, 
  BarChart3, 
  User, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/music/dashboard" },
  { name: "Interviews", icon: Music2, href: "/music/interviews" }, // Kept name "Interviews" as per prompt
  { name: "Analytics", icon: BarChart3, href: "/music/analytics" },
  { name: "Profile", icon: User, href: "/music/profile" },
  { name: "Settings", icon: Settings, href: "/music/settings" },
];

export default function DashboardSidebar({ isCollapsed, setIsCollapsed }: { 
  isCollapsed: boolean, 
  setIsCollapsed: (v: boolean) => void 
}) {
  const pathname = usePathname();

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 260 }}
      className="fixed left-0 top-0 bottom-0 z-50 bg-[#0d0d0d] border-r border-[#1a1a1a] flex flex-col transition-all duration-300 ease-in-out"
    >
      {/* Logo Section */}
      <div className="h-20 flex items-center px-6 gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-rose-600 flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20">
          <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
        </div>
        {!isCollapsed && (
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-white font-bold tracking-tight text-lg truncate"
          >
            Mandir<span className="text-orange-500">Lok</span> AI
          </motion.span>
        )}
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-24 w-6 h-6 bg-[#1a1a1a] border border-[#333] rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-500 transition-all shadow-lg"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Nav Items */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                  isActive 
                    ? "bg-orange-500/10 text-orange-500" 
                    : "text-gray-400 hover:text-gray-100 hover:bg-white/5"
                }`}
              >
                <item.icon size={22} className={`${isActive ? "text-orange-500" : "group-hover:scale-110 transition-transform"}`} />
                {!isCollapsed && (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-medium text-[15px] whitespace-nowrap"
                  >
                    {item.name}
                  </motion.span>
                )}
                
                {isActive && !isCollapsed && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute left-0 w-1 h-6 bg-orange-500 rounded-r-full"
                  />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-[#1a1a1a]">
        <button
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-gray-400 hover:text-rose-500 hover:bg-rose-500/5 transition-all group"
        >
          <LogOut size={22} className="group-hover:translate-x-1 transition-transform" />
          {!isCollapsed && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-medium text-[15px]"
            >
              Logout
            </motion.span>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
