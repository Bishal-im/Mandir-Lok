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
  };
  templeId: {
    name: string;
    city: string;
    state: string;
  };
  isDonation: boolean;
}

function BookingSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    fetch(`/api/orders/${orderId}`)
      .then((r) => r.json())
      .then((data) => {
        // Handle all API response shapes: { order } or { data } or { success, data } or the object itself
        const found = data.order || data.data || (data._id ? data : null);
        setOrder(found);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [orderId]);

  const copyBookingId = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.bookingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!order) return;
    const text =
      `🛕 My pooja is booked!\n\n` +
      `Pooja: ${order.poojaId?.name}\n` +
      `Temple: ${order.templeId?.name}\n` +
      `Date: ${new Date(order.bookingDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}\n` +
      `Booking ID: ${order.bookingId}\n\n` +
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
    if (!order) return;

    const certificateHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Donation Certificate — ${order.bookingId}</title>
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
    
    <div class="name">${order.sankalpName}</div>
    
    <div class="content">
      For their generous donation of <strong>₹${order.totalAmount.toLocaleString()}</strong> towards<br/>
      <strong>${order.poojaId?.name || "Sacred Offering"}</strong> at <strong>${order.templeId?.name}</strong>.<br/>
      Your contribution supports the divine service and maintenance of the sacred temple.
    </div>

    <div class="stamp">
      <span>MANDIRLOK</span>
      <span>OFFICIAL</span>
      <span>SEAL</span>
    </div>
    
    <div class="details">
      <div>REGISTRATION ID: ${order.bookingId}</div>
      <div>DATE: ${new Date(order.createdAt).toLocaleDateString("en-IN", { day: '2-digit', month: 'long', year: 'numeric' })}</div>
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
    if (!order) return;

    // Build receipt HTML content
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
        <div class="id">${order.bookingId}</div>
      </div>

        <div class="section-title">${order.poojaId ? "Pooja Details" : "Donation Details"}</div>
        <div class="row">
          <span class="key">${order.poojaId ? "Pooja" : "Seva"}</span>
          <span class="val">${order.poojaId?.emoji || "🙏"} ${order.poojaId?.name || "Sacred Temple Support"}</span>
        </div>
        <div class="row">
          <span class="key">Temple</span>
          <span class="val">🛕 ${order.templeId?.name || "—"}</span>
        </div>
        <div class="row">
          <span class="key">Location</span>
          <span class="val">${order.templeId?.city || ""}, ${order.templeId?.state || ""}</span>
        </div>
        <div class="row">
          <span class="key">Booked Date</span>
          <span class="val">${new Date(order.bookingDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
        </div>
        <div class="row">
          <span class="key">Deity</span>
          <span class="val">${order.poojaId?.deity || "—"}</span>
        </div>
        <div class="row">
          <span class="key">Duration</span>
          <span class="val">${order.poojaId?.duration || "—"}</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Sankalp Details</div>
        <div class="row">
          <span class="key">Name</span>
          <span class="val">${order.sankalpName}</span>
        </div>
        <div class="row">
          <span class="key">Gotra</span>
          <span class="val">${order.gotra || "—"}</span>
        </div>
        <div class="row">
          <span class="key">Phone</span>
          <span class="val">+${order.phone}</span>
        </div>
        <div class="row">
          <span class="key">WhatsApp</span>
          <span class="val">+${order.whatsapp}</span>
        </div>
        ${order.sankalp ? `<div class="row"><span class="key">Sankalp</span><span class="val" style="max-width:260px">${order.sankalp}</span></div>` : ""}
        <div class="row">
          <span class="key">Devotees</span>
          <span class="val">${order.qty}</span>
        </div>
      </div>

      ${order.chadhavaItems?.length > 0
        ? `
      <div class="section">
        <div class="section-title">Chadhava Items</div>
        ${order.chadhavaItems
          .map(
            (item) => `
          <div class="chadhava-item">
            <span>${item.emoji}</span>
            <span style="flex:1">${item.name} ${item.quantity > 1 ? `(x${item.quantity})` : ""}</span>
            <span style="font-weight:600">₹${(item.price * (item.quantity || 1)).toLocaleString()}</span>
          </div>
        `,
          )
          .join("")}
      </div>`
        : ""
      }

      <div class="section">
        <div class="section-title">Payment Summary</div>
        <div class="price-row">
          <span style="color:#6b7280">Pooja Amount</span>
          <span>₹${order.poojaAmount.toLocaleString("en-IN")}</span>
        </div>
        ${order.chadhavaAmount > 0
        ? `
        <div class="price-row">
          <span style="color:#6b7280">Chadhava Amount</span>
          <span>₹${order.chadhavaAmount.toLocaleString("en-IN")}</span>
        </div>`
        : ""
      }
        ${order.extraDonation > 0
        ? `
        <div class="price-row">
          <span style="color:#6b7280">Additional Donation</span>
          <span>₹${order.extraDonation.toLocaleString("en-IN")}</span>
        </div>`
        : ""
      }
        <div class="total-row">
          <span>Total Paid</span>
          <span>₹${order.totalAmount.toLocaleString("en-IN")}</span>
        </div>
        <div style="text-align:right;margin-top:8px">
          <span class="status-paid">✅ Payment Successful</span>
        </div>
      </div>

      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:14px 16px;font-size:13px;color:#1e40af;line-height:1.7">
        📱 <strong>Next steps:</strong> ${order.isDonation ? `Your contribution has been received by *${order.templeId?.name}*. You can now download your certificate of devotion.` : `Your pandit will be assigned shortly. You will receive pooja video and confirmation on your WhatsApp number <strong>+${order.whatsapp}</strong> after the pooja is completed.`}
      </div>

    </div>
    <div class="footer">
      <p>
        Booking Date: ${new Date(order.createdAt).toLocaleString("en-IN")}<br/>
        For support: support@mandirlok.com | +91 98765 43210<br/>
        This is a computer-generated receipt. 🙏 Jai Shree Ram
      </p>
    </div>
  </div>
</body>
</html>`;

    // Open in new tab and trigger print (browser prints as PDF)
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

  if (!order) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">😕</p>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Booking not found
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            We couldn't find your booking details.
          </p>
          <Link href="/dashboard" className="btn-primary text-sm">
            Go to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-gray-50 py-10 px-4">
      <div className="max-w-xl mx-auto">
        {/* Success header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={44} className="text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Booking Confirmed! 🙏
          </h1>
          <p className="text-gray-500 text-sm mt-2 max-w-xs mx-auto">
            {order.isDonation
              ? "Your contribution has been received. You can now download your donation certificate below."
              : "Your pooja has been booked. Video will be sent to your WhatsApp after the pooja."
            }
          </p>
        </div>

        {/* Booking ID card */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-5 text-white text-center mb-4">
          <p className="text-xs font-semibold opacity-75 uppercase tracking-widest mb-1">
            Booking ID
          </p>
          <div className="flex items-center justify-center gap-3">
            <p className="text-2xl font-black tracking-widest">
              {order.bookingId}
            </p>
            <button
              onClick={copyBookingId}
              className="bg-white/20 hover:bg-white/30 p-1.5 rounded-lg transition"
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
            </button>
          </div>
          <p className="text-xs opacity-75 mt-2">
            Save this for future reference
          </p>
        </div>

        {/* Main card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
          {/* Pooja info */}
          <div className="p-5 border-b border-gray-50">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-3">
              {order.poojaId ? "Pooja Details" : "Donation Details"}
            </p>
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-2xl shrink-0">
                {order.poojaId?.emoji || "🙏"}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900">
                  {order.poojaId?.name || "Sacred Temple Support"}
                </h3>
                <p className="text-gray-500 text-xs flex items-center gap-1 mt-0.5">
                  <MapPin size={11} />
                  {order.templeId?.name}, {order.templeId?.city}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              {[
                {
                  icon: <Calendar size={13} className="text-orange-400" />,
                  label: order.poojaId ? "Pooja Date" : "Donation Date",
                  value: new Date(order.bookingDate).toLocaleDateString(
                    "en-IN",
                    { day: "numeric", month: "long", year: "numeric" },
                  ),
                },
                {
                  icon: <Clock size={13} className="text-orange-400" />,
                  label: "Contribution",
                  value: order.poojaId ? order.poojaId.duration : "Temple Maintenance",
                },
                {
                  icon: <Phone size={13} className="text-orange-400" />,
                  label: "WhatsApp",
                  value: `+${order.whatsapp}`,
                },
                {
                  icon: <span className="text-orange-400 text-xs">🕉️</span>,
                  label: "Sankalp Name",
                  value: order.sankalpName,
                },
              ].map((item, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                    {item.icon}
                    <span className="text-[10px] uppercase tracking-wide font-semibold">
                      {item.label}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Chadhava items */}
          {order.chadhavaItems?.length > 0 && (
            <div className="p-5 border-b border-gray-50">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-3">
                Chadhava Items
              </p>
              <div className="space-y-2">
                {order.chadhavaItems.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>
                      {item.emoji} {item.name}
                      {item.quantity > 1 && (
                        <span className="ml-1.5 text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-md font-bold ring-1 ring-amber-100">
                          x{item.quantity}
                        </span>
                      )}
                    </span>
                    <span className="font-semibold text-gray-700">
                      ₹{(item.price * (item.quantity || 1)).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-5">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-3">
              Payment Summary
            </p>
            <div className="space-y-2 text-sm">
              {order.poojaAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Pooja Amount</span>
                  <span>₹{order.poojaAmount.toLocaleString("en-IN")}</span>
                </div>
              )}

              {order.chadhavaAmount > 0 && (
                <div className="flex justify-between text-gray-500">
                  <span>Chadhava</span>
                  <span>₹{order.chadhavaAmount.toLocaleString("en-IN")}</span>
                </div>
              )}

              {order.extraDonation > 0 && (
                <div className="flex justify-between text-amber-600 font-bold">
                  <span>Additional Donation</span>
                  <span>₹{order.extraDonation.toLocaleString("en-IN")}</span>
                </div>
              )}

              <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-100">
                <span>Total Paid</span>
                <span className="text-orange-500">
                  ₹{order.totalAmount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-3 inline-flex items-center gap-1.5 bg-green-50 text-green-600 text-xs font-semibold px-3 py-1.5 rounded-full">
            <CheckCircle2 size={12} />
            Payment Successful
          </div>
        </div>

        {/* Next steps notice */}
        <div className={`rounded-xl p-4 mb-6 text-sm ${order.isDonation ? 'bg-amber-50 border border-amber-100 text-amber-900' : 'bg-blue-50 border border-blue-100 text-blue-700'}`}>
          <strong>📱 What happens next?</strong>
          <ul className={`mt-1.5 space-y-1 text-xs leading-relaxed list-disc list-inside ${order.isDonation ? 'text-amber-800' : 'text-blue-600'}`}>
            {order.isDonation ? (
              <>
                <li>Your donation is directly credited to the temple</li>
                <li>Download your digital certificate for your records</li>
                <li>Stay blessed for your meritorious contribution</li>
              </>
            ) : (
              <>
                <li>A pandit will be assigned to your pooja</li>
                <li>You'll receive a WhatsApp update at +{order.whatsapp}</li>
                <li>Pooja video will be sent after completion</li>
              </>
            )}
          </ul>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={order.isDonation ? handleDownloadCertificate : handleDownloadReceipt}
            className={`flex items-center justify-center gap-2 bg-white border font-semibold text-sm py-3 rounded-xl transition ${order.isDonation ? 'border-amber-200 text-amber-700 hover:bg-amber-50' : 'border-gray-200 text-gray-700 hover:border-orange-300 hover:text-orange-500'}`}
          >
            {order.isDonation ? (
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
            Share {order.isDonation ? 'Donation' : 'Booking'}
          </button>
        </div>

        {/* Nav buttons */}
        <div className="flex flex-col gap-3">
          <Link
            href={`/bookings/${order._id}`}
            className="btn-primary w-full justify-center text-sm py-3"
          >
            Track My Booking <ArrowRight size={16} />
          </Link>
          <Link
            href="/dashboard"
            className="btn-outline w-full justify-center text-sm py-3"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </main >
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
