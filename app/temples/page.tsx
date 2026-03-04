"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import { Search, MapPin, ChevronRight, Heart, Star } from "lucide-react";
import { getUserTempleFavorites, toggleTempleFavorite } from "@/lib/actions/user";
import { getSettings } from "@/lib/actions/admin";
import { getLocalizedValue } from "@/lib/utils/localization";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Temple {
  _id: string;
  name: string;
  slug: string;
  location: string;
  city: string;
  state: string;
  category: string;
  deity: string;
  description: string;
  rating: number;
  totalReviews: number;
  pujasAvailable: number;
  isPopular: boolean;
  isFeatured: boolean;
  images: string[];
}

// ── Constants ─────────────────────────────────────────────────────────────────
const CATEGORIES = [
  "All Temples",
  "Jyotirlinga",
  "Shaktipeeth",
  "Vaishnavite",
  "Char Dham",
  "Famous Temples",
];

const STATES = [
  "All States",
  "Uttar Pradesh",
  "Gujarat",
  "Rajasthan",
  "Uttarakhand",
  "Maharashtra",
  "Tamil Nadu",
  "Himachal Pradesh",
  "Madhya Pradesh",
];

// ── Image Placeholder ─────────────────────────────────────────────────────────
function ImagePlaceholder({ label = "", className = "" }: { label?: string; className?: string }) {
  return (
    <div className={`relative bg-gradient-to-br from-orange-800/60 to-red-950/70 flex items-center justify-center overflow-hidden ${className}`}>
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.8'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E\")",
        }}
      />
      <div className="flex flex-col items-center text-white/50 gap-1 z-10 p-4">
        <span className="text-3xl"></span>
        {label && <p className="text-xs text-center line-clamp-2 max-w-[120px]">{label}</p>}
      </div>
    </div>
  );
}

// ── Temple Card ───────────────────────────────────────────────────────────────
function TempleCard({
  temple,
  isFavorite,
  onToggle
}: {
  temple: Temple;
  isFavorite: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 flex flex-col h-full cursor-pointer">
      {/* Link Overlay */}
      <Link href={`/temples/${temple.slug || temple._id}`} className="absolute inset-0 z-0" />

      {/* Image */}
      <div className="relative h-52 overflow-hidden z-10">
        {temple.images?.[0] ? (
          <img
            src={temple.images[0]}
            alt={getLocalizedValue(temple.name)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <ImagePlaceholder
            className="w-full h-full group-hover:scale-105 transition-transform duration-500"
            label={getLocalizedValue(temple.name)}
          />
        )}

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggle(temple._id);
          }}
          className={`absolute top-3 right-3 w-9 h-9 backdrop-blur-md rounded-xl flex items-center justify-center transition-all shadow-sm z-20 ${isFavorite
            ? "bg-rose-500 text-white"
            : "bg-white/80 text-gray-400 hover:text-rose-500 hover:bg-white"
            }`}
        >
          <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
        </button>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {temple.isFeatured && (
            <span className="bg-orange-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-lg shadow-lg">
              NEW
            </span>
          )}
          {temple.isPopular && (
            <span className="bg-rose-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-lg shadow-lg">
              POPULAR
            </span>
          )}
        </div>

        {/* Category Tag */}
        <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
          <span className="bg-black/60 text-white text-[10px] font-medium px-2.5 py-1 rounded-lg backdrop-blur-sm">
            {temple.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 z-10 pointer-events-none">
        <h3 className="font-bold text-gray-900 text-base mb-1 line-clamp-1 group-hover:text-orange-600 transition-colors">{getLocalizedValue(temple.name)}</h3>

        <div className="flex items-center gap-1.5 mb-2">
          <MapPin size={12} className="text-orange-400" />
          <span className="text-xs text-gray-500 font-medium">
            {temple.city}, {temple.state}
          </span>
        </div>

        <p className="text-xs text-gray-500 mb-4 leading-relaxed line-clamp-2 flex-1">{getLocalizedValue(temple.description)}</p>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
          <div className="flex items-center gap-1">
            <Star size={14} className="text-amber-400 fill-current" />
            <span className="text-sm font-bold text-gray-900">{temple.rating}</span>
            <span className="text-[10px] text-gray-400 font-medium">({temple.totalReviews?.toLocaleString()})</span>
          </div>
          <div className="flex items-center gap-1 text-orange-600 font-bold">
            <span className="text-[10px] uppercase tracking-tighter">{temple.pujasAvailable} Pujas</span>
            <ChevronRight size={14} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Skeleton Card (loading state) ─────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
      <div className="h-52 bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
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
          <p className="text-orange-400 text-xs font-bold tracking-[0.2em] uppercase mb-4 flex items-center gap-2">
            <span className="w-8 h-[1px] bg-orange-500"></span> Mandirlok Sacred Services
          </p>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Temples
          </h1>
          <p className="text-white/80 text-base max-w-xl leading-relaxed">
            Connect with holy pilgrimage sites and divine temples of India. Book pooja from the comfort of your home.
          </p>
        </div>
      </div>
    </section>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────
export default function TemplesPage() {
  const [temples, setTemples] = useState<Temple[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Temples");
  const [activeState, setActiveState] = useState("All States");
  const [search, setSearch] = useState("");
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [bannerBg, setBannerBg] = useState("");

  const categories = [
    { id: "All Temples", label: "All Temples" },
    { id: "Jyotirlinga", label: "Jyotirlinga" },
    { id: "Shaktipeeth", label: "Shaktipeeth" },
    { id: "Vaishnavite", label: "Vaishnavite" },
    { id: "Char Dham", label: "Char Dham" },
    { id: "Famous Temples", label: "Famous Temples" },
  ];

  const states = [
    { id: "All States", label: "All States" },
    { id: "Uttar Pradesh", label: "Uttar Pradesh" },
    { id: "Gujarat", label: "Gujarat" },
    { id: "Rajasthan", label: "Rajasthan" },
    { id: "Uttarakhand", label: "Uttarakhand" },
    { id: "Maharashtra", label: "Maharashtra" },
    { id: "Tamil Nadu", label: "Tamil Nadu" },
    { id: "Himachal Pradesh", label: "Himachal Pradesh" },
    { id: "Madhya Pradesh", label: "Madhya Pradesh" },
  ];

  // Fetch settings on mount
  useEffect(() => {
    async function fetchBanner() {
      try {
        const res = await getSettings("page_banners");
        if (res && res.value && res.value.temples) {
          setBannerBg(res.value.temples);
        }
      } catch (err) {
        console.error("Failed to fetch banner settings:", err);
      }
    }
    fetchBanner();

    async function fetchFavorites() {
      const res = await getUserTempleFavorites();
      if (res.success && res.data) {
        setFavorites(res.data);
      }
    }
    fetchFavorites();
  }, []);

  // Fetch temples from API
  useEffect(() => {
    const fetchTemples = async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();
        if (activeCategory !== "All Temples") params.set("category", activeCategory);
        if (activeState !== "All States") params.set("state", activeState);
        if (showFeaturedOnly) params.set("featured", "true");
        if (search) params.set("search", search);
        params.set("lang", 'en');

        const res = await fetch(`/api/temples?${params.toString()}`);
        const data = await res.json();

        if (data.success) {
          setTemples(data.data);
        } else {
          setError("Failed to load temples.");
        }
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchTemples, search ? 400 : 0);
    return () => clearTimeout(timer);
  }, [activeCategory, activeState, showFeaturedOnly, search]);

  const handleToggleFavorite = async (id: string) => {
    const res = await toggleTempleFavorite(id);
    if (res.success) {
      setFavorites(prev =>
        res.isAdded ? [...prev, id] : prev.filter(fid => fid !== id)
      );
    } else {
      alert(res.message || "Failed to toggle favorite");
    }
  };

  // Sort temples: favorites first
  const sortedTemples = [...temples].sort((a, b) => {
    const aFav = favorites.includes(a._id);
    const bFav = favorites.includes(b._id);
    if (aFav && !bFav) return -1;
    if (!aFav && bFav) return 1;
    return 0;
  });

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 font-sans">
        <PageBanner bannerBg={bannerBg} />

        {/* Filter Bar */}
        <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-2 overflow-x-auto py-3 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${activeCategory === cat.id
                    ? "bg-orange-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search + Filters Row */}
          <div className="flex flex-wrap gap-4 items-center mb-8">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search temples, cities, deities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
              />
            </div>

            {/* State Filter */}
            <select
              value={activeState}
              onChange={(e) => setActiveState(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white text-gray-700"
            >
              {states.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>

            {/* Featured Toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <div
                className={`w-10 h-5 rounded-full transition-colors duration-200 relative ${showFeaturedOnly ? "bg-orange-500" : "bg-gray-200"}`}
                onClick={() => setShowFeaturedOnly((v) => !v)}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${showFeaturedOnly ? "translate-x-5" : "translate-x-0.5"}`} />
              </div>
              <span className="text-sm text-gray-600 font-medium">Featured Only</span>
            </label>

            <span className="text-sm text-gray-400 ml-auto">
              {loading ? "Loading..." : `${temples.length} temples found`}
            </span>
          </div>

          {/* Error State */}
          {error && (
            <div className="text-center py-10">
              <p className="text-red-500 text-sm mb-4">{error}</p>
              <button
                onClick={() => { setSearch(""); setActiveCategory("All Temples"); }}
                className="bg-orange-500 text-white px-6 py-2.5 rounded-full text-sm font-semibold"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Loading Skeletons */}
          {loading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* Temple Grid */}
          {!loading && !error && sortedTemples.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedTemples.map((temple) => (
                <TempleCard
                  key={temple._id}
                  temple={temple}
                  isFavorite={favorites.includes(temple._id)}
                  onToggle={handleToggleFavorite}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && temples.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4"></div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">No Results Found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your filters or search terms.</p>
              <button
                onClick={() => {
                  setSearch("");
                  setActiveCategory("All Temples");
                  setActiveState("All States");
                  setShowFeaturedOnly(false);
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