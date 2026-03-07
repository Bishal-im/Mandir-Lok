"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  ChevronRight,
  Star,
  Clock,
  Calendar,
  Plus,
  Minus,
  Shield,
  Phone,
  Loader2,
  Sparkles,
  ShoppingBag
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { convertINRtoUSD, formatCurrency } from "@/lib/currency";

const dates = Array.from({ length: 7 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() + i + 1);

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");

  return {
    date: d.getDate(),
    day: d.toLocaleDateString("en-IN", { weekday: "short" }),
    full: d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    value: `${yyyy}-${mm}-${dd}`,
  };
});

export default function PoojaDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { addToCart } = useCart();
  const { currency, exchangeRate } = useCurrency();

  const [pooja, setPooja] = useState<any>(null);
  const [offerings, setOfferings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTempleId, setSelectedTempleId] = useState<string | null>(null);
  const [selectedPackageIndex, setSelectedPackageIndex] = useState<number | null>(null);
  const [addedOfferings, setAddedOfferings] = useState<string[]>([]);
  const [showValidation, setShowValidation] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/poojas/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPooja(data.data.pooja);
          setOfferings(data.data.chadhavaItems || []);
          if (data.data.pooja.templeIds?.length > 0) {
            setSelectedTempleId(data.data.pooja.templeIds[0]._id);
          }
        } else {
          setError(data.message || "Failed to load pooja details");
        }
      })
      .catch(() => setError("Something went wrong"))
      .finally(() => setLoading(false));
  }, [id]);

  const toggleOffering = (offeringId: string) => {
    setAddedOfferings((prev) =>
      prev.includes(offeringId)
        ? prev.filter((x) => x !== offeringId)
        : [...prev, offeringId],
    );
  };

  const handlePackageSelect = (index: number) => {
    setSelectedPackageIndex(prev => prev === index ? null : index);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="pt-20 min-h-screen bg-[#fdf6ee] flex items-center justify-center">
          <div className="flex flex-col items-center text-[#ff7f0a]">
            <Loader2 size={40} className="animate-spin mb-4" />
            <p className="text-[#6b5b45]">Loading sacred details...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !pooja) {
    return (
      <>
        <Navbar />
        <main className="pt-20 min-h-screen bg-[#fdf6ee] flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold text-[#1a1209] mb-2">Oops!</h2>
            <p className="text-[#6b5b45] mb-4">{error || "Pooja not found"}</p>
            <Link href="/poojas" className="btn-saffron text-sm">
              Explore Available Poojas
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Create the checkout link
  const checkoutQuery = new URLSearchParams();
  checkoutQuery.set("poojaId", pooja._id);
  checkoutQuery.set("templeId", selectedTempleId || "");
  if (selectedDate !== null) {
    checkoutQuery.set("date", dates[selectedDate].value);
  }
  if (selectedPackageIndex !== null) {
    checkoutQuery.set("packageIndex", selectedPackageIndex.toString());
  }
  if (addedOfferings.length > 0) {
    checkoutQuery.set("offerings", addedOfferings.join(","));
  }
  const checkoutLink = `/checkout?${checkoutQuery.toString()}`;

  const handleProceedClick = (e: React.MouseEvent) => {
    if (selectedDate === null || selectedPackageIndex === null || selectedTempleId === null) {
      e.preventDefault();
      setShowValidation(true);

      // Scroll to the first missing section for better UX
      if (selectedTempleId === null) {
        document.getElementById('temple-selection')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (selectedDate === null) {
        document.getElementById('date-selection')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (selectedPackageIndex === null) {
        document.getElementById('package-selection')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const handleAddToCart = () => {
    if (selectedDate === null || selectedPackageIndex === null || selectedTempleId === null) {
      setShowValidation(true);
      if (selectedTempleId === null) {
        document.getElementById('temple-selection')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (selectedDate === null) {
        document.getElementById('date-selection')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (selectedPackageIndex === null) {
        document.getElementById('package-selection')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    const pkg = pooja.packages[selectedPackageIndex];
    const selectedOfferingItems = offerings
      .filter(o => addedOfferings.includes(o._id))
      .map(o => ({
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
      templeId: selectedTempleId,
      templeName: pooja.templeIds.find((t: any) => t._id === selectedTempleId)?.name || "",
      date: dates[selectedDate].value,
      packageIndex: selectedPackageIndex,
      packageName: pkg.name,
      packagePrice: pkg.price,
      offeringIds: addedOfferings,
      offerings: selectedOfferingItems,
      totalPrice: pkg.price + selectedOfferingItems.reduce((sum, o) => sum + o.price, 0)
    });

    alert("Pooja added to cart! 🙏");
  };

  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen bg-[#fdf6ee]">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-[#f0dcc8]">
          <div className="container-app py-3 flex items-center gap-2 text-xs text-[#6b5b45]">
            <Link href="/" className="hover:text-[#ff7f0a]">
              Home
            </Link>
            <ChevronRight size={12} />
            <Link href="/poojas" className="hover:text-[#ff7f0a]">
              Poojas
            </Link>
            <ChevronRight size={12} />
            <span className="text-[#1a1209] font-medium">{pooja.name}</span>
          </div>
        </div>

        <div className="container-app py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* LEFT: Pooja Info */}
            <div className="lg:col-span-2 space-y-5">
              {/* Header Card */}
              <div className="bg-white border border-[#f0dcc8] rounded-2xl p-6 shadow-card">
                <div className="flex items-start gap-5">
                  <div className="w-20 h-20 rounded-2xl bg-[#fff8f0] flex items-center justify-center text-4xl flex-shrink-0 shadow-sm overflow-hidden">
                    {pooja.images && pooja.images.length > 0 ? (
                      <img src={pooja.images[0]} alt={pooja.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center text-amber-200 gap-1">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="mb-2">
                      {pooja.tag && (
                        <span className={`badge-saffron text-xs mb-2 inline-block ${pooja.tagColor}`}>
                          {pooja.tag}
                        </span>
                      )}
                      <h1 className="heading-md text-[#1a1209]">
                        {pooja.name}
                      </h1>
                      <p className="text-sm text-[#ff7f0a] mt-0.5">
                        {pooja.templeIds?.[0]?.name} {pooja.templeIds?.length > 1 && `+ ${pooja.templeIds.length - 1} more temples`}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-[#6b5b45]">
                      <span className="flex items-center gap-1">
                        <Star
                          size={12}
                          className="text-[#f0bc00] fill-[#f0bc00]"
                        />
                        <strong className="text-[#1a1209]">
                          {pooja.rating || 4.9}
                        </strong>{" "}
                        ({((pooja.totalReviews || 3240) / 1000).toFixed(1)}k reviews)
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} className="text-[#ff7f0a]" />{" "}
                        {pooja.duration}
                      </span>
                      <span>Experienced Pandit</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-[#f0dcc8]">
                  <p className="text-sm text-[#6b5b45] leading-relaxed">
                    {pooja.description}
                  </p>
                </div>
              </div>

              {/* Benefits */}
              {pooja.benefits && pooja.benefits.length > 0 && (
                <div className="bg-white border border-[#f0dcc8] rounded-2xl p-5 shadow-card">
                  <h3 className="font-display font-semibold text-[#1a1209] mb-3">
                    Benefits of This Pooja
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {pooja.benefits.map((b: string) => (
                      <div
                        key={b}
                        className="flex items-center gap-2 text-sm text-[#6b5b45]"
                      >
                        <span className="text-[#ff7f0a]">✦</span> {b}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Temple Selection */}
              {pooja.templeIds && pooja.templeIds.length > 1 && (
                <div id="temple-selection" className={`bg-white border rounded-2xl p-5 shadow-card transition-all ${showValidation && selectedTempleId === null ? "border-red-400 ring-1 ring-red-100" : "border-[#f0dcc8]"}`}>
                  <h3 className="font-display font-semibold text-[#1a1209] mb-4 flex items-center gap-2">
                    <svg className="w-[18px] h-[18px] text-[#ff7f0a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Choose Temple {showValidation && selectedTempleId === null && <span className="text-red-500 text-xs font-normal ml-auto">* Please select</span>}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {pooja.templeIds.map((t: any) => (
                      <button
                        key={t._id}
                        onClick={() => setSelectedTempleId(t._id)}
                        className={`flex flex-col p-4 rounded-xl border transition-all text-left ${selectedTempleId === t._id
                          ? "border-[#ff7f0a] bg-[#fff8f0] text-[#ff7f0a]"
                          : "border-[#f0dcc8] text-[#6b5b45] hover:border-[#ffbd6e]"
                          }`}
                      >
                        <span className="font-bold text-sm">{t.name}</span>
                        <span className="text-[10px] opacity-70">{t.city}, {t.state}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Date Selection */}
              <div id="date-selection" className={`bg-white border rounded-2xl p-5 shadow-card transition-all ${showValidation && selectedDate === null ? "border-red-400 ring-1 ring-red-100" : "border-[#f0dcc8]"}`}>
                <h3 className="font-display font-semibold text-[#1a1209] mb-4 flex items-center gap-2">
                  <Calendar size={18} className="text-[#ff7f0a]" /> Choose Pooja
                  Date {showValidation && selectedDate === null && <span className="text-red-500 text-xs font-normal ml-auto">* Selection required</span>}
                </h3>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {dates.map((d, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedDate(i)}
                      className={`flex flex-col items-center py-3 px-2 rounded-xl border transition-all text-xs ${selectedDate === i
                        ? "border-[#ff7f0a] bg-[#fff8f0] text-[#ff7f0a]"
                        : "border-[#f0dcc8] text-[#6b5b45] hover:border-[#ffbd6e]"
                        }`}
                    >
                      <span className="font-semibold mb-0.5">{d.day}</span>
                      <span className="text-lg font-bold">{d.date}</span>
                    </button>
                  ))}
                </div>
                {selectedDate !== null && (
                  <p className="mt-3 text-xs text-green-600 flex items-center gap-1">
                    Date selected: {dates[selectedDate].full}
                  </p>
                )}
              </div>

              {/* Package Selection */}
              {pooja.packages && pooja.packages.length > 0 && (
                <div id="package-selection" className={`bg-white border rounded-2xl p-5 shadow-card transition-all ${showValidation && selectedPackageIndex === null ? "border-red-400 ring-1 ring-red-100" : "border-[#f0dcc8]"}`}>
                  <h3 className="font-display font-semibold text-[#1a1209] mb-4 flex items-center gap-2">
                    <Sparkles size={18} className="text-[#ff7f0a]" /> Select Your Puja Package {showValidation && selectedPackageIndex === null && <span className="text-red-500 text-xs font-normal ml-auto">* Please choose</span>}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {pooja.packages.map((pkg: any, i: number) => (
                      <button
                        key={i}
                        onClick={() => handlePackageSelect(i)}
                        className={`flex flex-col text-left p-4 rounded-2xl border transition-all relative ${selectedPackageIndex === i
                          ? "border-[#ff7f0a] bg-[#fff8f0] ring-1 ring-[#ff7f0a]"
                          : "border-[#f0dcc8] bg-white hover:border-[#ffbd6e]"
                          }`}
                      >
                        {selectedPackageIndex === i && (
                          <div className="absolute top-3 right-3 w-5 h-5 bg-[#ff7f0a] rounded-full flex items-center justify-center text-white">
                            <Plus size={12} className="rotate-45" />
                          </div>
                        )}
                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase mb-3 w-fit ${selectedPackageIndex === i ? "bg-[#ff7f0a] text-white" : "bg-[#fff8f0] text-[#ff7f0a]"}`}>
                          {pkg.members} {pkg.members === 1 ? 'Person' : 'Persons'}
                        </span>
                        <h4 className="font-bold text-[#1a1209] mb-4 h-10 overflow-hidden text-sm line-clamp-2">{pkg.name}</h4>
                        <div className="mt-auto pt-2 border-t border-dashed border-[#f0dcc8]">
                          <p className="text-xl font-bold text-[#ff7f0a]">
                            {formatCurrency(currency === "USD" ? convertINRtoUSD(pkg.price) : pkg.price, currency)}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chadhava Add-ons */}
              {offerings.length > 0 && (
                <div className="bg-white border border-[#f0dcc8] rounded-2xl p-5 shadow-card">
                  <h3 className="font-display font-semibold text-[#1a1209] mb-1">
                    Choose Your Offerings
                  </h3>
                  <p className="text-xs text-[#6b5b45] mb-4">
                    Add chadhava items to enhance your pooja
                  </p>
                  <div className="space-y-3">
                    {offerings.map((item: any) => {
                      const added = addedOfferings.includes(item._id);
                      return (
                        <div
                          key={item._id}
                          className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${added
                            ? "border-[#ff7f0a] bg-[#fff8f0]"
                            : "border-[#f0dcc8] hover:border-[#ffbd6e]"
                            }`}
                        >
                          <div className="w-12 h-12 rounded-lg bg-gray-50 flex-shrink-0 overflow-hidden flex items-center justify-center">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="flex flex-col items-center text-amber-100">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-[#1a1209]">
                              {item.name}
                            </p>
                            <p className="text-xs text-[#6b5b45]">
                              Sacred offering at the temple
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="font-semibold text-xs text-[#1a1209]">
                              {formatCurrency(currency === "USD" ? convertINRtoUSD(item.price) : item.price, currency)}
                            </span>
                            <button
                              onClick={() => toggleOffering(item._id)}
                              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${added
                                ? "bg-[#ff7f0a] text-white"
                                : "border border-[#ff7f0a] text-[#ff7f0a] hover:bg-[#fff8f0]"
                                }`}
                            >
                              {added ? "✓ Added" : "+ Add"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* What's Included */}
              {pooja.includes && pooja.includes.length > 0 && (
                <div className="bg-[#fff8f0] border border-[#ffd9a8] rounded-2xl p-5">
                  <h3 className="font-display font-semibold text-[#1a1209] mb-3">
                    What's Included
                  </h3>
                  {pooja.includes.map((item: string) => (
                    <div
                      key={item}
                      className="flex items-center gap-2 text-sm text-[#6b5b45] py-1.5 border-b border-[#f0dcc8] last:border-0"
                    >
                      <span className="text-[#ff7f0a]"></span> {item}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT: Booking Panel */}
            <div className="space-y-4">
              <div className="bg-white border border-[#f0dcc8] rounded-2xl p-5 shadow-card sticky top-24">
                <h3 className="font-display font-semibold text-[#1a1209] mb-4">
                  Book This Pooja
                </h3>



                {/* Selected offerings summary */}
                {addedOfferings.length > 0 && (
                  <div className="mb-4 pb-4 border-b border-[#f0dcc8]">
                    <p className="text-xs text-[#6b5b45] font-semibold mb-2">
                      Selected Offerings:
                    </p>
                    {addedOfferings.map((id) => {
                      const o = offerings.find((x: any) => x._id === id);
                      return o ? (
                        <div
                          key={id}
                          className="flex justify-between items-center text-xs text-[#6b5b45] mb-1"
                        >
                          <span>
                            <div className="inline-flex items-center gap-2">
                              {o.image ? (
                                <img src={o.image} alt={o.name} className="w-4 h-4 rounded-sm object-cover" />
                              ) : (
                                <svg className="w-3 h-3 text-amber-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              )}
                              {o.name}
                            </div>
                          </span>
                          <span className="font-semibold">
                            {formatCurrency(currency === "USD" ? convertINRtoUSD(o.price, exchangeRate) : o.price, currency)}
                          </span>
                        </div>
                      ) : null;
                    })}
                  </div>
                )}

                {/* Total Price or Note */}
                <div className="bg-[#fff8f0] border border-[#ffd9a8] rounded-xl p-3 mb-4">
                  {selectedPackageIndex !== null && (
                    <div className="flex justify-between items-center text-sm font-semibold text-[#1a1209] mb-2">
                       <span>Package: {pooja.packages[selectedPackageIndex].name}</span>
                       <span>
                         {formatCurrency(currency === "USD" ? convertINRtoUSD(pooja.packages[selectedPackageIndex].price, exchangeRate) : pooja.packages[selectedPackageIndex].price, currency)}
                       </span>
                     </div>
                  )}
                  {addedOfferings.length > 0 && (
                    <div className="flex justify-between items-center text-sm font-semibold text-[#1a1209] mb-2 pt-2 border-t border-[#ffd9a8]">
                      <span>Offerings Total:</span>
                      <span>
                        {(() => {
                          const sum = addedOfferings.reduce((acc, id) => {
                            const o = offerings.find((x: any) => x._id === id);
                            return acc + (o ? o.price : 0);
                          }, 0);
                          return formatCurrency(currency === "USD" ? convertINRtoUSD(sum, exchangeRate) : sum, currency);
                        })()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-lg font-bold text-[#ff7f0a] mt-2 pt-2 border-t border-[#ffd9a8]">
                    <span>Total Payable:</span>
                    <span>
                      {(() => {
                        const total = (selectedPackageIndex !== null ? pooja.packages[selectedPackageIndex].price : 0) + 
                          addedOfferings.reduce((acc, id) => {
                            const o = offerings.find((x: any) => x._id === id);
                            return acc + (o ? o.price : 0);
                          }, 0);
                        return formatCurrency(currency === "USD" ? convertINRtoUSD(total, exchangeRate) : total, currency);
                      })()}
                    </span>
                  </div>
                </div>

                {/* Date and Package indicators */}
                <div className="space-y-2 mb-4">
                  {selectedDate !== null ? (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-xs text-green-700 text-center">
                      Pooja on: <strong>{dates[selectedDate].full}</strong>
                    </div>
                  ) : (
                    <div className="bg-[#fff8f0] border border-[#ffd9a8] rounded-xl p-3 text-xs text-[#ff7f0a] text-center">
                      Please select a date
                    </div>
                  )}

                  {selectedPackageIndex === null && (
                    <div className="bg-[#fff8f0] border border-[#ffd9a8] rounded-xl p-3 text-xs text-[#ff7f0a] text-center">
                      Please select a package
                    </div>
                  )}
                </div>

                <Link
                  href={checkoutLink}
                  onClick={handleProceedClick}
                  className={`btn-saffron w-full text-center text-sm block mb-3 transition-all ${showValidation && (selectedDate === null || selectedPackageIndex === null || selectedTempleId === null) ? "bg-red-500 border-red-500 shadow-none scale-[0.98]" : ""}`}
                >
                  Proceed to Book →
                </Link>

                <button
                  onClick={handleAddToCart}
                  className="w-full flex items-center justify-center gap-2 text-sm font-bold text-[#ff7f0a] border-2 border-[#ff7f0a] py-3 rounded-xl hover:bg-[#fff8f0] transition-colors mb-3"
                >
                  <ShoppingBag size={18} />
                  Add to Cart
                </button>

                <p className="text-center text-xs text-[#6b5b45] flex items-center justify-center gap-1">
                  <Shield size={12} className="text-green-500" />
                  Secured by Razorpay · 100% Safe
                </p>

              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
