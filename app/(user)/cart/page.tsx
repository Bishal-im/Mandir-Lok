"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ChevronRight, Shield, Loader2, Heart, Sparkles, MapPin, Calendar, ArrowRight } from "lucide-react";
import { useCart, CartItem } from "@/context/CartContext";

// ── Cashfree types ─────────────────────────────────────────────────────────────
declare global {
  interface Window {
    Cashfree: any;
  }
}

function loadCashfreeScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Cashfree) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const COUNTRIES = [
  { name: "India", code: "91", flag: "" },
  { name: "Nepal", code: "977", flag: "" },
  { name: "USA", code: "1", flag: "" },
  { name: "UK", code: "44", flag: "" },
  { name: "Canada", code: "1", flag: "" },
  { name: "Australia", code: "61", flag: "" },
  { name: "UAE", code: "971", flag: "" },
  { name: "Singapore", code: "65", flag: "" },
  { name: "Malaysia", code: "60", flag: "" },
  { name: "Mauritius", code: "230", flag: "" },
  { name: "Fiji", code: "679", flag: "" },
  { name: "South Africa", code: "27", flag: "" },
  { name: "Germany", code: "49", flag: "" },
  { name: "France", code: "33", flag: "" },
  { name: "Guyana", code: "592", flag: "" },
  { name: "Suriname", code: "597", flag: "" },
  { name: "Trinidad", code: "1", flag: "" },
  { name: "Sri Lanka", code: "94", flag: "" },
  { name: "Bangladesh", code: "880", flag: "" },
  { name: "Indonesia", code: "62", flag: "" },
];

function CartContent() {
  const router = useRouter();
  const { cart, removeFromCart, clearCart, cartCount, toggleSelectItem, addToCart } = useCart();

  const [loadingConfig, setLoadingConfig] = useState(false);
  const [form, setForm] = useState({
    name: "",
    gotra: "",
    dob: "",
    phone: "",
    sankalp: "",
    whatsapp: "",
    address: "",
  });
  const [countryCode, setCountryCode] = useState("91");
  const [whatsappCountryCode, setWhatsappCountryCode] = useState("91");
  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [step, setStep] = useState<1 | 2>(1);
  const [paying, setPaying] = useState(false);
  const searchParams = useSearchParams();
  const [loadingParam, setLoadingParam] = useState(false);

  // Handle direct "Proceed to Book" parameters
  useEffect(() => {
    const poojaId = searchParams.get("poojaId");
    const templeId = searchParams.get("templeId");
    const date = searchParams.get("date");
    const packageIndexStr = searchParams.get("packageIndex");
    const offeringsStr = searchParams.get("offerings");

    if (poojaId && templeId && date && !loadingParam) {
      // Check if already in cart to avoid duplicates
      const exists = cart.find(item =>
        item.poojaId === poojaId &&
        item.templeId === templeId &&
        item.date === date
      );

      if (!exists) {
        setLoadingParam(true);
        fetch(`/api/poojas/${poojaId}`)
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              const pooja = data.data.pooja;
              const packageIndex = packageIndexStr ? parseInt(packageIndexStr) : 0;
              const pkg = pooja.packages[packageIndex];

              const selectedOfferingIds = offeringsStr ? offeringsStr.split(",") : [];
              const allOfferings = data.data.chadhavaItems || [];
              const selectedOfferingItems = allOfferings
                .filter((o: any) => selectedOfferingIds.includes(o._id))
                .map((o: any) => ({
                  id: o._id,
                  name: o.name,
                  price: o.price,
                  emoji: o.emoji || "🙏",
                  quantity: 1
                }));

              addToCart({
                poojaId: pooja._id,
                poojaName: pooja.name,
                poojaEmoji: pooja.emoji || "🪔",
                poojaImage: pooja.images?.[0] || "",
                templeId,
                templeName: pooja.templeIds.find((t: any) => t?._id === templeId)?.name ||
                  pooja.templeId?.name || "Temple",
                date,
                packageIndex,
                packageName: pkg.name,
                packagePrice: pkg.price,
                offeringIds: selectedOfferingIds,
                offerings: selectedOfferingItems,
                totalPrice: pkg.price + selectedOfferingItems.reduce((sum: number, o: any) => sum + o.price, 0)
              });
            }
          })
          .finally(() => setLoadingParam(false));
      }
    }
  }, [searchParams, cart, addToCart, loadingParam]);

  const [payError, setPayError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const selectedItems = cart.filter(item => item.selected);
  const isStep1Valid = form.name && form.phone && form.whatsapp && selectedItems.length > 0;

  const totalAmount = selectedItems.reduce((sum: number, item: CartItem) => sum + item.totalPrice, 0);

  const handlePay = async () => {
    setPayError("");
    setPaying(true);

    try {
      const loaded = await loadCashfreeScript();
      if (!loaded) throw new Error("Could not load Cashfree SDK.");

      // For bulk checkout, we pass only selected items.
      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isBulk: true,
          amount: totalAmount,
          phone: `+${countryCode}${form.phone}`,
          name: form.name,
          selectedItemIds: selectedItems.map(i => i.id) // Pass selected IDs to sync logic in verify
        }),
      });
      const orderData = await orderRes.json();
      if (!orderData.success) throw new Error(orderData.message || "Failed to create payment order");

      const { payment_session_id, order_id } = orderData.data;

      const cashfree = window.Cashfree({
        mode: process.env.NEXT_PUBLIC_CASHFREE_ENV === "PRODUCTION" ? "production" : "sandbox",
      });

      await cashfree.checkout({
        paymentSessionId: payment_session_id,
        returnUrl: `${window.location.origin}/api/payment/verify?order_id=${order_id}&isBulk=true&sankalpName=${encodeURIComponent(form.name)}&gotra=${encodeURIComponent(form.gotra)}&dob=${form.dob}&phone=${encodeURIComponent('+' + countryCode + form.phone)}&whatsapp=${encodeURIComponent('+' + (sameAsPhone ? countryCode : whatsappCountryCode) + form.whatsapp)}&sankalp=${encodeURIComponent(form.sankalp)}&address=${encodeURIComponent(form.address)}&selectedItemIds=${encodeURIComponent(selectedItems.map(i => i.id).join(","))}`,
      });

    } catch (err: any) {
      if (err.message !== "Payment cancelled") setPayError(err.message || "Something went wrong");
    } finally {
      setPaying(false);
    }
  };

  if (cartCount === 0 && step === 1) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-4">
          <Sparkles className="text-[#ff7f0a]" size={40} />
        </div>
        <h2 className="heading-md mb-2">Your cart is empty</h2>
        <p className="text-[#6b5b45] mb-6 max-w-sm">Add some sacred poojas to your cart to begin your spiritual journey.</p>
        <Link href="/poojas" className="btn-saffron px-8 py-3 rounded-xl text-sm font-bold shadow-lg">
          Explore Poojas
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="container-app py-8">
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-0 mb-8 max-w-md mx-auto">
          {["Sankalp Details", "Payment"].map((label, i) => (
            <div key={label} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step > i + 1
                    ? "bg-green-500 text-white"
                    : step === i + 1
                      ? "bg-[#ff7f0a] text-white"
                      : "bg-[#f0dcc8] text-[#6b5b45]"
                    }`}
                >
                  {step > i + 1 ? "✓" : i + 1}
                </div>
                <p className={`text-xs mt-1 ${step === i + 1 ? "text-[#ff7f0a] font-semibold" : "text-[#6b5b45]"}`}>
                  {label}
                </p>
              </div>
              {i < 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${step > 1 ? "bg-green-400" : "bg-[#f0dcc8]"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Cart Items List */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="heading-md text-[#1a1209]">Items in Cart ({cartCount})</h2>
                  <button onClick={clearCart} className="text-xs text-red-500 hover:text-red-600 font-medium">Clear All</button>
                </div>
                {cart.map((item) => (
                  <div key={item.id} className="bg-white border border-[#f0dcc8] rounded-2xl p-4 shadow-card flex gap-4 transition-all hover:border-[#ff7f0a]/30 group relative">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={() => toggleSelectItem(item.id)}
                        className="w-5 h-5 accent-[#ff7f0a] cursor-pointer"
                      />
                    </div>
                    <div className="w-16 h-16 bg-[#fff8f0] rounded-xl flex items-center justify-center text-3xl group-hover:scale-105 transition-transform shrink-0 overflow-hidden">
                      {item.poojaImage ? (
                        <img src={item.poojaImage} alt={item.poojaName} className="w-full h-full object-cover" />
                      ) : (
                        item.poojaEmoji
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-[#1a1209] truncate">{item.poojaName}</h3>
                        <p className="font-bold text-[#ff7f0a] ml-2">₹{item.totalPrice.toLocaleString()}</p>
                      </div>
                      <p className="text-xs text-[#6b5b45] flex items-center gap-1 mt-1">
                        <MapPin size={12} className="text-[#ff7f0a]" /> {item.templeName}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="text-[10px] bg-orange-50 text-[#ff7f0a] px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                          <Calendar size={10} /> {new Date(item.date).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })}
                        </span>
                        {item.packageName && (
                          <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                            {item.packageName}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      title="Remove from cart"
                    >
                      <span className="text-xl font-light">×</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {step === 1 && (
              <div className="bg-white border border-[#f0dcc8] rounded-2xl p-6 shadow-card">
                <h2 className="heading-md text-[#1a1209] mb-1">Sankalp Details</h2>
                <p className="text-xs text-[#6b5b45] mb-6">
                  These details will be used for the personalized pooja sankalp. Please fill carefully.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#6b5b45] mb-1.5 uppercase tracking-wide">
                      Full Name (for Sankalp) *
                    </label>
                    <input name="name" value={form.name} onChange={handleChange} placeholder="Enter your full name" className="input-divine" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#6b5b45] mb-1.5 uppercase tracking-wide">Gotra</label>
                    <input name="gotra" value={form.gotra} onChange={handleChange} placeholder="e.g., Kashyap, Bharadwaj" className="input-divine" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#6b5b45] mb-1.5 uppercase tracking-wide">Date of Birth</label>
                    <input type="date" name="dob" value={form.dob} onChange={handleChange} className="input-divine" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#6b5b45] mb-1.5 uppercase tracking-wide">Mobile Number *</label>
                    <div className="flex">
                      <select
                        value={countryCode}
                        onChange={(e) => {
                          setCountryCode(e.target.value);
                          if (sameAsPhone) setWhatsappCountryCode(e.target.value);
                        }}
                        className="px-2 border border-r-0 border-[#f0dcc8] rounded-l-xl text-xs text-[#6b5b45] bg-[#fdf6ee] outline-none max-w-[100px]"
                      >
                        {COUNTRIES.map((c) => (
                          <option key={`${c.name}-${c.code}`} value={c.code}>
                            {c.flag} +{c.code} ({c.name})
                          </option>
                        ))}
                      </select>
                      <input
                        name="phone"
                        value={form.phone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          setForm(f => ({ ...f, phone: val, whatsapp: sameAsPhone ? val : f.whatsapp }));
                        }}
                        placeholder="Mobile number"
                        className="flex-1 border border-[#f0dcc8] rounded-r-xl px-3 py-2 text-sm outline-none focus:border-[#ff7f0a]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#6b5b45] mb-1.5 uppercase tracking-wide">
                      WhatsApp Number * <span className="text-[#25D366]">(Video will be sent here)</span>
                    </label>
                    <div className="flex">
                      <select
                        value={sameAsPhone ? countryCode : whatsappCountryCode}
                        disabled={sameAsPhone}
                        onChange={(e) => setWhatsappCountryCode(e.target.value)}
                        className="px-2 border border-r-0 border-[#f0dcc8] rounded-l-xl text-xs text-[#6b5b45] bg-[#fdf6ee] outline-none disabled:opacity-70 max-w-[100px]"
                      >
                        {COUNTRIES.map((c) => (
                          <option key={`wa-${c.name}-${c.code}`} value={c.code}>
                            {c.flag} +{c.code}
                          </option>
                        ))}
                      </select>
                      <input
                        name="whatsapp"
                        value={form.whatsapp}
                        disabled={sameAsPhone}
                        onChange={(e) => setForm(f => ({ ...f, whatsapp: e.target.value.replace(/\D/g, '') }))}
                        placeholder="WhatsApp number"
                        className="flex-1 border border-[#f0dcc8] rounded-r-xl px-3 py-2 text-sm outline-none focus:border-[#ff7f0a] disabled:bg-[#fdf6ee]"
                      />
                    </div>
                    <label className="flex items-center gap-2 mt-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sameAsPhone}
                        onChange={(e) => {
                          setSameAsPhone(e.target.checked);
                          if (e.target.checked) {
                            setForm(f => ({ ...f, whatsapp: f.phone }));
                            setWhatsappCountryCode(countryCode);
                          }
                        }}
                        className="accent-[#ff7f0a]"
                      />
                      <span className="text-[10px] text-[#6b5b45]">Same as mobile number</span>
                    </label>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#6b5b45] mb-1.5 uppercase tracking-wide">Special Wish / Sankalp (Optional)</label>
                    <textarea name="sankalp" value={form.sankalp} onChange={handleChange} placeholder="Describe your wish, prayer, or purpose for this pooja…" rows={3} className="input-divine resize-none" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#6b5b45] mb-1.5 uppercase tracking-wide">Address (for prasad delivery – optional)</label>
                    <input name="address" value={form.address} onChange={handleChange} placeholder="Full address for prasad delivery" className="input-divine" />
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <button onClick={() => router.back()} className="text-sm text-[#6b5b45] hover:text-[#ff7f0a]">← Back</button>
                  <button
                    onClick={() => setStep(2)}
                    disabled={!isStep1Valid}
                    className={`btn-saffron text-sm px-8 ${!isStep1Valid ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    Proceed to Payment →
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white border border-[#f0dcc8] rounded-2xl p-6 shadow-card">
                <h2 className="heading-md text-[#1a1209] mb-2">Payment</h2>
                <p className="text-xs text-[#6b5b45] mb-6">Complete your booking for {cartCount} item{cartCount > 1 ? 's' : ''} with secure online payment</p>
                <div className="bg-[#fff8f0] border border-[#ffd9a8] rounded-xl p-4 mb-6">
                  <h4 className="font-semibold text-sm text-[#1a1209] mb-2">Your Sankalp Details</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs text-[#6b5b45]">
                    <span>Name: <strong className="text-[#1a1209]">{form.name}</strong></span>
                    <span>Gotra: <strong className="text-[#1a1209]">{form.gotra || "—"}</strong></span>
                    <span>Mobile: <strong className="text-[#1a1209]">+{countryCode} {form.phone}</strong></span>
                    <span>WhatsApp: <strong className="text-[#1a1209]">+{sameAsPhone ? countryCode : whatsappCountryCode} {form.whatsapp}</strong></span>
                  </div>
                </div>
                {payError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-sm text-red-600">
                    ⚠️ {payError}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <button onClick={() => setStep(1)} className="text-sm text-[#6b5b45] hover:text-[#ff7f0a]">← Back</button>
                  <button onClick={handlePay} disabled={paying} className="btn-saffron text-sm px-8 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                    {paying ? <><Loader2 size={14} className="animate-spin" /> Processing…</> : <>Pay ₹{totalAmount.toLocaleString()} →</>}
                  </button>
                </div>
                <p className="text-center text-xs text-[#6b5b45] mt-4 flex items-center justify-center gap-1">
                  <Shield size={12} className="text-green-500" /> 100% Secured by Cashfree Encryption
                </p>
              </div>
            )}
          </div>

          <div>
            <div className="bg-white border border-[#f0dcc8] rounded-2xl p-5 shadow-card sticky top-24">
              <h3 className="font-display font-semibold text-[#1a1209] mb-4">Summary</h3>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar mb-4">
                {selectedItems.map((item) => (
                  <div key={item.id} className="pb-3 border-b border-[#f0dcc8] last:border-0 last:pb-0">
                    <div className="flex justify-between items-start gap-2">
                      <div className="shrink-0 w-8 h-8 rounded bg-[#fff8f0] overflow-hidden">
                        {item.poojaImage ? (
                          <img src={item.poojaImage} alt={item.poojaName} className="w-full h-full object-cover" />
                        ) : (
                          <span className="flex items-center justify-center h-full text-sm">{item.poojaEmoji}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[#1a1209] text-xs truncate">{item.poojaName}</p>
                        <p className="text-[10px] text-[#6b5b45]">{item.templeName}</p>
                        <p className="text-[10px] text-[#ff7f0a] font-medium">{item.packageName}</p>
                      </div>
                      <p className="font-bold text-[#1a1209] text-xs ml-2">₹{item.totalPrice.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#f0dcc8] pt-3">
                <div className="flex justify-between font-bold text-base text-[#1a1209]">
                  <span>Total Amount</span>
                  <span className="text-[#ff7f0a]">₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-4 space-y-1.5 text-xs text-[#6b5b45]">
                <p className="flex items-center gap-2"><Sparkles size={12} className="text-[#ff7f0a]" /> Video on WhatsApp after pooja</p>
                <p className="flex items-center gap-2"><Sparkles size={12} className="text-[#ff7f0a]" /> Personalized sankalp by pandit</p>
                <p className="flex items-center gap-2"><Shield size={12} className="text-green-500" /> 100% Safe & Secure Payments</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function CartPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen bg-[#fdf6ee]">
        <div className="bg-white border-b border-[#f0dcc8]">
          <div className="container-app py-3 flex items-center gap-2 text-xs text-[#6b5b45]">
            <Link href="/" className="hover:text-[#ff7f0a]">Home</Link>
            <ChevronRight size={12} />
            <span className="text-[#1a1209] font-medium">Booking Checkout</span>
          </div>
        </div>
        <Suspense fallback={
          <div className="flex justify-center items-center py-20 text-[#ff7f0a]">
            <Loader2 size={40} className="animate-spin" />
            <p className="ml-4 text-sm text-[#1a1209]">Loading...</p>
          </div>
        }>
          <CartContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}