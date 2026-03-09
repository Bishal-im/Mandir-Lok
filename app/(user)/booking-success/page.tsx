"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Download,
  Share2,
  ArrowRight,
  Calendar,
  Phone,
  MapPin,
  Clock,
  Copy,
  Check,
} from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { formatCurrency, convertINRtoUSD } from "@/lib/currency";

interface Order {
  _id: string;
  bookingId: string;
  orderStatus: string;
  paymentStatus: string;
  bookingDate: string;
  sankalpName: string;
  gotra: string;
  phone: string;
  whatsapp: string;
  poojaAmount: number;
  chadhavaAmount: number;
  extraDonation: number;
  totalAmount: number;
  qty: number;
  sankalp: string;
  chadhavaItems: { name: string; emoji: string; price: number; quantity: number }[];
  createdAt: string;
  poojaId: {
    name: string;
    emoji: string;
    duration: string;
    deity: string;
    images?: string[];
  };
  templeId: {
    name: string;
    city: string;
    state: string;
  };
  isDonation: boolean;
  poojaImage?: string;
  packageSelected?: {
    name: string;
    price: number;
  };
}

function BookingSuccessContent() {
  const { currency, exchangeRate } = useCurrency();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const orderIds = searchParams.get("orderIds");

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const ids = orderIds ? orderIds.split(",") : orderId ? [orderId] : [];
    if (ids.length === 0) {
      setLoading(false);
      return;
    }

    Promise.all(
      ids.map(id =>
        fetch(`/api/orders/${id}`)
          .then(r => r.json())
          .then(data => data.order || data.data || (data._id ? data : null))
      )
    ).then(results => {
      setOrders(results.filter(Boolean));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [orderId, orderIds]);

  const mainOrder = orders[0];


  const copyBookingId = () => {
    if (!mainOrder) return;
    navigator.clipboard.writeText(mainOrder.bookingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (orders.length === 0 || !mainOrder) return;
    const poojaNames = orders.map((o) => o.poojaId?.name).join(", ");
    const text =
      `🛕 My poojas are booked!\n\n` +
      `Poojas: ${poojaNames}\n` +
      `Temple: ${mainOrder.templeId?.name}\n` +
      `Date: ${new Date(mainOrder.bookingDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}\n` +
      `Booking ID: ${mainOrder.bookingId}\n\n` +
      `Booked via Mandirlok 🙏`;

    if (navigator.share) {
      try {
        await navigator.share({ title: "My Pooja Booking", text });
      } catch { }
    } else {
      navigator.clipboard.writeText(text);
      alert("Booking details copied to clipboard!");
    }
  };

  const handleDownloadCertificate = () => {
    if (!mainOrder) return;

    const certificateHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Donation Certificate — ${mainOrder.bookingId}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Great+Vibes&family=Inter:wght@400;600&display=swap');
    
    body { 
      margin: 0; 
      padding: 40px; 
      background: #fdfdfd; 
      font-family: 'Inter', sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }

    .certificate {
      width: 800px;
      height: 580px;
      background: white;
      border: 20px solid #c5a059;
      position: relative;
      padding: 40px;
      box-shadow: 0 0 50px rgba(0,0,0,0.1);
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      box-sizing: border-box;
    }

    .certificate::before {
      content: "";
      position: absolute;
      top: 5px; left: 5px; right: 5px; bottom: 5px;
      border: 2px solid #c5a059;
      pointer-events: none;
    }

    .corner {
      position: absolute;
      width: 80px;
      height: 80px;
      border: 4px solid #c5a059;
    }

    .tl { top: -10px; left: -10px; border-right: none; border-bottom: none; }
    .tr { top: -10px; right: -10px; border-left: none; border-bottom: none; }
    .bl { bottom: -10px; left: -10px; border-right: none; border-top: none; }
    .br { bottom: -10px; right: -10px; border-left: none; border-top: none; }

    .logo {
      font-family: 'Cinzel', serif;
      font-size: 32px;
      font-weight: 900;
      color: #b45309;
      margin-bottom: 30px;
      letter-spacing: 4px;
    }

    .title {
      font-family: 'Cinzel', serif;
      font-size: 42px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 2px;
    }

    .subtitle {
      font-size: 16px;
      color: #666;
      margin-bottom: 40px;
      letter-spacing: 1px;
    }

    .content {
      font-size: 18px;
      color: #333;
      line-height: 1.6;
      margin-bottom: 30px;
    }

    .name {
      font-family: 'Great Vibes', cursive;
      font-size: 48px;
      color: #b45309;
      margin: 10px 0 30px 0;
      border-bottom: 1px solid #ddd;
      display: inline-block;
      min-width: 300px;
    }

    .details {
      display: flex;
      justify-content: space-between;
      width: 100%;
      margin-top: auto;
      border-top: 1px solid #eee;
      padding-top: 20px;
      font-size: 12px;
      color: #888;
    }

    .stamp {
      position: absolute;
      bottom: 60px;
      right: 60px;
      width: 100px;
      height: 100px;
      border: 4px double #b45309;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      color: #b45309;
      font-weight: 800;
      font-size: 10px;
      transform: rotate(-15deg);
      opacity: 0.6;
    }

    @media print {
      body { padding: 0; background: white; }
      .certificate { box-shadow: none; width: 100%; border-width: 15px; }
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="corner tl"></div><div class="corner tr"></div>
    <div class="corner bl"></div><div class="corner br"></div>
    
    <div class="logo">🛕 MANDIRLOK</div>
    
    <div class="title">Certificate of Devotion</div>
    <div class="subtitle">CERTIFICATE OF MERITORIOUS DONATION</div>
    
    <div class="content">
      This certificate is proudly presented to
    </div>
    
    <div class="name">${mainOrder.sankalpName}</div>
    
    <div class="content">
      For their generous donation of <strong>${formatCurrency(currency === "USD" ? convertINRtoUSD(mainOrder.totalAmount) : mainOrder.totalAmount, currency)}</strong> towards<br/>
      <strong>${mainOrder.poojaId?.name || "Sacred Offering"}</strong> at <strong>${mainOrder.templeId?.name}</strong>.<br/>
      Your contribution supports the divine service and maintenance of the sacred temple.
    </div>

    <div class="stamp">
      <span>MANDIRLOK</span>
      <span>OFFICIAL</span>
      <span>SEAL</span>
    </div>
    
    <div class="details">
      <div>REGISTRATION ID: ${mainOrder.bookingId}</div>
      <div>DATE: ${new Date(mainOrder.createdAt).toLocaleDateString("en-IN", { day: '2-digit', month: 'long', year: 'numeric' })}</div>
      <div>VERIFIED BY: MANDIRLOK SEVA TRUST</div>
    </div>
  </div>
  <script>
    window.onload = () => {
      setTimeout(() => {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>`;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(certificateHTML);
      printWindow.document.close();
    }
  };

  const handleDownloadReceipt = () => {
    if (orders.length === 0 || !mainOrder) return;
    const totalPaid = orders.reduce((sum, o) => sum + o.totalAmount, 0);

    const receiptHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Booking Receipt — ${mainOrder.bookingId}</title>
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
    .chadhava-item { display: flex; align-items: center; gap: 8px; padding: 6px 0; font-size: 13px; border-bottom: 1px dashed #f3f4f6; }
    .footer { background: #f9fafb; padding: 20px 32px; text-align: center; border-top: 1px solid #f3f4f6; }
    .footer p { font-size: 12px; color: #9ca3af; line-height: 1.8; }
    .status-paid { display: inline-block; background: #dcfce7; color: #16a34a; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 999px; }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <h1>🛕 Mandirlok</h1>
      <p>Online Pooja & Temple Booking Platform</p>
      <div class="badge">✅ BOOKING CONFIRMED</div>
    </div>
    <div class="body">

      <div class="booking-id-box">
        <div class="label">Booking Reference ID</div>
        <div class="id">${mainOrder.bookingId}</div>
      </div>

      <div class="section">
        <div class="section-title">Booked Poojas</div>
        ${orders
          .map(
            (o) => `
        <div class="row" style="border-bottom: 1px dashed #f3f4f6; padding: 10px 0;">
          <div style="flex:1">
            <div style="font-weight:700; color:#111827">${o.poojaId?.emoji || "🙏"} ${o.poojaId?.name}</div>
            <div style="font-size:11px; color:#6b7280">🛕 ${o.templeId?.name || "—"} • ${new Date(
              o.bookingDate
            ).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</div>
          </div>
          <div style="font-weight:700; color:#f97316">${formatCurrency(
            currency === "USD" ? convertINRtoUSD(o.totalAmount) : o.totalAmount,
            currency
          )}</div>
        </div>
        `
          )
          .join("")}
      </div>

      ${(() => {
        const items = orders.flatMap((o) => o.chadhavaItems || []);
        if (items.length === 0) return "";
        return `
      <div class="section">
        <div class="section-title">Chadhava Items</div>
        ${items
          .map(
            (item) => `
          <div class="row">
            <span class="key">${item.emoji || "✨"} ${item.name} ${
              item.quantity > 1 ? `x${item.quantity}` : ""
            }</span>
            <span class="val">${formatCurrency(
              currency === "USD" ? convertINRtoUSD(item.price * item.quantity) : item.price * item.quantity,
              currency
            )}</span>
          </div>
        `
          )
          .join("")}
      </div>`;
      })()}

      <div class="section">
        <div class="section-title">Sankalp Details</div>
        <div class="row">
          <span class="key">Name</span>
          <span class="val">${mainOrder.sankalpName}</span>
        </div>
        <div class="row">
          <span class="key">Gotra</span>
          <span class="val">${mainOrder.gotra || "—"}</span>
        </div>
        <div class="row">
          <span class="key">Phone</span>
          <span class="val">${
            mainOrder.phone.startsWith("+") ? mainOrder.phone : "+" + mainOrder.phone
          }</span>
        </div>
        <div class="row">
          <span class="key">WhatsApp</span>
          <span class="val">${
            mainOrder.whatsapp.startsWith("+") ? mainOrder.whatsapp : "+" + mainOrder.whatsapp
          }</span>
        </div>
        ${
          mainOrder.sankalp
            ? `<div class="row"><span class="key">Sankalp</span><span class="val" style="max-width:260px">${mainOrder.sankalp}</span></div>`
            : ""
        }
      </div>

      <div class="section">
        <div class="section-title">Payment Summary</div>
        <div class="total-row">
          <span>Total Paid</span>
          <span>${formatCurrency(
            currency === "USD" ? convertINRtoUSD(totalPaid) : totalPaid,
            currency
          )}</span>
        </div>
        <div style="text-align:right;margin-top:8px">
          <span class="status-paid">✅ Payment Successful</span>
        </div>
      </div>

      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:14px 16px;font-size:13px;color:#1e40af;line-height:1.7">
        📱 <strong>Next steps:</strong> ${
          mainOrder.isDonation
            ? `Your contribution has been received. You can now download your certificate of devotion.`
            : `Your pandit will be assigned shortly. You will receive pooja video and confirmation on your WhatsApp number <strong>${
                mainOrder.whatsapp.startsWith("+") ? mainOrder.whatsapp : "+" + mainOrder.whatsapp
              }</strong> after the pooja is completed.`
        }
      </div>

    </div>
    <div class="footer">
      <p>
        Booking Date: ${new Date(mainOrder.createdAt).toLocaleString("en-IN")}<br/>
        For support: support@mandirlok.com | +91 98765 43210<br/>
        This is a computer-generated receipt. 🙏 Jai Shree Ram
      </p>
    </div>
  </div>
</body>
</html>`;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(receiptHTML);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading your booking...</p>
        </div>
      </main>
    );
  }

  if (orders.length === 0 || !mainOrder) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">😕</p>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Booking not found</h2>
          <p className="text-gray-500 text-sm mb-6">We couldn't find your booking details.</p>
          <Link href="/dashboard" className="btn-primary text-sm">
            Go to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  const totalPaidAmount = orders.reduce((s, o) => s + o.totalAmount, 0);

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-gray-50 py-10 px-4">
      <div className="max-w-xl mx-auto">
        {/* Success header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={44} className="text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Booking Confirmed! 🙏</h1>
          <p className="text-gray-500 text-sm mt-2 max-w-xs mx-auto">
            {mainOrder.isDonation
              ? "Your contribution has been received. You can now download your donation certificate below."
              : "Your pooja has been booked. Video will be sent to your WhatsApp after the pooja."}
          </p>
        </div>

        {/* Booking ID card */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-5 text-white text-center mb-4">
          <p className="text-xs font-semibold opacity-75 uppercase tracking-widest mb-1">
            Booking ID
          </p>
          <div className="flex items-center justify-center gap-3">
            <p className="text-2xl font-black tracking-widest">{mainOrder.bookingId}</p>
            <button
              onClick={copyBookingId}
              className="bg-white/20 hover:bg-white/30 p-1.5 rounded-lg transition"
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
            </button>
          </div>
          <p className="text-xs opacity-75 mt-2">Save this for future reference</p>
        </div>

        {/* Main card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
          <div className="p-5 border-b border-gray-50">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-3">
              Booked Poojas
            </p>
            <div className="space-y-4">
              {orders.map((o) => (
                <div
                  key={o._id}
                  className="flex items-start gap-4 pb-4 last:pb-0 border-b last:border-0 border-gray-50"
                >
                  <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-2xl shrink-0 overflow-hidden">
                    {o.poojaImage ? (
                      <img
                        src={o.poojaImage}
                        alt={o.poojaId?.name}
                        className="w-full h-full object-cover"
                      />
                    ) : o.poojaId?.images?.[0] ? (
                      <img
                        src={o.poojaId.images[0]}
                        alt={o.poojaId?.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      o.poojaId?.emoji || "🙏"
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm">{o.poojaId?.name}</h3>
                    <p className="text-gray-500 text-[10px] flex items-center gap-1 mt-0.5">
                      <MapPin size={10} />
                      {o.templeId?.name} •{" "}
                      {new Date(o.bookingDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[10px] font-bold text-orange-500">
                        {o.packageSelected?.name || "Standard Package"}
                      </span>
                      <span className="font-bold text-gray-800 text-sm">
                        {formatCurrency(
                          currency === "USD"
                            ? convertINRtoUSD(o.totalAmount, exchangeRate)
                            : o.totalAmount,
                          currency
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 bg-gray-50/50">
            <div className="flex justify-between items-center font-bold text-base">
              <span className="text-gray-500">Total Paid</span>
              <span className="text-orange-500 text-xl">
                {formatCurrency(
                  currency === "USD"
                    ? convertINRtoUSD(totalPaidAmount, exchangeRate)
                    : totalPaidAmount,
                  currency
                )}
              </span>
            </div>
            <div className="mt-3 inline-flex items-center gap-1.5 bg-green-50 text-green-600 text-xs font-semibold px-3 py-1.5 rounded-full">
              <CheckCircle2 size={12} />
              Payment Successful
            </div>
          </div>
        </div>

        {/* Sankalp Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-4">
            Sankalp Details
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-[10px] text-gray-400 uppercase font-bold">Devotee Name</p>
              <p className="text-sm font-bold text-gray-800">{mainOrder.sankalpName}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-gray-400 uppercase font-bold">Gotra</p>
              <p className="text-sm font-bold text-gray-800">{mainOrder.gotra || "—"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-gray-400 uppercase font-bold">WhatsApp</p>
              <p className="text-sm font-bold text-gray-800">
                {mainOrder.whatsapp.startsWith("+") ? mainOrder.whatsapp : "+" + mainOrder.whatsapp}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-gray-400 uppercase font-bold">Sankalp</p>
              <p className="text-sm font-bold text-gray-800 truncate">{mainOrder.sankalp || "—"}</p>
            </div>
          </div>
        </div>

        {/* Next steps notice */}
        <div
          className={`rounded-xl p-4 mb-6 text-sm ${
            mainOrder.isDonation
              ? "bg-amber-50 border border-amber-100 text-amber-900"
              : "bg-blue-50 border border-blue-100 text-blue-700"
          }`}
        >
          <strong>📱 What happens next?</strong>
          <ul
            className={`mt-1.5 space-y-1 text-xs leading-relaxed list-disc list-inside ${
              mainOrder.isDonation ? "text-amber-800" : "text-blue-600"
            }`}
          >
            {mainOrder.isDonation ? (
              <>
                <li>Your donation is directly credited to the temple</li>
                <li>Download your digital certificate for your records</li>
                <li>Stay blessed for your meritorious contribution</li>
              </>
            ) : (
              <>
                <li>Pandits will be assigned to your poojas</li>
                <li>
                  You'll receive WhatsApp updates at{" "}
                  {mainOrder.whatsapp.startsWith("+")
                    ? mainOrder.whatsapp
                    : "+" + mainOrder.whatsapp}
                </li>
                <li>Pooja videos will be sent after completion</li>
              </>
            )}
          </ul>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={mainOrder.isDonation ? handleDownloadCertificate : handleDownloadReceipt}
            className={`flex items-center justify-center gap-2 bg-white border font-semibold text-sm py-3 rounded-xl transition ${
              mainOrder.isDonation
                ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                : "border-gray-200 text-gray-700 hover:border-orange-300 hover:text-orange-500"
            }`}
          >
            {mainOrder.isDonation ? (
              <>
                <Download size={16} />
                Get Certificate
              </>
            ) : (
              <>
                <Download size={16} />
                Download Receipt
              </>
            )}
          </button>
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 font-semibold text-sm py-3 rounded-xl hover:border-orange-300 hover:text-orange-500 transition"
          >
            <Share2 size={16} />
            Share {mainOrder.isDonation ? "Donation" : "Booking"}
          </button>
        </div>

        {/* Nav buttons */}
        <div className="flex flex-col gap-3">
          <Link
            href={`/bookings/${mainOrder._id}`}
            className="btn-primary w-full justify-center text-sm py-3"
          >
            Track My Booking <ArrowRight size={16} />
          </Link>
          <Link href="/dashboard" className="btn-outline w-full justify-center text-sm py-3">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <BookingSuccessContent />
    </Suspense>
  );
}
