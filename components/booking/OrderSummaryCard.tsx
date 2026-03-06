"use client";

import { Shield, Calendar, Clock } from "lucide-react";

interface OrderItem {
  label: string;
  price: number;
}

interface OrderSummaryCardProps {
  poojaName: string;
  templeNam: string;
  emoji: string;
  basePrice: number;
  addOns?: OrderItem[];
  selectedDate?: Date | null;
  qty?: number;
  onProceed?: () => void;
  proceedLabel?: string;
  disabled?: boolean;
}

export default function OrderSummaryCard({
  poojaName,
  templeNam,
  emoji,
  basePrice,
  addOns = [],
  selectedDate,
  qty = 1,
  onProceed,
  proceedLabel = "Proceed to Pay",
  disabled = false,
}: OrderSummaryCardProps) {
  const addOnsTotal = addOns.reduce((s, a) => s + a.price, 0);
  const subtotal = (basePrice + addOnsTotal) * qty;
  const gst = 0; // temple services are tax-exempt
  const total = subtotal + gst;

  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="bg-white border border-[#f0dcc8] rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.06)] sticky top-24">
      <h3 className="font-display font-semibold text-[#1a1209] mb-4 pb-3 border-b border-[#f0dcc8]">
        Order Summary
      </h3>

      {/* ── Pooja Item ── */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 bg-[#fff8f0] rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
          {emoji}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-[#1a1209] text-sm leading-snug">
            {poojaName}
          </p>
          <p className="text-xs text-[#ff7f0a] mt-0.5">🛕 {templeNam}</p>
          {selectedDate && (
            <p className="text-xs text-[#6b5b45] mt-1 flex items-center gap-1">
              <Calendar size={10} /> {formatDate(selectedDate)}
            </p>
          )}
        </div>
      </div>

      {/* ── Price Breakdown ── */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-[#6b5b45]">
            {poojaName} {qty > 1 && `× ${qty}`}
          </span>
          <span className="text-[#1a1209]">
            ₹{(basePrice * qty).toLocaleString()}
          </span>
        </div>

        {addOns.map((a) => (
          <div key={a.label} className="flex justify-between text-sm">
            <span className="text-[#6b5b45]">🌸 {a.label}</span>
            <span className="text-[#1a1209]">₹{a.price}</span>
          </div>
        ))}

        <div className="flex justify-between text-sm text-green-600">
          <span>Platform Discount</span>
          <span>₹0</span>
        </div>
      </div>

      {/* ── Total ── */}
      <div className="border-t border-[#f0dcc8] pt-3 mb-4">
        <div className="flex justify-between items-baseline">
          <span className="font-bold text-[#1a1209]">Total Payable</span>
          <span className="text-xl font-bold text-[#ff7f0a]">
            ₹{total.toLocaleString()}
          </span>
        </div>
        <p className="text-[10px] text-[#6b5b45] mt-0.5">
          Inclusive of all charges · No hidden fees
        </p>
      </div>

      {/* ── Date Warning ── */}
      {!selectedDate && (
        <div className="bg-[#fff8f0] border border-[#ffd9a8] rounded-xl p-3 mb-4 text-xs text-[#ff7f0a] text-center">
          ⬆️ Please select a pooja date to proceed
        </div>
      )}

      {/* ── CTA ── */}
      <button
        onClick={onProceed}
        disabled={disabled || !selectedDate}
        className="w-full bg-gradient-to-r from-[#ff7f0a] to-[#ff9b30] text-white font-semibold text-sm py-3 rounded-xl shadow-[0_4px_15px_rgba(255,127,10,0.3)] hover:shadow-[0_6px_25px_rgba(255,127,10,0.45)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none mb-3"
      >
        {proceedLabel} →
      </button>

      {/* ── Trust ── */}
      <div className="text-center text-[10px] text-[#6b5b45] flex items-center justify-center gap-1 mb-3">
        <Shield size={11} className="text-green-500" />
        100% Secured via Cashfree Encryption
      </div>

      <div className="space-y-1.5 pt-3 border-t border-[#f0dcc8]">
        {[
          "📹 HD Pooja video on WhatsApp",
          "🧘 Verified experienced pandit",
          "↩️ Full refund if cancelled 24h before",
        ].map((t) => (
          <p key={t} className="text-[10px] text-[#6b5b45]">
            {t}
          </p>
        ))}
      </div>
    </div>
  );
}
