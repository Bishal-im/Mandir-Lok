"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ChevronRight, Shield, Loader2, Sparkles, MapPin, Calendar } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { convertINRtoUSD, formatCurrency } from "@/lib/currency";

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
    { name: "India", code: "91", flag: "🇮🇳" },
    { name: "USA", code: "1", flag: "🇺🇸" },
    { name: "Canada", code: "1", flag: "🇨🇦" },
    { name: "UK", code: "44", flag: "🇬🇧" },
    { name: "Australia", code: "61", flag: "🇦🇺" },
    { name: "UAE", code: "971", flag: "🇦🇪" },
    { name: "Singapore", code: "65", flag: "🇸🇬" },
    { name: "Malaysia", code: "60", flag: "🇲🇾" },
    { name: "New Zealand", code: "64", flag: "🇳🇿" },
    { name: "Germany", code: "49", flag: "🇩🇪" },
    { name: "France", code: "33", flag: "🇫🇷" },
    { name: "Italy", code: "39", flag: "🇮🇹" },
    { name: "Netherlands", code: "31", flag: "🇳🇱" },
    { name: "Sweden", code: "46", flag: "🇸🇪" },
    { name: "Switzerland", code: "41", flag: "🇨🇭" },
    { name: "Japan", code: "81", flag: "🇯🇵" },
    { name: "South Africa", code: "27", flag: "🇿🇦" },
    { name: "Saudi Arabia", code: "966", flag: "🇸🇦" },
    { name: "Qatar", code: "974", flag: "🇶🇦" },
    { name: "Oman", code: "968", flag: "🇴🇲" },
    { name: "Kuwait", code: "965", flag: "🇰🇼" },
    { name: "Bahrain", code: "973", flag: "🇧🇭" },
    { name: "Nepal", code: "977", flag: "🇳🇵" },
    { name: "Sri Lanka", code: "94", flag: "🇱🇰" },
    { name: "Bangladesh", code: "880", flag: "🇧🇩" },
    { name: "Fiji", code: "679", flag: "🇫🇯" }
];

function CheckoutContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { currency, exchangeRate } = useCurrency();

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
    const [payError, setPayError] = useState("");

    const [loadingParam, setLoadingParam] = useState(true);
    const [orderItem, setOrderItem] = useState<any>(null);

    // Parse parameters to build order item directly
    useEffect(() => {
        const poojaId = searchParams.get("poojaId");
        const isDonation = searchParams.get("isDonation") === "true";
        const templeId = searchParams.get("templeId");
        const date = searchParams.get("date");
        const packageIndexStr = searchParams.get("packageIndex");
        const offeringsStr = searchParams.get("offerings");
        const qtyStr = searchParams.get("qty") || "1";
        const customAmountStr = searchParams.get("customAmount") || "0";

        const fetchDetails = async () => {
            try {
                setLoadingParam(true);

                // Standalone Chadhava checkout
                if (!poojaId && offeringsStr) {
                    const pairs = offeringsStr.split(",");
                    const firstPair = pairs[0].split(":");
                    const chadhavaId = firstPair[0];

                    const res = await fetch(`/api/chadhava/${chadhavaId}`);
                    const data = await res.json();

                    if (data.success) {
                        const item = data.data;
                        const qty = parseInt(qtyStr);
                        const customAmount = parseInt(customAmountStr);
                        setOrderItem({
                            id: item._id,
                            name: item.name,
                            emoji: item.emoji || "🙏",
                            image: item.image || "",
                            templeId,
                            templeName: item.templeId?.name || "Temple",
                            date: date || new Date().toISOString().split('T')[0],
                            offerings: [{ id: item._id, name: item.name, price: item.price, emoji: item.emoji, quantity: qty }],
                            offeringStrData: offeringsStr,
                            totalPrice: (item.price * qty) + customAmount,
                            isDonation,
                            extraDonation: customAmount,
                            qty
                        });
                    }
                    setLoadingParam(false);
                    return;
                }

                // Pure Donation Check out
                if (!poojaId && isDonation && customAmountStr && !offeringsStr) {
                    let tName = "Sacred Temple";
                    if (templeId) {
                        try {
                            const tres = await fetch(`/api/temples`);
                            const tdata = await tres.json();
                            if (tdata.success) {
                                const t = tdata.data.find((t: any) => t._id === templeId);
                                if (t) tName = t.name;
                            }
                        } catch (e) { }
                    }
                    const customAmount = parseInt(customAmountStr);
                    setOrderItem({
                        id: 'donation',
                        name: 'Direct Temple Donation',
                        emoji: '🙏',
                        image: '',
                        templeId,
                        templeName: tName,
                        date: date || new Date().toISOString().split('T')[0],
                        offerings: [],
                        offeringStrData: '',
                        totalPrice: customAmount,
                        isDonation,
                        extraDonation: customAmount,
                        qty: 1
                    });
                    setLoadingParam(false);
                    return;
                }

                // Pooja checkout
                if (poojaId && templeId && date) {
                    const res = await fetch(`/api/poojas/${poojaId}`);
                    const data = await res.json();
                    if (data.success) {
                        const pooja = data.data.pooja;
                        const packageIndex = packageIndexStr ? parseInt(packageIndexStr) : 0;
                        const pkg = pooja.packages ? pooja.packages[packageIndex] : null;
                        const packagePrice = pkg ? pkg.price : pooja.price;
                        const packageName = pkg ? pkg.name : undefined;

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

                        // Calculate total price
                        const total = packagePrice + selectedOfferingItems.reduce((sum: number, o: any) => sum + o.price, 0);

                        setOrderItem({
                            poojaId: pooja._id,
                            name: pooja.name,
                            emoji: pooja.emoji || "🪔",
                            image: pooja.images?.[0] || "",
                            templeId,
                            templeName: pooja.templeIds?.find((t: any) => t?._id === templeId)?.name || pooja.templeId?.name || "Temple",
                            date,
                            packageIndex,
                            packageName,
                            packagePrice,
                            offerings: selectedOfferingItems,
                            totalPrice: total,
                        });
                    }
                }
            } catch (err) {
                setPayError("Failed to load details");
            } finally {
                setLoadingParam(false);
            }
        };

        fetchDetails();
    }, [searchParams]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    };

    const isStep1Valid = form.name && form.phone && form.whatsapp && orderItem;

    const handlePay = async () => {
        if (!orderItem) return;
        setPayError("");
        setPaying(true);

        try {
            const loaded = await loadCashfreeScript();
            if (!loaded) throw new Error("Could not load Cashfree SDK.");

            // For direct checkout, we use standard single-item checkout logic
            const reqBody: any = {
                isBulk: false,
                name: form.name,
                phone: `+${countryCode}${form.phone}`,
            };

            if (orderItem.poojaId) {
                reqBody.poojaId = orderItem.poojaId;
                reqBody.packageIndex = orderItem.packageIndex;
                reqBody.chadhavaIds = orderItem.offerings.map((o: any) => o.id);
            } else if (orderItem.id !== 'donation') {
                // Standalone Chadhava
                reqBody.chadhavaIds = [{ id: orderItem.id, quantity: orderItem.qty }];
                reqBody.extraDonation = orderItem.extraDonation || 0;
            } else {
                // Pure Donation
                reqBody.chadhavaIds = [];
                reqBody.extraDonation = orderItem.extraDonation || 0;
            }

            const orderRes = await fetch("/api/payment/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(reqBody),
            });

            const orderData = await orderRes.json();
            if (!orderData.success) throw new Error(orderData.message || "Failed to create payment order");

            const { payment_session_id, order_id } = orderData.data;

            const cashfree = window.Cashfree({
                mode: process.env.NEXT_PUBLIC_CASHFREE_ENV === "PRODUCTION" ? "production" : "sandbox",
            });

            // Construct returnUrl matching what verify expects
            const query = new URLSearchParams();
            query.set("order_id", order_id);
            query.set("isBulk", "false");
            if (orderItem.poojaId) query.set("poojaId", orderItem.poojaId);
            query.set("templeId", orderItem.templeId);
            query.set("bookingDate", orderItem.date);
            query.set("qty", (orderItem.qty || 1).toString());
            query.set("sankalpName", form.name);
            query.set("gotra", form.gotra);
            query.set("dob", form.dob);
            query.set("phone", `+${countryCode}${form.phone}`);
            query.set("whatsapp", `+${sameAsPhone ? countryCode : whatsappCountryCode}${form.whatsapp}`);
            query.set("sankalp", form.sankalp);
            query.set("address", form.address);
            if (orderItem.isDonation) query.set("isDonation", "true");
            if (orderItem.extraDonation) query.set("extraDonation", orderItem.extraDonation.toString());

            if (orderItem.packageName) {
                query.set("packageName", orderItem.packageName);
                query.set("packagePrice", orderItem.packagePrice.toString());
            }
            if (orderItem.poojaId && orderItem.offerings.length > 0) {
                query.set("chadhavaData", orderItem.offerings.map((o: any) => `${o.id}:1`).join(","));
            } else if (!orderItem.poojaId && orderItem.offeringStrData) {
                query.set("chadhavaData", orderItem.offeringStrData);
            }

            await cashfree.checkout({
                paymentSessionId: payment_session_id,
                returnUrl: `${window.location.origin}/api/payment/verify?${query.toString()}`,
            });

        } catch (err: any) {
            if (err.message !== "Payment cancelled") setPayError(err.message || "Something went wrong");
        } finally {
            setPaying(false);
        }
    };

    if (loadingParam) {
        return (
            <div className="flex justify-center items-center py-20 text-[#ff7f0a]">
                <Loader2 size={40} className="animate-spin" />
                <p className="ml-4 text-sm text-[#1a1209]">Loading Details...</p>
            </div>
        );
    }

    if (!orderItem) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
                <h2 className="heading-md mb-2">Invalid Booking URL</h2>
                <p className="text-[#6b5b45] mb-6 max-w-sm">We couldn't load the details for this booking.</p>
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
                <div className="flex items-center justify-center gap-0 mb-6 sm:mb-10 max-w-lg mx-auto px-4 sm:px-2">
                    {["Sankalp", "Payment"].map((label, i) => (
                        <div key={label} className="flex items-center flex-1 last:flex-none last:w-auto">
                            <div className="flex flex-col items-center">
                                <div
                                    className={`w-7 h-7 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-[10px] sm:text-sm font-bold transition-all shadow-sm ${step > i + 1
                                        ? "bg-green-500 text-white"
                                        : step === i + 1
                                            ? "bg-[#ff7f0a] text-white ring-2 sm:ring-4 ring-orange-100"
                                            : "bg-white border sm:border-2 border-[#f0dcc8] text-[#6b5b45]"
                                        }`}
                                >
                                    {step > i + 1 ? "✓" : i + 1}
                                </div>
                                <p className={`text-[10px] sm:text-xs mt-1 sm:mt-1.5 font-bold uppercase tracking-wider ${step === i + 1 ? "text-[#ff7f0a]" : "text-[#6b5b45]/40"}`}>
                                    {label}
                                </p>
                            </div>
                            {i < 1 && (
                                <div className={`flex-1 h-[2px] mx-2 sm:mx-4 rounded-full ${step > 1 ? "bg-green-400" : "bg-[#f0dcc8]"}`} />
                            )}
                        </div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {step === 1 && (
                            <div className="bg-white border border-[#f0dcc8] rounded-2xl p-6 shadow-card">
                                <h2 className="heading-md text-[#1a1209] mb-1">Sankalp Details</h2>
                                <p className="text-xs text-[#6b5b45] mb-6">
                                    These details will be used for the personalized sankalp. Please fill carefully.
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
                                                className="px-2 border border-r-0 border-[#f0dcc8] rounded-l-xl text-xs text-[#6b5b45] bg-[#fdf6ee] outline-none w-20 sm:w-28 shrink-0 appearance-none"
                                            >
                                                {COUNTRIES.map((c) => (
                                                    <option key={`${c.name}-${c.code}`} value={c.code}>
                                                        +{c.code}
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
                                                className="px-2 border border-r-0 border-[#f0dcc8] rounded-l-xl text-xs text-[#6b5b45] bg-[#fdf6ee] outline-none disabled:opacity-70 w-20 sm:w-28 shrink-0 appearance-none"
                                            >
                                                {COUNTRIES.map((c) => (
                                                    <option key={`wa-${c.name}-${c.code}`} value={c.code}>
                                                        +{c.code}
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

                                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <button onClick={() => router.back()} className="text-sm font-bold text-[#6b5b45] hover:text-[#ff7f0a] order-2 sm:order-1">← Back to previous</button>
                                    <button
                                        onClick={() => setStep(2)}
                                        disabled={!isStep1Valid}
                                        className={`btn-saffron w-full sm:w-auto text-base px-10 py-4 rounded-2xl shadow-xl shadow-orange-200 order-1 sm:order-2 flex items-center justify-center gap-2 ${!isStep1Valid ? "opacity-50 cursor-not-allowed grayscale" : ""}`}
                                    >
                                        Proceed to Payment →
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="bg-white border border-[#f0dcc8] rounded-2xl p-6 shadow-card">
                                <h2 className="heading-md text-[#1a1209] mb-2">Payment</h2>
                                <p className="text-xs text-[#6b5b45] mb-6">Complete your booking with secure online payment</p>

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

                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <button onClick={() => setStep(1)} className="text-sm font-bold text-[#6b5b45] hover:text-[#ff7f0a] order-2 sm:order-1">← Modify Details</button>
                                    <button onClick={handlePay} disabled={paying} className="btn-saffron w-full sm:w-auto text-base px-10 py-4 rounded-2xl shadow-xl shadow-orange-200 order-1 sm:order-2 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                                        {paying ? <><Loader2 size={18} className="animate-spin" /> Processing…</> : <>Pay {formatCurrency(currency === "USD" ? convertINRtoUSD(orderItem.totalPrice, exchangeRate) : orderItem.totalPrice, currency)} →</>}
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

                            <div className="pb-3 border-b border-[#f0dcc8]">
                                <div className="flex justify-between items-start gap-2">
                                    <div className="shrink-0 w-12 h-12 rounded bg-[#fff8f0] overflow-hidden">
                                        {orderItem.image ? (
                                            <img src={orderItem.image} alt={orderItem.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="flex items-center justify-center h-full text-2xl">{orderItem.emoji}</span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-[#1a1209] text-sm truncate">{orderItem.name}</p>
                                        <p className="text-[10px] text-[#6b5b45]">{orderItem.templeName}</p>
                                        {orderItem.packageName && (
                                            <p className="text-[10px] text-[#ff7f0a] font-medium">{orderItem.packageName}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {orderItem.offerings && orderItem.offerings.length > 0 && (
                                <div className="py-3 border-b border-[#f0dcc8] space-y-2">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Included Offerings</p>
                                    {orderItem.offerings.map((offering: any) => (
                                        <div key={offering.id} className="flex justify-between text-xs text-[#6b5b45]">
                                            <span className="truncate pr-2">{offering.name} {offering.quantity > 1 ? `x${offering.quantity}` : ''}</span>
                                            <span className="font-medium">
                                                {formatCurrency(currency === "USD" ? convertINRtoUSD(offering.price * offering.quantity) : offering.price * offering.quantity, currency)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {orderItem.extraDonation > 0 && (
                                <div className="py-3 border-b border-[#f0dcc8] space-y-2">
                                    <div className="flex justify-between text-xs text-[#6b5b45]">
                                        <span>Extra Donation / Dakshina</span>
                                        <span className="font-medium">
                                            {formatCurrency(currency === "USD" ? convertINRtoUSD(orderItem.extraDonation) : orderItem.extraDonation, currency)}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className="pt-3">
                                <div className="flex justify-between font-bold text-base text-[#1a1209]">
                                    <span>Total Amount</span>
                                    <span className="text-[#ff7f0a]">
                                        {formatCurrency(currency === "USD" ? convertINRtoUSD(orderItem.totalPrice, exchangeRate) : orderItem.totalPrice, currency)}
                                    </span>
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

export default function DirectCheckoutPage() {
    return (
        <>
            <Navbar />
            <main className="pt-20 min-h-screen bg-[#fdf6ee]">
                <div className="bg-white border-b border-[#f0dcc8]">
                    <div className="container-app py-3 flex items-center gap-2 text-xs text-[#6b5b45]">
                        <Link href="/" className="hover:text-[#ff7f0a]">Home</Link>
                        <ChevronRight size={12} />
                        <span className="text-[#1a1209] font-medium">Direct Checkout</span>
                    </div>
                </div>
                <Suspense fallback={
                    <div className="flex justify-center items-center py-20 text-[#ff7f0a]">
                        <Loader2 size={40} className="animate-spin" />
                        <p className="ml-4 text-sm text-[#1a1209]">Loading Details...</p>
                    </div>
                }>
                    <CheckoutContent />
                </Suspense>
            </main>
            <Footer />
        </>
    );
}
