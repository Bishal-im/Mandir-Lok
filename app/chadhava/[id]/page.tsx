"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ChevronRight, MapPin, CheckCircle2, Info, Share2, Heart, ShieldCheck, Clock } from "lucide-react";
import { getUserFavorites, toggleChadhavaFavorite } from "@/lib/actions/user";
import { getLocalizedValue } from "@/lib/utils/localization";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Temple {
  _id: string;
  name: string;
  location: string;
  slug: string;
}

interface Chadhava {
  _id: string;
  name: string;
  category: string;
  emoji: string;
  image?: string;
  price: number;
  description: string;
  benefits: string[];
  tag: string;
  tagColor: string;
  templeId: Temple;
}

export default function ChadhavaDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [item, setItem] = useState<Chadhava | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [isDonation, setIsDonation] = useState(false);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!id) return;

    async function fetchItemAndFavorite() {
      try {
        setLoading(true);
        // Fetch item
        const res = await fetch(`/api/chadhava/${id}?lang=en`);
        const data = await res.json();

        if (data.success) {
          setItem(data.data);

          // Fetch favorites status
          const favRes = await getUserFavorites();
          if (favRes.success && favRes.data) {
            setIsFavorite(favRes.data.includes(id));
          }
        } else {
          setError(data.message || "Failed to load offering.");
        }
      } catch (err) {
        setError("Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    fetchItemAndFavorite();
  }, [id]);

  const handleToggleFavorite = async () => {
    if (!id) return;
    const res = await toggleChadhavaFavorite(id);
    if (res.success) {
      setIsFavorite(res.isAdded ?? !isFavorite);
    } else {
      alert(res.message || "Failed to toggle favorite");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdf6ee] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-[#fdf6ee] flex flex-col">
        <Navbar />
        <div className="flex-1 container-app py-20 text-center">
          <div className="text-6xl mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{error || "Offering Not Found"}</h1>
          <Link href="/chadhava" className="btn-primary">Browse All Offerings</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-[#fdfaf5]">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-amber-100">
          <div className="container-app py-3 flex items-center gap-2 text-xs text-[#a38b6d]">
            <Link href="/" className="hover:text-amber-600">Home</Link>
            <ChevronRight size={12} />
            <Link href="/chadhava" className="hover:text-amber-600">Chadhava</Link>
            <ChevronRight size={12} />
            <span className="text-gray-900 font-medium">{getLocalizedValue(item.name)}</span>
          </div>
        </div>

        <div className="container-app py-8">
          <div className="grid lg:grid-cols-12 gap-10">
            {/* Left Column: Image & Info */}
            <div className="lg:col-span-8 space-y-8">
              {/* Product Info Card */}
              <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-amber-100">
                <div className="grid md:grid-cols-2">
                  {/* Image Section */}
                  <div className="relative h-72 md:h-auto bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center group">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={getLocalizedValue(item.name)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <span className="text-8xl transform group-hover:scale-110 transition-transform duration-500">
                        {item.emoji || ""}
                      </span>
                    )}
                    {item.tag && (
                      <div className={`absolute top-4 left-4 ${item.tagColor || "bg-orange-500"} text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg`}>
                        {getLocalizedValue(item.tag)}
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="p-8 space-y-5">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-amber-600 font-bold text-[10px] tracking-wider uppercase">
                        <span>{item.category || "General Offering"}</span>
                        <span className="w-1 h-1 bg-amber-300 rounded-full"></span>
                        <span className="flex items-center gap-1">
                          <MapPin size={10} /> {getLocalizedValue(item.templeId?.location) || "India"}
                        </span>
                      </div>
                      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                        {getLocalizedValue(item.name)}
                      </h1>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-3xl font-bold text-amber-600">₹{item.price?.toLocaleString()}</div>
                      <div className="text-xs text-gray-500 line-through">₹{(item.price * 1.2).toFixed(0)}</div>
                      <div className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-lg">20% OFF</div>
                    </div>

                    <p className="text-gray-600 text-sm leading-relaxed">
                      {getLocalizedValue(item.description)}
                    </p>

                    <div className="pt-4 border-t border-amber-50 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                        <CheckCircle2 size={16} className="text-green-500" />
                        <span>Offered at {getLocalizedValue(item.templeId?.name)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                        <CheckCircle2 size={16} className="text-green-500" />
                        <span>Performed by Certified Pandits</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                        <CheckCircle2 size={16} className="text-green-500" />
                        <span>Video recording of the offering</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Benefits Section */}
              {item.benefits && item.benefits.length > 0 && (
                <div className="space-y-5">
                  <div className="flex items-center gap-2 text-gray-900 font-bold">
                    <div className="w-1 h-6 bg-amber-500 rounded-full"></div>
                    <h2>Spiritual Benefits</h2>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {item.benefits.map((benefit, i) => (
                      <div key={i} className="bg-white p-4 rounded-2xl border border-amber-50 flex items-start gap-3 shadow-sm">
                        <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center shrink-0">
                          <CheckCircle2 size={16} className="text-amber-600" />
                        </div>
                        <p className="text-xs text-gray-700 font-medium leading-relaxed">{getLocalizedValue(benefit)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Process Section */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 text-gray-900 font-bold">
                  <div className="w-1 h-6 bg-amber-500 rounded-full"></div>
                  <h2>How it Works</h2>
                </div>
                <div className="grid sm:grid-cols-3 gap-6">
                  {[
                    { title: "Personal Sankalp", desc: "Panditji performs your offering with your Name and Gotra.", icon: "" },
                    { title: "Ritual Execution", desc: "The offering is made following Vedic traditions at the temple.", icon: "" },
                    { title: "Video Proof", desc: "Receive high-quality video of the offering on WhatsApp.", icon: "" }
                  ].map((step, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-amber-50 relative group">
                      <div className="absolute -top-3 -right-3 w-8 h-8 bg-amber-500 text-white font-bold rounded-full flex items-center justify-center text-xs shadow-lg">
                        {i + 1}
                      </div>
                      <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">{step.icon}</div>
                      <h3 className="font-bold text-gray-900 text-sm mb-2">{step.title}</h3>
                      <p className="text-gray-500 text-[11px] leading-relaxed">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Checkout Sidebar */}
            <div className="lg:col-span-4">
              <div className="sticky top-24 space-y-6">
                <div className="bg-white rounded-3xl p-6 shadow-xl border border-amber-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16"></div>

                  <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <CheckCircle2 className="text-amber-500" size={20} />
                    Complete Offering
                  </h3>

                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Item Amount</span>
                      <span className="font-semibold text-gray-900">₹{item.price?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Service Fee</span>
                      <span className="text-green-600 font-medium">Free</span>
                    </div>
                    <div className="h-px bg-amber-50"></div>
                    <div className="flex justify-between items-center mb-6">
                      <span className="font-bold text-gray-900">Total Payable</span>
                      <span className="text-2xl font-black text-amber-600">₹{(item.price * quantity).toLocaleString()}</span>
                    </div>

                    <div className="space-y-4 mb-8">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Select Quantity</p>
                      <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                        <button
                          onClick={() => setQuantity(q => Math.max(1, q - 1))}
                          className="w-10 h-10 bg-white border border-amber-100 rounded-xl flex items-center justify-center text-amber-600 font-bold hover:bg-amber-50 active:scale-95 transition-all outline-none"
                        >
                          −
                        </button>
                        <span className="flex-1 text-center font-bold text-gray-900">{quantity}</span>
                        <button
                          onClick={() => setQuantity(q => Math.min(10, q + 1))}
                          className="w-10 h-10 bg-white border border-amber-100 rounded-xl flex items-center justify-center text-amber-600 font-bold hover:bg-amber-50 active:scale-95 transition-all outline-none"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Choose Offering Type</p>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setIsDonation(false)}
                          className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all ${!isDonation ? 'bg-amber-50 border-amber-500 ring-1 ring-amber-500' : 'bg-gray-50 border-gray-100'}`}
                        >
                          <span className="text-lg"></span>
                          <span className={`text-[10px] font-bold ${!isDonation ? 'text-amber-700' : 'text-gray-500'}`}>Ritual + Video</span>
                        </button>
                        <button
                          onClick={() => setIsDonation(true)}
                          className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all ${isDonation ? 'bg-amber-50 border-amber-500 ring-1 ring-amber-500' : 'bg-gray-50 border-gray-100'}`}
                        >
                          <span className="text-lg"></span>
                          <span className={`text-[10px] font-bold ${isDonation ? 'text-amber-700' : 'text-gray-500'}`}>Simple Donation</span>
                        </button>
                      </div>
                      <p className="text-[9px] text-gray-500 leading-tight">
                        {isDonation
                          ? "Direct contribution to temple. Immediate digital certificate issued. No video recording."
                          : "Full Vedic ritual performed in your name. Video proof sent on WhatsApp."}
                      </p>

                      {isDonation && (
                        <div className="pt-4 border-t border-amber-50 animate-in fade-in slide-in-from-top-2 duration-300">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                            Additional Donation / Dakshina (Optional)
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                            <input
                              type="number"
                              placeholder="Enter amount (e.g. 501, 1100)"
                              value={customAmount}
                              onChange={(e) => setCustomAmount(e.target.value)}
                              className="w-full pl-8 pr-4 py-3 bg-white border border-amber-100 rounded-2xl text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                            />
                          </div>
                          <p className="text-[9px] text-amber-600 mt-2 italic flex items-center gap-1">
                            <Info size={10} /> This amount will be added to your total contribution.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const today = new Date();
                      const targetDate = new Date();
                      targetDate.setDate(today.getDate() + 2); // Default to 2nd day from now
                      const yyyy = targetDate.getFullYear();
                      const mm = String(targetDate.getMonth() + 1).padStart(2, "0");
                      const dd = String(targetDate.getDate()).padStart(2, "0");
                      const dateValue = `${yyyy}-${mm}-${dd}`;

                      router.push(`/cart?templeId=${item.templeId?._id}&offerings=${item._id}:${quantity}&qty=1&date=${dateValue}&isDonation=${isDonation}&customAmount=${customAmount || 0}`);
                    }}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold py-4 rounded-2xl shadow-[0_8px_30px_rgb(245,158,11,0.3)] hover:shadow-[0_12px_40px_rgb(245,158,11,0.4)] transition-all active:scale-[0.98] mb-4"
                  >
                    Proceed to Offer
                  </button>

                  <div className="flex items-center justify-center gap-6 pt-4 border-t border-amber-50">
                    <div className="flex flex-col items-center gap-1 group cursor-pointer">
                      <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 group-hover:bg-amber-100 transition-colors">
                        <Share2 size={16} />
                      </div>
                      <span className="text-[10px] font-medium text-gray-500">Share</span>
                    </div>
                    <div
                      onClick={handleToggleFavorite}
                      className="flex flex-col items-center gap-1 group cursor-pointer"
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isFavorite
                        ? "bg-rose-100 text-rose-600"
                        : "bg-amber-50 text-amber-600 group-hover:bg-amber-100"
                        }`}>
                        <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
                      </div>
                      <span className={`text-[10px] font-medium ${isFavorite ? "text-rose-600" : "text-gray-500"}`}>
                        {isFavorite ? "Saved" : "Save"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Trust Badge */}
                <div className="bg-[#f0f9ff] border border-blue-100 rounded-3xl p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="text-blue-600" size={24} />
                    <h4 className="font-bold text-blue-900 text-sm">Mandirlok Assurance</h4>
                  </div>
                  <div className="space-y-3">
                    {[
                      { icon: <Clock size={12} />, text: "Video Proof in 24-48 Hours" },
                      { icon: <ShieldCheck size={12} />, text: "Authentic Temple Offerings" },
                      { icon: <Info size={12} />, text: "Dedicated Customer Support" }
                    ].map((row, i) => (
                      <div key={i} className="flex items-center gap-2 text-[11px] text-blue-800/80">
                        {row.icon}
                        <span>{row.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
