'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import PanditSidebar from '@/components/pandit/PanditSidebar'
import VideoUploadModal from '@/components/pandit/VideoUploadModal'
import {
  ChevronLeft, Calendar, User, Phone,
  CheckCircle, Play, Video, ExternalLink,
  History, Info, CreditCard, Flame, Building2, Gift
} from 'lucide-react'
import { formatINR, formatDate } from '@/lib/utils'

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState<any>(null)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/pandit/orders/${params.id}`)
      const data = await res.json()
      if (data.success) setOrder(data.data)
      else router.push('/pandit/dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrder()
  }, [])

  const startPooja = async () => {
    const res = await fetch(`/api/pandit/orders/${order._id}/start`, { method: 'POST' })
    if (res.ok) fetchOrder()
  }

  if (loading) {
    return (
      <div className="h-screen bg-[#fdf6ee] flex overflow-hidden">
        <PanditSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#ff7f0a] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-[#fdf6ee] flex overflow-hidden">
      <PanditSidebar />
      <div className="flex-1 overflow-auto h-full pb-24 md:pb-8">
        <header className="bg-white border-b border-[#f0dcc8] px-6 py-4 sticky top-0 z-30 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-bold text-[#6b5b45] hover:text-[#ff7f0a] transition-colors"
          >
            <ChevronLeft size={18} /> Back
          </button>
          <div className="text-right">
            <span className="text-[10px] font-mono text-gray-400">Order ID: {order.bookingId}</span>
          </div>
        </header>

        <main className="p-6 max-w-4xl mx-auto space-y-6">
          {/* Main Card/Pooja Header */}
          <div className="bg-white border border-[#f0dcc8] rounded-3xl p-8 shadow-card overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#fff8f0] rounded-bl-full -mr-16 -mt-16 z-0 opacity-50" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-[#fff8f0] to-[#f0dcc8] rounded-2xl flex items-center justify-center shadow-inner shadow-orange-200">
                  <Flame size={36} className="text-[#ff7f0a]" />
                </div>
                <div>
                  <h1 className="font-display text-2xl font-bold text-gray-900">{order.poojaId?.name || 'Pooja'}</h1>
                  <p className="text-[#ff7f0a] font-semibold flex items-center gap-1.5 mt-1">
                    <Building2 size={14} className="shrink-0" /> {order.templeId?.name || 'Temple'}
                  </p>
                  <p className="text-xs text-[#6b5b45] mt-1">{order.templeId?.location || ''}</p>
                </div>
              </div>

              <div className="text-left md:text-right pt-4 md:pt-0 border-t md:border-t-0 border-[#fdf6ee]">
                <div className="text-3xl font-bold text-gray-900 mb-1">{formatINR(order.totalAmount)}</div>
                <div className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${order.orderStatus === 'completed' ? 'bg-green-50 text-green-600 border-green-100' :
                  order.orderStatus === 'in-progress' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                    'bg-orange-50 text-orange-600 border-orange-100'
                  }`}>
                  {order.orderStatus}
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Devotee & Sankalp Details */}
            <div className="bg-white border border-[#f0dcc8] rounded-2xl shadow-card overflow-hidden">
              <div className="px-5 py-4 border-b border-[#f0dcc8] bg-[#fff8f0] flex items-center gap-2">
                <User size={18} className="text-[#ff7f0a]" />
                <h3 className="font-display font-bold text-sm text-gray-900 uppercase tracking-wide">Devotee Details</h3>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-[#6b5b45] uppercase font-bold mb-1">Pooja For</p>
                    <p className="text-sm font-bold text-gray-900">{order.sankalpName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#6b5b45] uppercase font-bold mb-1">Gotra</p>
                    <p className="text-sm font-bold text-gray-900">{order.gotra || 'Not Specified'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#6b5b45] uppercase font-bold mb-1">Date of Birth</p>
                    <p className="text-sm font-bold text-gray-900">{order.dob || 'Not Provided'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#6b5b45] uppercase font-bold mb-1">Pooja Date</p>
                    <p className="text-sm font-bold text-[#ff7f0a]">{formatDate(order.bookingDate)}</p>
                  </div>
                </div>

                <div className="bg-[#fdf6ee] rounded-xl p-4 border border-[#f0dcc8]">
                  <p className="text-[10px] text-[#6b5b45] uppercase font-bold mb-2">Sankalp / Wish</p>
                  <p className="text-xs text-gray-900 italic leading-relaxed">"{order.sankalp || 'Blessings for the whole family'}"</p>
                </div>

                <div className="flex flex-wrap gap-4 pt-4 border-t border-[#fdf6ee]">
                  <a
                    href={`tel:${order.phone}`}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-[#f0dcc8] text-xs font-bold text-[#6b5b45] hover:bg-[#fff8f0] transition-colors"
                  >
                    <Phone size={14} /> Call
                  </a>
                  <a
                    href={`https://wa.me/${order.whatsapp}`}
                    target="_blank"
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#25D366] text-white text-xs font-bold hover:brightness-95 transition-all"
                  >
                    <ExternalLink size={14} /> WhatsApp
                  </a>
                </div>
              </div>
            </div>

            {/* Chadhava & Items */}
            <div className="bg-white border border-[#f0dcc8] rounded-2xl shadow-card overflow-hidden">
              <div className="px-5 py-4 border-b border-[#f0dcc8] bg-[#fff8f0] flex items-center gap-2">
                <Info size={18} className="text-[#ff7f0a]" />
                <h3 className="font-display font-bold text-sm text-gray-900 uppercase tracking-wide">Pooja Offerings</h3>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <p className="text-[10px] text-[#6b5b45] uppercase font-bold mb-3">Main Pooja</p>
                  <div className="flex items-center justify-between text-sm font-bold text-gray-900">
                    <span>{order.poojaId?.name || 'Pooja'}</span>
                    <span>{formatINR(order.poojaAmount)}</span>
                  </div>
                </div>

                {order.chadhavaItems?.length > 0 && (
                  <div>
                    <p className="text-[10px] text-[#6b5b45] uppercase font-bold mb-3">Selected Chadhava</p>
                    <div className="space-y-3">
                      {order.chadhavaItems.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between text-xs font-medium text-gray-900">
                          <span className="flex items-center gap-2">
                            <span className="w-6 h-6 bg-gray-50 rounded flex items-center justify-center">
                              <Gift size={13} className="text-[#ff7f0a]" />
                            </span>
                            {item.name}
                          </span>
                          <span>{formatINR(item.price)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-[#fdf6ee]">
                  <p className="text-[10px] text-[#6b5b45] uppercase font-bold mb-3">Pricing Breakdown</p>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-[#6b5b45]">
                      <span>Dakshina</span>
                      <span>{formatINR(order.poojaAmount)}</span>
                    </div>
                    <div className="flex justify-between text-[#6b5b45]">
                      <span>Chadhava</span>
                      <span>{formatINR(order.chadhavaAmount)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-gray-900 pt-1 text-base">
                      <span>Total</span>
                      <span>{formatINR(order.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline / Action Section */}
          <div className="bg-white border border-[#f0dcc8] rounded-2xl shadow-card p-6">
            <h3 className="font-display font-bold text-sm text-gray-900 uppercase tracking-wide mb-6">Execution Status</h3>

            <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-0 before:w-0.5 before:bg-[#fdf6ee] before:z-0">
              {[
                {
                  status: 'confirmed',
                  title: 'Booking Confirmed',
                  desc: 'Pandit assigned and order accepted.',
                  active: true,
                  completed: true
                },
                {
                  status: 'in-progress',
                  title: 'Pooja Started',
                  desc: 'Pandit has initiated the vidhi.',
                  active: order.orderStatus === 'in-progress' || order.orderStatus === 'completed',
                  completed: order.orderStatus === 'in-progress' || order.orderStatus === 'completed'
                },
                {
                  status: 'completed',
                  title: 'Pooja Completed',
                  desc: 'Video uploaded and sent to devotee.',
                  active: order.orderStatus === 'completed',
                  completed: order.orderStatus === 'completed'
                },
              ].map((step, idx) => (
                <div key={idx} className="flex gap-6 relative z-10">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors duration-500 ${step.completed ? 'bg-[#ff7f0a] border-[#ff7f0a] text-white' :
                    step.active ? 'bg-white border-[#ff7f0a] text-[#ff7f0a] animate-pulse' :
                      'bg-white border-[#f0dcc8] text-gray-300'
                    }`}>
                    {step.completed ? <CheckCircle size={14} /> : idx + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className={`text-sm font-bold ${step.active ? 'text-gray-900' : 'text-gray-400'}`}>{step.title}</h4>
                    <p className="text-xs text-[#6b5b45] mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 flex gap-4">
              {order.orderStatus === 'confirmed' && (
                <button
                  onClick={startPooja}
                  className="flex-1 btn-saffron py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-orange-500/30"
                >
                  <Play size={20} />
                  <span className="text-base">Start Pooja Now</span>
                </button>
              )}
              {order.orderStatus === 'in-progress' && (
                <button
                  onClick={() => setSelectedOrderId(order._id)}
                  className="flex-1 bg-blue-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all"
                >
                  <Video size={20} />
                  <span className="text-base">Upload Pooja Video</span>
                </button>
              )}
              {order.orderStatus === 'completed' && (
                <div className="w-full flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                      <CheckCircle size={28} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-green-800">Pooja Successfully Completed</p>
                      <p className="text-[10px] text-green-600">Earnings added to your account</p>
                    </div>
                  </div>
                  {order.videoUrl && (
                    <a
                      href={order.videoUrl}
                      target="_blank"
                      className="btn-saffron py-4 px-8 rounded-2xl flex items-center justify-center gap-3"
                    >
                      <ExternalLink size={18} /> View Video
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {selectedOrderId && (
        <VideoUploadModal
          orderId={selectedOrderId}
          devoteeName={order.sankalpName}
          poojaName={order.poojaId?.name || 'Pooja'}
          onSuccess={() => {
            setSelectedOrderId(null)
            fetchOrder()
          }}
          onClose={() => setSelectedOrderId(null)}
        />
      )}

    </div>
  )
}
