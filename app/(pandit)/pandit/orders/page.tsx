'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import PanditSidebar from '@/components/pandit/PanditSidebar'
import VideoUploadModal from '@/components/pandit/VideoUploadModal'
import {
  Calendar, Search, Phone, ExternalLink,
  ChevronRight, Play, CheckCircle, Clock, AlertCircle, Video, Flame, Building2
} from 'lucide-react'

import { formatINR, formatDate } from '@/lib/utils'

export default function PanditOrdersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentTab = searchParams.get('tab') || 'today'

  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<any[]>([])
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)

  const [searchTerm, setSearchTerm] = useState('')

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/pandit/orders')
      const data = await res.json()
      if (data.success) {
        let filtered = data.data
        const today = new Date().toISOString().split('T')[0]

        if (currentTab === 'today') {
          filtered = filtered.filter((o: any) =>
            new Date(o.bookingDate).toISOString().split('T')[0] === today
          )
        } else if (currentTab === 'upcoming') {
          filtered = filtered.filter((o: any) =>
            new Date(o.bookingDate).toISOString().split('T')[0] > today
          )
        } else if (currentTab === 'completed') {
          filtered = filtered.filter((o: any) => o.orderStatus === 'completed')
        }

        setOrders(filtered)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [currentTab])

  const startPooja = async (id: string) => {
    const res = await fetch(`/api/pandit/orders/${id}/start`, { method: 'POST' })
    if (res.ok) fetchData()
  }

  const acceptOrder = async (id: string) => {
    const res = await fetch(`/api/pandit/orders/${id}/accept`, { method: 'POST' })
    if (res.ok) fetchData()
  }

  const declineOrder = async (id: string) => {
    if (confirm('Are you sure you want to decline this pooja?')) {
      const res = await fetch(`/api/pandit/orders/${id}/decline`, { method: 'POST' })
      if (res.ok) fetchData()
    }
  }

  const tabs = [
    { id: 'today', label: "Today's", icon: <Calendar size={14} /> },
    { id: 'upcoming', label: 'Upcoming', icon: <Clock size={14} /> },
    { id: 'completed', label: 'Completed', icon: <CheckCircle size={14} /> },
    { id: 'all', label: 'All Poojas', icon: <Search size={14} /> },
  ]

  const filteredOrders = orders.filter(o =>
    o.sankalpName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.bookingId.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#fdf6ee] flex">
      <PanditSidebar />
      <div className="flex-1 overflow-auto">
        <header className="bg-white border-b border-[#f0dcc8] px-6 py-4 sticky top-0 z-30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="font-display font-bold text-gray-900 text-lg">Manage Poojas</h1>

            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by devotee or ID..."
                className="input-divine w-full sm:w-64 pl-9 py-2 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-1 mt-6 overflow-x-auto pb-1 no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => router.push(`/pandit/orders?tab=${tab.id}`)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${currentTab === tab.id
                  ? 'bg-[#ff7f0a] text-white shadow-md'
                  : 'text-[#6b5b45] hover:bg-white hover:text-[#ff7f0a]'
                  }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </header>

        <main className="p-6 max-w-5xl mx-auto">
          {loading ? (
            <div className="py-20 flex justify-center">
              <div className="w-10 h-10 border-4 border-[#ff7f0a] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className="grid gap-6">
              {filteredOrders.map((order) => (
                <div key={order._id} className="bg-white border border-[#f0dcc8] rounded-2xl shadow-card overflow-hidden group">
                  <div className="flex flex-col md:flex-row">
                    {/* Date/Status Strip */}
                    <div className="md:w-40 bg-[#fff8f0] p-4 flex md:flex-col items-center justify-between md:justify-center text-center border-b md:border-b-0 md:border-r border-[#f0dcc8]">
                      <div>
                        <div className="text-xl font-bold text-[#8b0000]">
                          {new Date(order.bookingDate).getDate()}
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-[#6b5b45]">
                          {new Date(order.bookingDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                      <div className="mt-0 md:mt-4">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${order.orderStatus === 'completed' ? 'bg-green-50 text-green-600 border-green-100' :
                          order.orderStatus === 'in-progress' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                            order.orderStatus === 'assigned' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                              order.orderStatus === 'cancelled' ? 'bg-red-50 text-red-600 border-red-100' :
                                'bg-orange-50 text-orange-600 border-orange-100'
                          }`}>
                          {order.orderStatus}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-5">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Flame size={18} className="text-[#ff7f0a]" />
                            <h3 className="font-display font-bold text-gray-900">{order.poojaId?.name || 'Pooja'}</h3>
                          </div>
                          <p className="text-xs text-[#6b5b45] flex items-center gap-1">Mandir: <Building2 size={11} className="shrink-0" /> {order.templeId?.name || 'Temple'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">{formatINR(order.totalAmount)}</p>
                          <p className="text-[10px] text-gray-400 font-mono">ID: {order.bookingId}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 py-4 border-y border-[#fdf6ee]">
                        <div>
                          <p className="text-[10px] text-[#6b5b45] uppercase font-bold mb-1">Devotee</p>
                          <p className="text-xs font-bold text-gray-900 truncate">{order.sankalpName}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-[#6b5b45] uppercase font-bold mb-1">Gotra</p>
                          <p className="text-xs font-bold text-gray-900">{order.gotra || 'Not specified'}</p>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <p className="text-[10px] text-[#6b5b45] uppercase font-bold mb-1">Contact</p>
                          <div className="flex items-center gap-2">
                            <a href={`tel:${order.phone}`} className="p-1 hover:bg-[#fff8f0] rounded text-gray-600"><Phone size={14} /></a>
                            <a href={`https://wa.me/${order.whatsapp}`} target="_blank" className="p-1 hover:bg-[#fff8f0] rounded text-[#25D366]"><ExternalLink size={14} /></a>
                            <span className="text-[11px] font-bold text-gray-900">{order.phone}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-5">
                        <Link
                          href={`/pandit/orders/${order._id}`}
                          className="text-xs font-bold text-[#6b5b45] flex items-center gap-1 hover:text-[#ff7f0a]"
                        >
                          Full Details <ChevronRight size={14} />
                        </Link>

                        <div className="flex gap-2">
                          {order.orderStatus === 'assigned' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => acceptOrder(order._id)}
                                className="bg-green-600 text-white font-bold rounded-xl py-1.5 px-4 text-[11px] flex items-center gap-1.5"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => declineOrder(order._id)}
                                className="bg-red-50 text-red-600 border border-red-100 font-bold rounded-xl py-1.5 px-4 text-[11px] flex items-center gap-1.5"
                              >
                                Decline
                              </button>
                            </div>
                          )}
                          {order.orderStatus === 'confirmed' && (
                            <button
                              onClick={() => startPooja(order._id)}
                              className="btn-saffron py-1.5 px-4 text-[11px] flex items-center gap-1.5"
                            >
                              <Play size={12} /> Start Pooja
                            </button>
                          )}
                          {order.orderStatus === 'in-progress' && (
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="bg-blue-600 text-white font-bold rounded-xl py-1.5 px-4 text-[11px] flex items-center gap-1.5"
                            >
                              <Video size={12} /> Upload Video
                            </button>
                          )}

                          {order.orderStatus === 'completed' && order.videoUrl && (
                            <a
                              href={order.videoUrl}
                              target="_blank"
                              className="bg-green-100 text-green-700 font-bold rounded-xl py-1.5 px-4 text-[11px] flex items-center gap-1.5"
                            >
                              <ExternalLink size={12} /> View Video
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-[#f0dcc8] rounded-2xl p-16 text-center">
              <div className="w-20 h-20 bg-[#fff8f0] rounded-full flex items-center justify-center text-3xl mx-auto mb-6">🪷</div>
              <h2 className="font-display font-bold text-gray-900 text-xl mb-2">No Poojas Found</h2>
              <p className="text-[#6b5b45] max-w-sm mx-auto text-sm">
                We couldn't find any poojas matching your criteria. Try switching tabs or searching for something else.
              </p>
              <button
                onClick={() => router.push('/pandit/orders?tab=all')}
                className="mt-8 text-[#ff7f0a] font-bold text-sm hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
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
