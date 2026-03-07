"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getSettings } from "@/lib/actions/admin";
import { useCurrency } from "@/context/CurrencyContext";
import { convertINRtoUSD, formatCurrency } from "@/lib/currency";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Temple {
  _id: string;
  name: string;
  location: string;
  slug: string;
}

interface Pooja {
  _id: string;
  name: string;
  slug: string;
  templeIds: Temple[];
  deity: string;
  emoji: string;
  description: string;
  price: number;
  duration: string;
  benefits: string[];
  tag: string;
  tagColor: string;
  rating: number;
  totalReviews: number;
  availableDays: string;
  images: string[];
}

// ── Constants ─────────────────────────────────────────────────────────────────
const FILTERS = [
  "All Pujas",
  "Shiva",
  "Vishnu",
  "Devi",
  "Ganesha",
  "Surya",
  "Navgraha",
];
const SORT_OPTIONS = [
  "Most Popular",
  "Price: Low to High",
  "Price: High to Low",
  "A-Z",
];

// ── Pooja Card ────────────────────────────────────────────────────────────────
function PujaCard({ puja }: { puja: Pooja }) {
  const { currency, exchangeRate } = useCurrency();
  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 flex flex-col">
      {/* Image Area */}
      <div className="relative h-52 overflow-hidden bg-gradient-to-br from-orange-800/60 to-red-900/70 flex items-center justify-center">
        {puja.images?.[0] ? (
          <img
            src={puja.images[0]}
            alt={puja.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <>
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
              }}
            />
            <span className="text-5xl group-hover:scale-110 transition-transform duration-500 relative z-10">
              {puja.emoji || ""}
            </span>
          </>
        )}
        {puja.tag && (
          <span
            className={`absolute top-3 left-3 ${puja.tagColor} text-white text-xs font-bold px-3 py-1 rounded-full`}
          >
            {puja.tag}
          </span>
        )}
        <div className="absolute bottom-3 right-3">
          <span className="bg-black/60 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm">
            {puja.deity}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-gray-900 text-base mb-2 line-clamp-2 leading-snug">
          {puja.name}
        </h3>

        {/* Temple */}
        <div className="flex items-start gap-1.5 mb-1.5">
          <svg
            className="w-3.5 h-3.5 text-orange-400 mt-0.5 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
          </svg>
          <p className="text-xs text-gray-500 line-clamp-1">
            {puja.templeIds?.[0]?.name} {puja.templeIds?.length > 1 && `+ ${puja.templeIds.length - 1} more`}
          </p>
        </div>

        {/* Available Days */}
        <div className="flex items-center gap-1.5 mb-3">
          <svg
            className="w-3.5 h-3.5 text-orange-400 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-xs text-gray-500 font-medium">
            {puja.availableDays}
          </p>
        </div>

        <p className="text-xs text-gray-600 mb-4 line-clamp-2 leading-relaxed flex-1">
          {puja.description}
        </p>

        {/* Benefits */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {puja.benefits?.slice(0, 2).map((b) => (
            <span
              key={b}
              className="bg-orange-50 text-orange-700 text-xs px-2 py-0.5 rounded-full border border-orange-100"
            >
              {b}
            </span>
          ))}
        </div>

        {/* Duration + CTA - Price removed */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
          <div className="flex flex-col">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Starting from</p>
            <span className="text-amber-700 font-bold">{formatCurrency(currency === "USD" ? convertINRtoUSD(puja.price, exchangeRate) : puja.price, currency)}</span>
          </div>
          <div>
            <p className="text-xs text-gray-400">{puja.duration}</p>
          </div>
          <Link
            href={`/poojas/${puja.slug || puja._id}`}
            className="inline-flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-5 py-2.5 rounded-full transition-all duration-200 hover:shadow-lg hover:shadow-orange-200"
          >
            Participate Puja
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Skeleton Card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
      <div className="h-52 bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-8 bg-gray-200 rounded w-full mt-4" />
      </div>
    </div>
  );
}

// ── Page Banner ───────────────────────────────────────────────────────────────
function PageBanner({ bannerBg }: { bannerBg?: string }) {
  return (
    <section className="relative h-64 md:h-80 overflow-hidden">
      {bannerBg ? (
        <img
          src={bannerBg}
          alt="Banner"
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#3d0a00] to-[#1a0500]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-[#1a0500]/90 via-[#2d0a00]/70 to-transparent" />
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex flex-wrap gap-3 mb-4">
            <span className="bg-orange-500/90 text-white text-xs font-bold px-3 py-1.5 rounded-full">
              Divine Blessings through Puja
            </span>
            <span className="bg-white/10 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
              Vedic Rituals by Expert Pandits
            </span>
            <span className="bg-white/10 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
              Video in 24–48 Hours
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Mandirlok Special Pujas
          </h1>
          <p className="text-white/80 text-base max-w-xl leading-relaxed">
            Get authentic Vedic pujas performed at India's most powerful temples
            on your behalf.
          </p>
        </div>
      </div>
    </section>
  );
}

// ── How It Works Banner ───────────────────────────────────────────────────────
function HowItWorksBanner() {
  const steps = [
    {
      title: "Choose Puja",
      desc: "Select from 200+ authentic pujas across India's sacred temples",
    },
    {
      title: "Enter Your Name",
      desc: "Panditji will chant your name in the Sankalp during the puja",
    },
    {
      title: "Secure Payment",
      desc: "Pay securely via UPI, card or net banking through Razorpay",
    },
    {
      title: "Get Puja Video",
      desc: "Receive the video proof of your completed puja within 24–48 hrs",
    },
  ];
  return (
    <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-b border-orange-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div key={i} className="flex items-start">
              <div>
                <h4 className="font-bold text-gray-900 text-sm mb-0.5">
                  {s.title}
                </h4>
                <p className="text-gray-500 text-xs leading-relaxed">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────
export default function PoojasPage() {
  const [poojas, setPoojas] = useState<Pooja[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("All Pujas");
  const [sortBy, setSortBy] = useState("Most Popular");
  const [search, setSearch] = useState("");
  const [bannerBg, setBannerBg] = useState("");

  // Fetch poojas from API
  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const res = await getSettings("page_banners");
        if (res && res.value && res.value.poojas) {
          setBannerBg(res.value.poojas);
        }
      } catch (err) {
        console.error("Failed to fetch banner settings:", err);
      }
    };
    fetchBanner();

    const fetchPoojas = async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();
        if (activeFilter !== "All Pujas") params.set("deity", activeFilter);
        if (search) params.set("search", search);

        const res = await fetch(`/api/poojas?${params.toString()}`);
        const data = await res.json();

        if (data.success) {
          let result: Pooja[] = data.data;

          // Client-side sorting
          if (sortBy === "Price: Low to High")
            result = [...result].sort((a, b) => a.price - b.price);
          if (sortBy === "Price: High to Low")
            result = [...result].sort((a, b) => b.price - a.price);
          if (sortBy === "A-Z")
            result = [...result].sort((a, b) => a.name.localeCompare(b.name));

          setPoojas(result);
        } else {
          setError("Failed to load poojas.");
        }
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchPoojas, search ? 400 : 0);
    return () => clearTimeout(timer);
  }, [activeFilter, sortBy, search]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 font-sans">
        <PageBanner bannerBg={bannerBg} />
        <HowItWorksBanner />

        {/* Sticky Filter Bar */}
        <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-2 overflow-x-auto py-3 no-scrollbar">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${activeFilter === f
                    ? "bg-orange-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search + Sort */}
          <div className="flex flex-wrap gap-4 items-center mb-8">
            <div className="relative flex-1 min-w-[200px]">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search pujas, temples, deities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white text-gray-700"
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <span className="text-sm text-gray-400 ml-auto">
              {loading ? "Loading..." : `${poojas.length} pujas found`}
            </span>
          </div>

          {/* Error */}
          {error && (
            <div className="text-center py-10">
              <p className="text-red-500 text-sm mb-4">{error}</p>
              <button
                onClick={() => {
                  setSearch("");
                  setActiveFilter("All Pujas");
                }}
                className="bg-orange-500 text-white px-6 py-2.5 rounded-full text-sm font-semibold"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Loading Skeletons */}
          {loading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* Puja Grid */}
          {!loading && !error && poojas.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {poojas.map((puja) => (
                <PujaCard key={puja._id} puja={puja} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && poojas.length === 0 && (
            <div className="text-center py-20">
            <div className="text-6xl mb-4"></div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                No pujas found
              </h3>
              <p className="text-gray-500 mb-6">
                Try a different filter or search keyword
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setActiveFilter("All Pujas");
                }}
                className="bg-orange-500 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-orange-600 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}