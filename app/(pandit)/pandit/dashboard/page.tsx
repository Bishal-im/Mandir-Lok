'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import PanditSidebar from '@/components/pandit/PanditSidebar'
import VideoUploadModal from '@/components/pandit/VideoUploadModal'
import {
  Calendar, CheckCircle, Clock, IndianRupee,
  ChevronRight, Phone, ExternalLink, Play
} from 'lucide-react'
import { formatINR } from '@/lib/utils'

export default function PanditDashboard() {
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<any[]>([])
  const [pandit, setPandit] = useState<any>(null)
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)


  const fetchData = async () => {
    try {
      const [ordersRes, meRes] = await Promise.all([
        fetch('/api/pandit/orders'),
        fetch('/api/pandit/me')
      ])
      const ordersData = await ordersRes.json()
      const meData = await meRes.json()

      if (ordersData.success) setOrders(ordersData.data)
      if (meData.success) setPandit(meData.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const startPooja = async (id: string) => {
    const res = await fetch(`/api/pandit/orders/${id}/start`, { method: 'POST' })
    if (res.ok) fetchData()
  }

  const today = new Date().toISOString().split('T')[0]
  const todayPoojas = orders.filter(o =>
    new Date(o.bookingDate).toISOString().split('T')[0] === today &&
    (o.orderStatus === 'confirmed' || o.orderStatus === 'in-progress')
  )

  const upcomingPoojas = orders.filter(o =>
    new Date(o.bookingDate).toISOString().split('T')[0] > today &&
    o.orderStatus === 'confirmed'
  ).slice(0, 5)

  const stats = [
    { label: "Today's Poojas", value: todayPoojas.length, icon: '🪔', color: 'text-orange-600' },
    { label: 'Pending Response', value: orders.filter(o => o.orderStatus === 'confirmed').length, icon: '⏳', color: 'text-blue-600' },
    { label: 'Completed', value: orders.filter(o => o.orderStatus === 'completed').length, icon: '✅', color: 'text-green-600' },
    { label: 'Total Earned', value: formatINR(pandit?.totalEarnings || 0), icon: '💰', color: 'text-[#8b0000]' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdf6ee] flex">
        <PanditSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#ff7f0a] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fdf6ee] flex">
      <PanditSidebar />
      <div className="flex-1 overflow-auto">
        <header className="bg-white border-b border-[#f0dcc8] px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div>
            <h1 className="font-display font-bold text-gray-900 text-lg">Dashboard Overview</h1>
            <p className="text-xs text-[#6b5b45]">Welcome back, Pt. {pandit?.name}</p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="badge-saffron">🧘 Online Now</span>
          </div>
        </header>

        <main className="p-6 space-y-8 max-w-6xl mx-auto">
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-white border border-[#f0dcc8] rounded-2xl p-4 shadow-card">
                <div className="text-2xl mb-2">{s.icon}</div>
                <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-[#6b5b45] font-medium mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Today's Poojas - Left/Main Col */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-gray-900 flex items-center gap-2">
                  <Calendar size={20} className="text-[#ff7f0a]" />
                  Today's Schedule
                </h2>
                <Link href="/pandit/orders?tab=today" className="text-sm font-semibold text-[#ff7f0a] hover:underline">
                  View All
                </Link>
              </div>

              {todayPoojas.length > 0 ? (
                <div className="space-y-4">
                  {todayPoojas.map((order) => (
                    <div key={order._id} className="bg-white border border-[#f0dcc8] rounded-2xl shadow-card p-5 group">
                      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-[#fff8f0] rounded-2xl flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                            {order.poojaId?.emoji || '🙏'}
                          </div>
                          <div>
                            <h3 className="font-display font-bold text-gray-900">{order.poojaId?.name || 'Pooja'}</h3>
                            <p className="text-xs text-[#6b5b45]">🛕 {order.templeId?.name || 'Temple'}</p>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${order.orderStatus === 'in-progress'
                            ? 'bg-blue-50 text-blue-600 border-blue-100'
                            : 'bg-orange-50 text-orange-600 border-orange-100'
                          }`}>
                          {order.orderStatus === 'in-progress' ? 'In Progress' : 'Confirmed'}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-5 text-[13px]">
                        <div className="space-y-2">
                          <p className="text-[#6b5b45]">👤 <span className="text-gray-900 font-semibold">{order.sankalpName}</span></p>
                          <p className="text-[#6b5b45]">📞 <span className="text-gray-900 font-semibold">{order.phone}</span></p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[#6b5b45]">💬 <span className="text-[#25D366] font-semibold">WA: {order.whatsapp}</span></p>
                          <p className="text-[#6b5b45]">💰 <span className="text-gray-900 font-semibold">{formatINR(order.totalAmount)}</span></p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {order.orderStatus === 'confirmed' ? (
                          <button
                            onClick={() => startPooja(order._id)}
                            className="flex-1 btn-saffron py-2.5 text-xs flex items-center justify-center gap-2"
                          >
                            <Play size={14} /> Start Pooja 🙏
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="flex-1 bg-blue-600 text-white font-bold rounded-xl py-2.5 text-xs hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                          >
                            <ExternalLink size={14} /> Upload Video 📹
                          </button>

                        )}
                        <Link
                          href={`/pandit/orders/${order._id}`}
                          className="px-4 py-2.5 border border-[#f0dcc8] rounded-xl text-xs font-semibold text-[#6b5b45] hover:bg-white hover:text-[#ff7f0a] transition-colors"
                        >
                          Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-dashed border-[#f0dcc8] rounded-2xl p-12 text-center text-[#6b5b45]">
                  <p className="text-3xl mb-3">🪔</p>
                  <p className="font-semibold text-gray-900 mb-1 text-sm">No poojas scheduled for today</p>
                  <p className="text-xs">Take some rest or check upcoming poojas.</p>
                </div>
              )}
            </div>

            {/* Upcoming - Right Sidebar Col */}
            <div className="space-y-6">
              <h2 className="font-display font-bold text-gray-900 flex items-center gap-2">
                <Clock size={20} className="text-[#ff7f0a]" />
                Upcoming (Next 7 Days)
              </h2>

              <div className="space-y-3">
                {upcomingPoojas.length > 0 ? (
                  upcomingPoojas.map((order) => (
                    <Link
                      key={order._id}
                      href={`/pandit/orders/${order._id}`}
                      className="bg-white border border-[#f0dcc8] rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-3 group"
                    >
                      <div className="w-10 h-10 bg-[#fff8f0] rounded-lg flex items-center justify-center text-lg">
                        {order.poojaId?.emoji || '🙏'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs text-gray-900 truncate">{order.poojaId?.name || 'Pooja'}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-[#ff7f0a] font-bold">
                            {new Date(order.bookingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                          <span className="text-[10px] text-[#6b5b45]">· {order.sankalpName}</span>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-gray-300 group-hover:text-[#ff7f0a] transition-colors" />
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-8 text-[#6b5b45] text-xs">
                    No upcoming poojas found.
                  </div>
                )}

                {orders.length > 0 && (
                  <Link
                    href="/pandit/orders?tab=upcoming"
                    className="block w-full text-center py-3 bg-white border border-[#f0dcc8] rounded-xl text-xs font-bold text-[#ff7f0a] hover:bg-[#fff8f0] transition-colors"
                  >
                    View Full Schedule
                  </Link>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {selectedOrder && (
        <VideoUploadModal
          orderId={selectedOrder._id}
          devoteeName={selectedOrder.sankalpName}
          poojaName={selectedOrder.poojaId?.name || 'Pooja'}
          onSuccess={() => {
            setSelectedOrder(null)
            fetchData()
          }}
          onClose={() => setSelectedOrder(null)}
        />
      )}

    </div>
  )
}
