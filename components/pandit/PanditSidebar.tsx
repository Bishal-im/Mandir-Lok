"use client";

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { getSettings } from '@/lib/actions/admin'
import {
  LayoutDashboard,
  Calendar,
  Clock,
  CheckCircle,
  IndianRupee,
  User,
  LogOut,
  X,
  Menu,
  Check,
  Bell
} from 'lucide-react'
import { getUnreadNotificationCount } from '@/lib/actions/notifications'
import GoogleTranslate from '../GoogleTranslate'

export default function PanditSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [pandit, setPandit] = useState<any>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    fetch('/api/pandit/me')
      .then(res => res.json())
      .then(data => {
        if (data.success) setPandit(data.data)
      })

    async function loadStats() {
      try {
        const setting = await getSettings("website_logo");
        if (setting && setting.value) setLogoUrl(setting.value);

        const countRes = await getUnreadNotificationCount();
        if (countRes.success) setUnreadCount(countRes.data);
      } catch (err) {
        console.error("Failed to load stats", err);
      }
    }
    loadStats();
  }, [])

  const navItems = [
    { label: 'Dashboard', icon: <LayoutDashboard size={18} />, href: '/pandit/dashboard' },
    { label: 'Today\'s Poojas', icon: <Calendar size={18} />, href: '/pandit/orders?tab=today' },
    { label: 'Upcoming', icon: <Clock size={18} />, href: '/pandit/orders?tab=upcoming' },
    { label: 'Completed', icon: <CheckCircle size={18} />, href: '/pandit/orders?tab=completed' },
    { label: 'Notifications', icon: <Bell size={18} />, href: '/pandit/notifications', count: unreadCount },
    { label: 'Earnings', icon: <IndianRupee size={18} />, href: '/pandit/earnings' },
    { label: 'Profile', icon: <User size={18} />, href: '/pandit/profile' },
  ]

  const handleLogout = async () => {
    await fetch('/api/pandit/auth/logout', { method: 'POST' })
    router.push('/pandit-login')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3 mb-4">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="w-10 h-10 object-contain" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff7f0a] to-[#8b0000] flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {pandit?.name?.[0] || 'P'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="font-display font-bold text-sm truncate">{pandit?.name || 'Loading...'}</h2>
            {pandit?.isVerified && (
              <span className="flex items-center gap-1 text-[10px] text-green-400 font-medium">
                <Check size={10} strokeWidth={3} /> Verified Pandit
              </span>
            )}
          </div>
        </div>
        <div className="text-[10px] text-[#ff9b30] tracking-widest uppercase font-bold opacity-70 mb-3">
          Pandit Portal
        </div>
        <GoogleTranslate align="left" />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/pandit/dashboard' && pathname.startsWith(item.href.split('?')[0]))
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${isActive
                ? 'bg-[#ff7f0a] text-white shadow-lg shadow-orange-900/20'
                : 'text-[#b89b7a] hover:bg-white/5 hover:text-white'
                }`}
              onClick={() => setIsOpen(false)}
            >
              {item.icon}
              <span className="font-medium flex-1">{item.label}</span>
              {typeof item.count === 'number' && item.count > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {item.count > 99 ? '99+' : item.count}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-[#b89b7a] hover:bg-red-500/10 hover:text-red-400 transition-all"
        >
          <LogOut size={18} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-[#1a1209] text-white flex-col lg:static lg:h-screen border-r border-white/5">
        <SidebarContent />
      </aside>

      {/* Mobile Trigger */}
      <div className="lg:hidden fixed top-4 left-4 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 bg-white rounded-lg shadow-md border border-gray-100 text-[#1a1209]"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-[#1a1209] text-white shadow-2xl animate-in slide-in-from-left">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 text-white/50 hover:text-white"
            >
              <X size={20} />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  )
}
