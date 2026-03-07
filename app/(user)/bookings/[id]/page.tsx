'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { ChevronRight, ArrowLeft, Loader2, Calendar, Clock, MapPin, Phone, MessageCircle, FileText, Download, Share2, Video, Star, Flame, Users } from 'lucide-react'
import ReviewForm from '@/components/booking/ReviewForm'
import { getReviewByOrder } from '@/lib/actions/reviews'
import { useCurrency } from '@/context/CurrencyContext'
import { convertINRtoUSD, formatCurrency } from '@/lib/currency'

// ── Types ─────────────────────────────────────────────────────────────────────
interface OrderData {
    _id: string
    bookingId: string
    poojaId: { _id: string; name: string; emoji: string; duration: string; images?: string[] }
    templeId: { _id: string; name: string; location: string }
    panditId?: { _id: string; name: string; phone: string }
    bookingDate: string
    sankalpName: string
    gotra: string
    dob?: string
    phone: string
    whatsapp: string
    sankalp?: string
    address?: string
    qty: number
    chadhavaItems: { name: string; price: number; emoji: string }[]
    poojaAmount: number
    chadhavaAmount: number
    extraDonation: number
    totalAmount: number
    orderStatus: 'pending' | 'assigned' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled'
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
    isDonation: boolean
    videoUrl?: string
    poojaImage?: string
    createdAt: string
}

// ── Status Config ─────────────────────────────────────────────────────────────
const statusConfig = {
    pending: { label: 'Pending', bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700' },
    assigned: { label: 'Assigned', bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700' },
    confirmed: { label: 'Confirmed', bg: 'bg-[#fff8f0]', border: 'border-[#ffd9a8]', text: 'text-[#ff7f0a]' },
    'in-progress': { label: 'In Progress', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
    completed: { label: 'Completed', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
    cancelled: { label: 'Cancelled', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-600' },
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric',
    })
}

export default function BookingDetailsPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const { currency, exchangeRate } = useCurrency()
    // In Next.js 14 and below, params is directly accessed as an object.
    const orderId = params.id

    const [order, setOrder] = useState<OrderData | null>(null)
    const [review, setReview] = useState<any>(null)
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!orderId) {
            setError('Invalid Booking ID.')
            setLoading(false)
            return
        }

        const loadData = async () => {
            try {
                const [orderRes, userRes] = await Promise.all([
                    fetch(`/api/orders/${orderId}`),
                    fetch(`/api/auth/me`)
                ]);

                const orderData = await orderRes.json();
                const userData = await userRes.json();

                if (orderData.success) {
                    setOrder(orderData.data);
                    // Fetch review for this order
                    const reviewData = await getReviewByOrder(orderId);
                    setReview(reviewData);
                } else {
                    setError(orderData.message || 'Could not load booking details.');
                }

                if (userData.success) {
                    setUser(userData.data);
                }
            } catch (err) {
                setError('Failed to load booking details. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [orderId])

    // Handle scroll to review section
    useEffect(() => {
        if (!loading && window.location.hash === '#review-section') {
            const element = document.getElementById('review-section');
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        }
    }, [loading]);

    const handleDownloadReceipt = () => {
        if (!order) return;

        const receiptHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Booking Receipt — ${order.bookingId}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; color: #111827; background: #f9fafb; }
    .receipt { max-width: 640px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.10); }
    .header { background: linear-gradient(135deg, #f97316 0%, #dc2626 100%); color: white; padding: 32px; text-align: center; }
    .header h1 { font-size: 26px; font-weight: 800; margin-bottom: 4px; }
    .header p { font-size: 13px; opacity: 0.85; }
    .badge { display: inline-block; background: rgba(255,255,255,0.2); padding: 6px 16px; border-radius: 999px; font-size: 12px; font-weight: 700; letter-spacing: 1px; margin-top: 12px; }
    .body { padding: 28px 32px; }
    .booking-id-box { background: #fff7ed; border: 2px solid #fed7aa; border-radius: 12px; padding: 16px 20px; text-align: center; margin-bottom: 24px; }
    .booking-id-box .label { font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; }
    .booking-id-box .id { font-size: 22px; font-weight: 800; color: #f97316; margin-top: 4px; letter-spacing: 2px; }
    .section-title { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #9ca3af; font-weight: 700; margin-bottom: 12px; border-bottom: 1px solid #f3f4f6; padding-bottom: 8px; }
    .row { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; padding: 7px 0; font-size: 14px; }
    .row .key { color: #6b7280; flex-shrink: 0; }
    .row .val { font-weight: 600; color: #111827; text-align: right; }
    .section { margin-bottom: 24px; }
    .price-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
    .total-row { display: flex; justify-content: space-between; padding: 12px 0; font-size: 16px; font-weight: 800; border-top: 2px solid #f97316; margin-top: 8px; color: #f97316; }
    .footer { background: #f9fafb; padding: 20px 32px; text-align: center; border-top: 1px solid #f3f4f6; }
    .footer p { font-size: 12px; color: #9ca3af; line-height: 1.8; }
    .status-paid { display: inline-block; background: #dcfce7; color: #16a34a; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 999px; }
    @media print { body { padding: 0; background: white; } .receipt { box-shadow: none; } }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <h1>🛕 Mandirlok</h1>
      <p>Online Pooja &amp; Temple Booking Platform</p>
      <div class="badge">✅ BOOKING CONFIRMED</div>
    </div>
    <div class="body">
      <div class="booking-id-box">
        <div class="label">Booking Reference ID</div>
        <div class="id">${order.bookingId}</div>
      </div>
      <div class="section">
        <div class="section-title">${order.isDonation ? "Donation Details" : order.poojaId?.name ? "Pooja Details" : "Offering Details"}</div>
        <div class="row"><span class="key">${order.isDonation ? "Donation" : order.poojaId?.name ? "Pooja" : "Offering"}</span><span class="val">${order.isDonation ? "Direct Temple Donation" : order.poojaId?.name ? order.poojaId.name : (order.chadhavaItems && order.chadhavaItems.length > 0) ? order.chadhavaItems.map(c => c.name).join(', ') : '—'}</span></div>
        <div class="row"><span class="key">Temple</span><span class="val">🛕 ${order.templeId?.name || '—'}</span></div>
        <div class="row"><span class="key">Location</span><span class="val">${order.templeId?.location || '—'}</span></div>
        <div class="row"><span class="key">Pooja Date</span><span class="val">${new Date(order.bookingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
        <div class="row"><span class="key">Duration</span><span class="val">${order.poojaId?.duration || '—'}</span></div>
        <div class="row"><span class="key">Devotees</span><span class="val">${order.qty || 1}</span></div>
      </div>
      <div class="section">
        <div class="section-title">Sankalp Details</div>
        <div class="row"><span class="key">Name</span><span class="val">${order.sankalpName}</span></div>
        <div class="row"><span class="key">Gotra</span><span class="val">${order.gotra || '—'}</span></div>
        <div class="row"><span class="key">Phone</span><span class="val">${order.phone.startsWith('+') ? order.phone : '+' + order.phone}</span></div>
        ${order.sankalp ? `<div class="row"><span class="key">Sankalp</span><span class="val" style="max-width:260px">${order.sankalp}</span></div>` : ''}
      </div>
      <div class="section">
        <div class="section-title">Payment Summary</div>
        ${(order.poojaAmount > 0 || (order.isDonation && !order.chadhavaItems?.length)) ? `<div class="price-row"><span style="color:#6b7280">${order.isDonation ? "Direct Donation" : `Base Pooja (${order.qty || 1} Person${(order.qty || 1) > 1 ? 's' : ''})`}</span><span>${formatCurrency(currency === "USD" ? convertINRtoUSD(order.poojaAmount) : order.poojaAmount, currency)}</span></div>` : ''}
        ${order.extraDonation > 0 && order.chadhavaItems && order.chadhavaItems.length > 0 ? `<div class="price-row"><span style="color:#6b7280">Direct Donation</span><span>${formatCurrency(currency === "USD" ? convertINRtoUSD(order.extraDonation) : order.extraDonation, currency)}</span></div>` : ''}
        ${(order.chadhavaAmount || 0) > 0 ? `<div class="price-row"><span style="color:#6b7280">Chadhava Amount</span><span>${formatCurrency(currency === "USD" ? convertINRtoUSD(order.chadhavaAmount) : order.chadhavaAmount, currency)}</span></div>` : ''}
        <div class="total-row"><span>Total Paid</span><span>${formatCurrency(currency === "USD" ? convertINRtoUSD(order.totalAmount) : order.totalAmount, currency)}</span></div>
        <div style="text-align:right;margin-top:8px"><span class="status-paid">✅ Payment Successful</span></div>
      </div>
    </div>
    <div class="footer">
      <p>
        Booking Date: ${new Date(order.createdAt).toLocaleString('en-IN')}<br/>
        For support: support@mandirlok.com<br/>
        This is a computer-generated receipt. 🙏 Jai Shree Ram
      </p>
    </div>
  </div>
  <script>window.onload = () => { setTimeout(() => { window.print(); }, 500); };</script>
</body>
</html>`;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(receiptHTML);
            printWindow.document.close();
        }
    };

    return (
        <>
            <Navbar />
            <main className="pt-20 min-h-screen bg-[#fdf6ee]">

                {/* Breadcrumb */}
                <div className="bg-white border-b border-[#f0dcc8]">
                    <div className="container-app py-3 flex items-center gap-2 text-xs text-[#6b5b45]">
                        <Link href="/" className="hover:text-[#ff7f0a]">Home</Link>
                        <ChevronRight size={12} />
                        <Link href="/dashboard" className="hover:text-[#ff7f0a]">Dashboard</Link>
                        <ChevronRight size={12} />
                        <span className="text-[#1a1209] font-medium">Booking Details</span>
                    </div>
                </div>

                <div className="container-app py-8 max-w-3xl mx-auto">

                    {/* Back Button */}
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-1.5 text-sm text-[#6b5b45] hover:text-[#ff7f0a] mb-6 transition-colors"
                    >
                        <ArrowLeft size={16} /> Back
                    </button>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 size={40} className="animate-spin text-[#ff7f0a] mb-4" />
                            <p className="text-[#6b5b45]">Loading your booking details...</p>
                        </div>
                    ) : error || !order ? (
                        <div className="bg-white border border-[#f0dcc8] rounded-2xl p-8 text-center shadow-card">
                            <p className="text-red-600 mb-4">{error || 'Booking not found.'}</p>
                            <Link href="/dashboard" className="btn-saffron text-sm px-6">
                                Go to Dashboard
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-6">

                            {/* Header Card */}
                            <div className="bg-white border border-[#f0dcc8] rounded-2xl p-6 shadow-card">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#f0dcc8] pb-5 mb-5">
                                    <div>
                                        <h1 className="heading-md text-[#1a1209] mb-1">
                                            Booking: <span className="text-[#ff7f0a]">{order.bookingId}</span>
                                        </h1>
                                        <p className="text-xs text-[#6b5b45]">
                                            Booked on {formatDate(order.createdAt)}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${statusConfig[order.orderStatus]?.bg || 'bg-gray-50'} ${statusConfig[order.orderStatus]?.border || 'border-gray-200'} ${statusConfig[order.orderStatus]?.text || 'text-gray-600'}`}>
                                            {statusConfig[order.orderStatus]?.label || order.orderStatus}
                                        </span>
                                        {order.paymentStatus === 'paid' ?
                                            <span className="text-[10px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-200">Payment: Success</span> :
                                            <span className="text-[10px] font-medium text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded border border-yellow-200">Payment: Pending</span>
                                        }
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-16 h-16 bg-[#fff8f0] rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 shadow-inner overflow-hidden">
                                        {order.poojaImage ? (
                                            <img src={order.poojaImage} alt={order.poojaId?.name || "Chadhava"} className="w-full h-full object-cover" />
                                        ) : order.poojaId?.images?.[0] ? (
                                            <img src={order.poojaId.images[0]} alt={order.poojaId.name} className="w-full h-full object-cover" />
                                        ) : order.chadhavaItems && order.chadhavaItems.length > 0 && (order.chadhavaItems[0] as any).chadhavaId?.image ? (
                                            <img src={(order.chadhavaItems[0] as any).chadhavaId.image} alt={order.chadhavaItems[0].name} className="w-full h-full object-cover" />
                                        ) : order.chadhavaItems && order.chadhavaItems.length > 0 && order.chadhavaItems[0].emoji ? (
                                            <span>{order.chadhavaItems[0].emoji}</span>
                                        ) : (
                                            <Flame size={28} className="text-[#ff7f0a]" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="font-display font-bold text-lg text-[#1a1209] mb-1">
                                            {order.isDonation
                                                ? "Direct Temple Donation"
                                                : order.poojaId?.name
                                                    ? order.poojaId.name
                                                    : (order.chadhavaItems && order.chadhavaItems.length > 0)
                                                        ? order.chadhavaItems.map(c => c.name).join(", ")
                                                        : "Pooja"}
                                        </h2>
                                        <p className="text-sm text-[#ff7f0a] mb-3 flex items-center gap-1.5">
                                            <MapPin size={14} /> {order.templeId?.name}, {order.templeId?.location}
                                        </p>
                                        <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs text-[#6b5b45]">
                                            <span className="flex items-center gap-1.5"><Calendar size={14} className="text-[#ff7f0a]" /> {formatDate(order.bookingDate)}</span>
                                            {!order.isDonation && <span className="flex items-center gap-1.5"><Clock size={14} className="text-[#ff7f0a]" /> {order.poojaId?.duration}</span>}
                                            {!order.isDonation && <span className="flex items-center gap-1.5"><Users size={14} className="text-[#ff7f0a]" /> {order.qty || 1} Devotee{order.qty > 1 ? 's' : ''}</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Bar (Video/Receipt) */}
                            {(order.videoUrl || order.orderStatus === 'completed') && (
                                <div className="bg-[#f0fdf4] border border-green-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-green-800 text-sm mb-1">
                                            {order.isDonation
                                                ? "Donation Successful"
                                                : order.poojaId?.name
                                                    ? "Pooja Completed Successfully"
                                                    : "Offering Received Successfully"}
                                        </h3>
                                        <p className="text-xs text-green-700">
                                            {order.isDonation
                                                ? "Your donation has been received by the temple."
                                                : order.poojaId?.name
                                                    ? "The pandit has performed the rituals with your sankalp."
                                                    : "Your sacred offering has been offered to the deity with your sankalp."}
                                        </p>
                                    </div>
                                    <div className="flex gap-3 w-full sm:w-auto">
                                        {order.videoUrl && (
                                            <a href={order.videoUrl} target="_blank" rel="noreferrer" className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-sm bg-green-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-green-700 transition">
                                                <Video size={16} /> Watch Video
                                            </a>
                                        )}
                                        <button onClick={handleDownloadReceipt} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-sm bg-white border border-green-300 text-green-700 px-4 py-2 rounded-xl font-medium hover:bg-green-50 transition">
                                            <Download size={16} /> Receipt
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Grid 2 Columns for details */}
                            <div className="grid md:grid-cols-2 gap-6">

                                {/* Sankalp Details */}
                                <div className="bg-white border border-[#f0dcc8] rounded-2xl p-6 shadow-card">
                                    <h3 className="font-display font-semibold text-[#1a1209] mb-4 flex items-center gap-2">
                                        <FileText size={18} className="text-[#ff7f0a]" /> Sankalp Details
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <span className="text-[#6b5b45]">Name</span>
                                            <span className="font-medium text-[#1a1209] text-right">{order.sankalpName}</span>

                                            <span className="text-[#6b5b45]">Gotra</span>
                                            <span className="font-medium text-[#1a1209] text-right">{order.gotra || '—'}</span>

                                            <span className="text-[#6b5b45]">Date of Birth</span>
                                            <span className="font-medium text-[#1a1209] text-right">{order.dob ? formatDate(order.dob) : '—'}</span>
                                        </div>

                                        {order.sankalp && (
                                            <div className="bg-[#fff8f0] p-3 rounded-xl border border-[#ffd9a8] text-sm mt-2">
                                                <span className="block text-xs text-[#6b5b45] mb-1">Special Wish:</span>
                                                <span className="text-[#1a1209] italic">"{order.sankalp}"</span>
                                            </div>
                                        )}

                                        <div className="pt-4 border-t border-gray-100">
                                            <h4 className="text-xs font-semibold text-[#1a1209] mb-2">Contact Info</h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center justify-between">
                                                    <span className="flex items-center gap-1.5 text-[#6b5b45]"><Phone size={14} /> Mobile</span>
                                                    <span className="font-medium text-[#1a1209]">{order.phone.startsWith('+') ? order.phone : (order.phone.startsWith('91') || order.phone.startsWith('977') ? '+' + order.phone : '+91 ' + order.phone)}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="flex items-center gap-1.5 text-[#6b5b45]"><MessageCircle size={14} className="text-[#25D366]" /> WhatsApp</span>
                                                    <span className="font-medium text-[#1a1209]">{order.whatsapp.startsWith('+') ? order.whatsapp : (order.whatsapp.startsWith('91') || order.whatsapp.startsWith('977') ? '+' + order.whatsapp : '+91 ' + order.whatsapp)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {order.address && (
                                            <div className="pt-4 border-t border-gray-100">
                                                <h4 className="text-xs font-semibold text-[#1a1209] mb-1">Prasad Delivery Address</h4>
                                                <p className="text-sm text-[#6b5b45]">{order.address}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Price Breakdown */}
                                <div className="bg-white border border-[#f0dcc8] rounded-2xl p-6 shadow-card h-fit">
                                    <h3 className="font-display font-semibold text-[#1a1209] mb-4">Payment Summary</h3>
                                    <div className="space-y-3">
                                        {(order.poojaAmount > 0 || (order.isDonation && !order.chadhavaItems?.length)) && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-[#6b5b45]">
                                                    {order.isDonation ? "Direct Donation" : `Base Pooja (${order.qty} Person${order.qty > 1 ? 's' : ''})`}
                                                </span>
                                                <span className="font-medium text-[#1a1209]">
                                                    {formatCurrency(currency === "USD" ? convertINRtoUSD(order.poojaAmount) : order.poojaAmount, currency)}
                                                </span>
                                            </div>
                                        )}

                                        {order.extraDonation > 0 && order.chadhavaItems && order.chadhavaItems.length > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-[#6b5b45]">Direct Donation</span>
                                                <span className="font-medium text-[#1a1209]">
                                                    {formatCurrency(currency === "USD" ? convertINRtoUSD(order.extraDonation) : order.extraDonation, currency)}
                                                </span>
                                            </div>
                                        )}

                                        {order.chadhavaItems?.map((item, idx) => (
                                            <div key={idx} className="flex justify-between text-sm">
                                                <span className="text-[#6b5b45] pl-2 border-l-2 border-[#ff7f0a]/30">
                                                    {item.emoji} {item.name}
                                                </span>
                                                <span className="font-medium text-[#1a1209]">
                                                    {formatCurrency(currency === "USD" ? convertINRtoUSD(item.price, exchangeRate) : item.price, currency)}
                                                </span>
                                            </div>
                                        ))}

                                        <div className="pt-4 mt-2 border-t border-[#f0dcc8]">
                                            <div className="flex justify-between items-center text-lg font-bold text-[#1a1209]">
                                                <span>Total Paid</span>
                                                <span className="text-[#ff7f0a]">
                                                    {formatCurrency(currency === "USD" ? convertINRtoUSD(order.totalAmount, exchangeRate) : order.totalAmount, currency)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>

                            {/* Review Section */}
                            {order.orderStatus === 'completed' && user && order.poojaId && order.templeId && (
                                <section id="review-section" className="mt-8 border-t border-[#f0dcc8] pt-8">
                                    <ReviewForm
                                        orderId={order._id}
                                        userId={user._id}
                                        poojaId={order.poojaId._id}
                                        templeId={order.templeId._id}
                                        poojaName={order.poojaId.name}
                                        existingReview={review}
                                    />
                                </section>
                            )}

                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    )
}