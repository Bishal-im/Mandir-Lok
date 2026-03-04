"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Search, MapPin, ChevronRight, Filter, Sparkles, Heart } from "lucide-react";
import { getUserFavorites, toggleChadhavaFavorite } from "@/lib/actions/user";
import { getSettings } from "@/lib/actions/admin";
import { useLanguage } from "@/lib/context/LanguageContext";

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
  tag: string;
  tagColor: string;
  templeId: Temple;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "all", name: "All Offerings", icon: "" },
  { id: "Bhog", name: "Prasad & Bhog", icon: "" },
  { id: "Vastra", name: "Shringar & Vastra", icon: "" },
  { id: "Deep Daan", name: "Deep & Oil", icon: "" },
  { id: "Flowers", name: "Pushpa & Mala", icon: "" },
  { id: "Seva", name: "Special Seva", icon: "" },
];

// ── Chadhava Card ─────────────────────────────────────────────────────────────
function ChadhavaCard({
  item,
  isFavorite,
  onToggle
}: {
  item: Chadhava;
  isFavorite: boolean;
  onToggle: (id: string) => void;
}) {
  const { t } = useLanguage();
  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 flex flex-col h-full">
      {/* Image Area */}
      <div className="relative h-52 overflow-hidden bg-gradient-to-br from-orange-800/60 to-red-900/70 flex items-center justify-center">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <span className="text-5xl group-hover:scale-110 transition-transform duration-500 relative z-10">
            {item.emoji || ""}
          </span>
        )}

        {item.tag && (
          <span
            className={`absolute top-3 left-3 ${item.tagColor || "bg-orange-500"} text-white text-xs font-bold px-3 py-1 rounded-full`}
          >
            {item.tag}
          </span>
        )}

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggle(item._id);
          }}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm z-20 ${isFavorite ? "bg-red-500 text-white" : "bg-white/80 text-gray-400 hover:text-red-500 hover:bg-white"
            }`}
        >
          <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
        </button>

        <div className="absolute bottom-3 right-3">
          <span className="bg-black/60 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm">
            {item.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-gray-900 text-base mb-2 line-clamp-2 leading-snug">
          {item.name}
        </h3>

        {/* Temple */}
        <div className="flex items-start gap-1.5 mb-1.5">
          <MapPin size={14} className="text-orange-500 shrink-0 mt-0.5" />
          <span className="text-xs text-gray-500 line-clamp-1">
            {item.templeId?.name || "Sacred Temple"}
          </span>
        </div>

        <p className="text-xs text-gray-400 line-clamp-2 mb-4">
          {item.description}
        </p>

        {/* Price + CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">{t('chadhava.contribution')}</p>
            <p className="text-lg font-black text-orange-600">₹{item.price}</p>
          </div>
          <Link
            href={`/chadhava/${item._id}`}
            className="inline-flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-5 py-2.5 rounded-full transition-all duration-200 hover:shadow-lg hover:shadow-orange-200"
          >
            {t('chadhava.offerSeva')}
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

// ── Donation Card ─────────────────────────────────────────────────────────────
function DonationCard({ temples }: { temples: Temple[] }) {
  const [selectedTemple, setSelectedTemple] = useState("");
  const [amount, setAmount] = useState("");
  const router = useRouter();
  const { t } = useLanguage();

  const handleDonate = () => {
    if (!selectedTemple) return alert("Please select a temple");
    if (!amount || parseInt(amount) < 1) return alert("Please enter a valid amount");

    router.push(`/cart?templeId=${selectedTemple}&isDonation=true&customAmount=${amount}`);
  };

  return (
    <div className="bg-gradient-to-br from-amber-500 to-orange-700 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl h-full flex flex-col justify-between">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>

      <div className="relative z-10">
        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
          <Heart size={24} className="text-white fill-white" />
        </div>
        <h3 className="text-2xl font-black mb-2">{t('chadhava.donationTitle')}</h3>
        <p className="text-white/80 text-[11px] leading-relaxed mb-6">
          {t('chadhava.donationDesc')}
        </p>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-white/60">{t('chadhava.selectTemple')}</label>
            <select
              value={selectedTemple}
              onChange={(e) => setSelectedTemple(e.target.value)}
              className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:bg-white/20 transition-all custom-select"
            >
              <option value="" className="text-gray-900">Choose a temple...</option>
              {temples.map(t => (
                <option key={t._id} value={t._id} className="text-gray-900">{t.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-white/60">{t('chadhava.donationAmount')}</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 font-bold text-xs">₹</span>
              <input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl pl-8 pr-4 py-2.5 text-xs text-white placeholder:text-white/40 focus:outline-none focus:bg-white/20 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleDonate}
        className="w-full bg-white text-orange-700 font-bold py-3.5 rounded-2xl shadow-xl hover:bg-amber-50 active:scale-[0.98] transition-all mt-8 text-sm"
      >
        {t('chadhava.proceedDonate')}
      </button>
    </div>
  );
}

// ── Page Banner ───────────────────────────────────────────────────────────────
function PageBanner({ bannerBg }: { bannerBg?: string }) {
  const { t } = useLanguage();
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
              {t('home.heroTag')}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            {t('chadhava.title')}
          </h1>
          <p className="text-white/80 text-base max-w-xl leading-relaxed">
            {t('chadhava.subtitle')}
          </p>
        </div>
      </div>
    </section>
  );
}

export default function ChadhavaPage() {
  const { t, language } = useLanguage();
  const [items, setItems] = useState<Chadhava[]>([]);
  const [temples, setTemples] = useState<Temple[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [bannerBg, setBannerBg] = useState("");

  const categories = [
    { id: "all", name: t('common.filterAll'), icon: "" },
    { id: "Bhog", name: t('chadhava.offerSeva'), icon: "" }, // Simplified for matching
    { id: "Vastra", name: "Vastra", icon: "" },
    { id: "Deep Daan", name: "Deep Daan", icon: "" },
    { id: "Flowers", name: "Flowers", icon: "" },
    { id: "Seva", name: "Seva", icon: "" },
  ];

  useEffect(() => {
    async function fetchBanner() {
      try {
        const res = await getSettings("page_banners");
        if (res && res.value && res.value.chadhava) {
          setBannerBg(res.value.chadhava);
        }
      } catch (err) {
        console.error("Failed to fetch banner settings:", err);
      }
    }
    fetchBanner();

    async function fetchFavorites() {
      const res = await getUserFavorites();
      if (res.success && res.data) {
        setFavorites(res.data);
      }
    }
    async function fetchTemples() {
      try {
        const res = await fetch(`/api/temples?lang=${language}`);
        const data = await res.json();
        if (data.success) setTemples(data.data);
      } catch (e) {
        console.error("Failed to fetch temples", e);
      }
    }
    fetchFavorites();
    fetchTemples();
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (activeCategory !== "all") params.set("category", activeCategory);
        params.set("lang", language);

        const res = await fetch(`/api/chadhava?${params.toString()}`);
        const data = await res.json();

        if (data.success) {
          setItems(data.data);
        } else {
          setError("Failed to load chadhava offerings.");
        }
      } catch {
        setError("Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchItems, search ? 400 : 0);
    return () => clearTimeout(timer);
  }, [activeCategory, search, language]);

  const handleToggleFavorite = async (id: string) => {
    const res = await toggleChadhavaFavorite(id);
    if (res.success) {
      setFavorites(prev =>
        res.isAdded ? [...prev, id] : prev.filter(fid => fid !== id)
      );
    } else {
      alert(res.message || "Failed to toggle favorite");
    }
  };

  // Sort items: favorites first
  const sortedItems = [...items].sort((a, b) => {
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

        {/* Dynamic Filters & Search */}
        <div className="sticky top-20 z-40 bg-[#fdfaf5]/80 backdrop-blur-xl border-y border-amber-50 py-6">
          <div className="container-app space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Categories */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto pb-2 md:pb-0">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-300 ${activeCategory === cat.id
                      ? "bg-amber-500 text-white shadow-lg shadow-amber-200"
                      : "bg-white text-gray-600 hover:bg-amber-50 border border-amber-100 shadow-sm"
                      }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-80 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
                <input
                  type="text"
                  placeholder={t('common.searchPlaceholder')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-amber-100 rounded-[1.25rem] text-xs focus:outline-none focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500 transition-all shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="container-app py-12">
          {/* Results Summary */}
          {!loading && !error && (
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2 text-gray-400 text-xs">
                <Filter size={14} />
                <span>Showing <span className="text-gray-900 font-bold">{items.length}</span> results</span>
              </div>
            </div>
          )}

          {/* Grid */}
          {error ? (
            <div className="text-center py-20 bg-white rounded-[3rem] border border-amber-100 shadow-sm">
              <div className="text-5xl mb-4"></div>
              <p className="text-red-500 text-sm mb-6 font-medium">{error}</p>
              <button onClick={() => setSearch("")} className="btn-primary">Try Again</button>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : sortedItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {/* Standalone Donation Card - Inserted as the first or specific position */}
              <div className="sm:col-span-1 lg:col-span-1 xl:col-span-1">
                <DonationCard temples={temples} />
              </div>

              {sortedItems.map((item) => (
                <ChadhavaCard
                  key={item._id}
                  item={item}
                  isFavorite={favorites.includes(item._id)}
                  onToggle={handleToggleFavorite}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-white rounded-[3rem] border border-amber-100 shadow-sm">
              <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-amber-200" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('common.noResults')}</h3>
              <p className="text-gray-500 text-xs mb-8">Try adjusting your filters or search terms.</p>
              <button onClick={() => { setSearch(""); setActiveCategory("all"); }} className="btn-primary">{t('common.clearFilters')}</button>
            </div>
          )}
        </div>

        {/* Support Section */}
        <section className="container-app py-12 pb-20">
          <div className="bg-gradient-to-br from-amber-600 to-orange-700 rounded-[3rem] p-10 md:p-16 text-center text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
            <div className="relative z-10 space-y-6">
              <h2 className="text-3xl md:text-4xl font-black">{t('chadhava.specialSevaTitle')}</h2>
              <p className="max-w-lg mx-auto text-white/80 text-sm leading-relaxed">
                {t('chadhava.specialSevaDesc')}
              </p>
              <div className="flex flex-wrap justify-center gap-4 pt-4">
                <a href="https://wa.me/yournumber" className="bg-white text-amber-700 font-bold px-8 py-3 rounded-2xl hover:bg-amber-50 transition-colors shadow-lg">{t('chadhava.whatsappUs')}</a>
                <Link href="/contact" className="bg-white/10 backdrop-blur-md border border-white/30 text-white font-bold px-8 py-3 rounded-2xl hover:bg-white/20 transition-colors">{t('chadhava.contactSupport')}</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
