"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StarRating from "@/components/ui/StarRating";
import Badge from "@/components/ui/Badge";
import { MapPin, Clock, Globe, Phone, ChevronRight, Heart } from "lucide-react";
import { getUserTempleFavorites, toggleTempleFavorite } from "@/lib/actions/user";

// ── Types ──────────────────────────────────────────────────────────────────────
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
  about: string;
  images: string[];
  rating: number;
  totalReviews: number;
  ratingDistribution?: Record<number, number>;
  pujasAvailable: number;
  openTime: string;
  phone: string;
  website: string;
  mapUrl: string;
}

interface Pooja {
  _id: string;
  name: string;
  slug: string;
  emoji: string;
  description: string;
  price: number;
  duration: string;
  tag: string;
  tagColor: string;
  rating: number;
  totalReviews: number;
  availableDays: string;
  benefits: string[];
  isFeatured: boolean;
  images: string[];
}

interface ChadhavaItem {
  _id: string;
  name: string;
  emoji: string;
  image?: string;
  price: number;
  description: string;
}

// ── Image Placeholder (matches temples/page.tsx style) ────────────────────────
function ImagePlaceholder({
  label = "",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={`relative bg-gradient-to-br from-orange-800/60 to-red-950/70 flex items-center justify-center overflow-hidden ${className}`}
    >
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.8'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E\")",
        }}
      />
      <div className="flex flex-col items-center text-white/50 gap-1 z-10 p-4">
        <span className="text-4xl"></span>
        {label && (
          <p className="text-xs text-center line-clamp-2 max-w-[140px]">
            {label}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Pooja Row (horizontal card for sidebar + main list) ───────────────────────
function PoojaRow({
  pooja,
  showPrice = true,
}: {
  pooja: Pooja;
  showPrice?: boolean;
}) {
  return (
    <Link
      href={`/poojas/${pooja.slug}`}
      className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-[#fff8f0] border border-transparent hover:border-[#ffd9a8] transition-all"
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gray-50 flex-shrink-0 overflow-hidden flex items-center justify-center">
          {pooja.images && pooja.images.length > 0 ? (
            <img src={pooja.images[0]} alt={pooja.name} className="w-full h-full object-cover" />
          ) : (
            <svg className="w-4 h-4 text-amber-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
        </div>
        <div>
          <p className="text-xs font-semibold text-[#1a1209] line-clamp-1">
            {pooja.name}
          </p>
          <p className="text-[10px] text-[#6b5b45]">{pooja.duration}</p>
        </div>
      </div>
      {showPrice && (
        <span className="text-xs font-bold text-[#ff7f0a] shrink-0 ml-2">
          ₹{pooja.price?.toLocaleString()}
        </span>
      )}
    </Link>
  );
}

// ── Pooja Card (horizontal, main list) ───────────────────────────────────────
function PoojaCard({ pooja }: { pooja: Pooja }) {
  return (
    <Link
      href={`/poojas/${pooja.slug}`}
      className="group flex gap-4 bg-white border border-[#f0dcc8] rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-[#ffbd6e] transition-all"
    >
      {/* Emoji / image thumb */}
      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-50 to-amber-100 flex items-center justify-center shrink-0 relative overflow-hidden">
        {pooja.images && pooja.images.length > 0 ? (
          <img src={pooja.images[0]} alt={pooja.name} className="w-full h-full object-cover" />
        ) : (
          <svg className="w-8 h-8 text-amber-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )}
        {pooja.tag && (
          <span
            className={`absolute top-1 left-1 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full ${pooja.tagColor || "bg-orange-500"}`}
          >
            {pooja.tag}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-[#1a1209] text-sm group-hover:text-[#ff7f0a] transition-colors line-clamp-1">
          {pooja.name}
        </h3>
        <p className="text-[#6b5b45] text-xs line-clamp-1 mb-2">
          {pooja.description}
        </p>

        <div className="flex items-center gap-3 text-[10px] text-[#6b5b45]">
          <span className="flex items-center gap-1">
            <Clock size={10} /> {pooja.duration}
          </span>
          <span className="flex items-center gap-1">
            {pooja.rating?.toFixed(1)} ({pooja.totalReviews?.toLocaleString()})
          </span>
          <span className="text-[#ff7f0a]">{pooja.availableDays}</span>
        </div>
      </div>

      <div className="shrink-0 text-right flex flex-col items-end justify-center">
        <span className="text-[10px] bg-[#fff8f0] border border-[#ffd9a8] text-[#ff7f0a] font-semibold px-3 py-1.5 rounded-full">
          Book →
        </span>
      </div>
    </Link>
  );
}

// ── Loading Skeleton ───────────────────────────────────────────────────────────
function PageSkeleton() {
  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-[#fdf6ee]">
        {/* Hero skeleton */}
        <div className="h-72 md:h-96 bg-gray-200 animate-pulse" />
        <div className="container-app py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-6 animate-pulse space-y-3"
                >
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-5/6" />
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl p-5 animate-pulse h-64" />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function TempleDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [temple, setTemple] = useState<Temple | null>(null);
  const [poojas, setPoojas] = useState<Pooja[]>([]);
  const [chadhavaItems, setChadhavaItems] = useState<ChadhavaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [wishlisted, setWishlisted] = useState(false);

  // ── Fetch from real API ────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;

    async function fetchTempleAndStatus() {
      try {
        setLoading(true);
        const res = await fetch(`/api/temples/${id}`);
        const data = await res.json();

        if (!data.success) {
          setError(data.message || "Temple not found");
          return;
        }

        const templeData = data.data.temple;
        setTemple(templeData);
        setPoojas(data.data.poojas || []);
        setChadhavaItems(data.data.chadhavaItems || []);

        // Fetch favorites status
        const favRes = await getUserTempleFavorites();
        if (favRes.success && favRes.data && templeData) {
          setWishlisted(favRes.data.includes(templeData._id));
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load temple. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchTempleAndStatus();
  }, [id]);

  const handleToggleWishlist = async () => {
    if (!temple?._id) return;
    const res = await toggleTempleFavorite(temple._id);
    if (res.success) {
      setWishlisted(res.isAdded ?? !wishlisted);
    } else {
      alert(res.message || "Failed to toggle favorite");
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) return <PageSkeleton />;

  // ── Error / Not Found ──────────────────────────────────────────────────────
  if (error || !temple) {
    return (
      <>
        <Navbar />
        <main className="pt-16 min-h-screen bg-[#fdf6ee] flex items-center justify-center">
          <div className="text-center max-w-sm px-4">
            <span className="text-6xl block mb-4"></span>
            <h2 className="text-xl font-bold text-[#1a1209] mb-2">
              Temple Not Found
            </h2>
            <p className="text-[#6b5b45] text-sm mb-6">
              {error || "This temple could not be found."}
            </p>
            <Link href="/temples" className="btn-primary text-sm">
              Browse All Temples
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ── Computed rating breakdown ──────────────────────────────────────────────
  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => {
    const count = temple.ratingDistribution?.[star] || 0;
    const percent = temple.totalReviews > 0
      ? Math.round((count / temple.totalReviews) * 100)
      : 0;
    return { star, percent };
  });

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-[#fdf6ee]">
        {/* ── Breadcrumb ────────────────────────────────────────────────── */}
        <div className="bg-white border-b border-[#f0dcc8]">
          <div className="container-app py-3 flex items-center gap-2 text-xs text-[#6b5b45]">
            <Link href="/" className="hover:text-[#ff7f0a] transition-colors">
              Home
            </Link>
            <ChevronRight size={12} />
            <Link
              href="/temples"
              className="hover:text-[#ff7f0a] transition-colors"
            >
              Temples
            </Link>
            <ChevronRight size={12} />
            <span className="text-[#1a1209] font-medium">{temple.name}</span>
          </div>
        </div>

        {/* ── Hero Image ────────────────────────────────────────────────── */}
        <div className="relative h-72 md:h-96 overflow-hidden">
          {temple.images?.[0] ? (
            <img
              src={temple.images[0]}
              alt={temple.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <ImagePlaceholder className="w-full h-full" label={temple.name} />
          )}

          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Overlaid info */}
          <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
            <div className="container-app">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <Badge variant="gold" className="mb-2">
                    {temple.deity}
                  </Badge>
                  <h1 className="font-display font-bold text-3xl md:text-4xl text-white mb-1 leading-tight">
                    {temple.name}
                  </h1>
                  <div className="flex items-center gap-1.5 text-white/80 text-sm">
                    <MapPin size={14} className="text-[#ffd9a8]" />
                    {temple.location}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-white/15 backdrop-blur border border-white/30 rounded-xl px-4 py-2 text-center">
                    <p className="text-xl font-bold text-[#ffd9a8]">
                      {temple.rating}
                    </p>
                    <StarRating
                      rating={temple.rating}
                      size={10}
                      className="justify-center"
                    />
                    <p className="text-white/70 text-[10px]">
                      {temple.totalReviews >= 1000
                        ? `${(temple.totalReviews / 1000).toFixed(1)}k`
                        : temple.totalReviews}{" "}
                      reviews
                    </p>
                  </div>
                  <button
                    onClick={handleToggleWishlist}
                    className="bg-white/15 backdrop-blur border border-white/30 rounded-xl p-3 text-white hover:bg-white/25 transition-colors"
                  >
                    <Heart
                      size={18}
                      className={
                        wishlisted ? "fill-rose-400 text-rose-400" : ""
                      }
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Content ──────────────────────────────────────────────── */}
        <div className="container-app py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* ── LEFT / MAIN ─────────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-6">
              {/* About */}
              <div className="bg-white border border-[#f0dcc8] rounded-2xl p-6 shadow-card">
                <h2 className="font-display font-semibold text-[#1a1209] mb-3">
                  About the Temple
                </h2>
                <p className="text-sm text-[#6b5b45] leading-relaxed mb-4">
                  {temple.about || temple.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#6b5b45]">
                  <div className="flex items-center gap-2 bg-[#fff8f0] border border-[#f0dcc8] rounded-xl p-2.5">
                    <Clock size={14} className="text-[#ff7f0a] flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-[#1a1209] text-[11px]">
                        Temple Hours
                      </p>
                      <p>{temple.openTime || "6:00 AM – 10:00 PM"}</p>
                    </div>
                  </div>
                  {temple.phone && (
                    <div className="flex items-center gap-2 bg-[#fff8f0] border border-[#f0dcc8] rounded-xl p-2.5">
                      <Phone
                        size={14}
                        className="text-[#ff7f0a] flex-shrink-0"
                      />
                      <div>
                        <p className="font-semibold text-[#1a1209] text-[11px]">
                          Contact
                        </p>
                        <p>{temple.phone}</p>
                      </div>
                    </div>
                  )}
                  {temple.website && (
                    <div className="flex items-center gap-2 bg-[#fff8f0] border border-[#f0dcc8] rounded-xl p-2.5">
                      <Globe
                        size={14}
                        className="text-[#ff7f0a] flex-shrink-0"
                      />
                      <div>
                        <p className="font-semibold text-[#1a1209] text-[11px]">
                          Website
                        </p>
                        <p className="truncate">{temple.website}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Gallery — only show if real images exist */}
              {temple.images?.length > 1 && (
                <div>
                  <h2 className="font-display font-semibold text-[#1a1209] mb-3">
                    Temple Gallery
                  </h2>
                  <div className="grid grid-cols-3 gap-2 rounded-2xl overflow-hidden">
                    {temple.images.slice(0, 3).map((img, i) => (
                      <div
                        key={img}
                        className={`relative overflow-hidden ${i === 0 ? "row-span-2 h-64" : "h-[7.75rem]"}`}
                      >
                        <img
                          src={img}
                          alt={`${temple.name} ${i + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Poojas */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display font-semibold text-[#1a1209]">
                    Poojas at This Temple
                  </h2>
                  <Badge variant="saffron">{poojas.length} Available</Badge>
                </div>

                {poojas.length === 0 ? (
                  <div className="bg-white border border-[#f0dcc8] rounded-2xl p-8 text-center">
                    <span className="text-4xl block mb-2"></span>
                    <p className="text-[#6b5b45] text-sm">
                      No poojas available at this temple yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {poojas.map((pooja) => (
                      <PoojaCard key={pooja._id} pooja={pooja} />
                    ))}
                  </div>
                )}
              </div>

              {/* Chadhava */}
              {chadhavaItems.length > 0 && (
                <div>
                  <h2 className="font-display font-semibold text-[#1a1209] mb-4">
                    Chadhava Offerings
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {chadhavaItems.map((item) => (
                      <div
                        key={item._id}
                        className="bg-white border border-[#f0dcc8] rounded-xl p-4 text-center hover:border-[#ffbd6e] hover:shadow-sm transition-all"
                      >
                        <div className="w-12 h-12 mx-auto rounded-lg bg-gray-50 flex-shrink-0 overflow-hidden flex items-center justify-center mb-2">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <svg className="w-6 h-6 text-amber-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-[#1a1209] mb-1">
                          {item.name}
                        </p>
                        {item.description && (
                          <p className="text-[10px] text-[#6b5b45] mb-2 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                        <Link
                          href={`/chadhava/${item._id}`}
                          className="block bg-gradient-to-r from-[#ff7f0a] to-[#ff9b30] text-white text-[10px] font-bold py-1.5 rounded-full hover:shadow-sm transition-all"
                        >
                          View Offering
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ratings Breakdown */}
              <div className="bg-white border border-[#f0dcc8] rounded-2xl p-6 shadow-card">
                <h2 className="font-display font-semibold text-[#1a1209] mb-4">
                  Ratings & Reviews
                </h2>
                <div className="flex items-center gap-8 mb-4">
                  <div className="text-center">
                    <p className="text-5xl font-display font-bold text-[#ff7f0a]">
                      {temple.rating}
                    </p>
                    <StarRating
                      rating={temple.rating}
                      size={14}
                      className="justify-center my-1"
                    />
                    <p className="text-xs text-[#6b5b45]">
                      {temple.totalReviews >= 1000
                        ? `${(temple.totalReviews / 1000).toFixed(1)}k`
                        : temple.totalReviews}{" "}
                      ratings
                    </p>
                  </div>
                  <div className="flex-1">
                    {ratingBreakdown.map(({ star, percent }) => (
                      <div
                        key={star}
                        className="flex items-center gap-2 mb-1.5"
                      >
                        <span className="text-xs text-[#6b5b45] w-4 text-right">
                          {star}
                        </span>
                        <span className="text-[#f0bc00] text-xs">★</span>
                        <div className="flex-1 bg-[#f0dcc8] rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-[#ff7f0a] h-full rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="text-xs text-[#6b5b45] w-8">
                          {percent}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="bg-white border border-[#f0dcc8] rounded-2xl overflow-hidden shadow-card">
                <div className="h-48 bg-gradient-to-br from-[#e8f4e8] to-[#d4e8d4] flex flex-col items-center justify-center gap-3">
                  <p className="text-4xl"></p>
                  <div className="text-center">
                    <p className="font-semibold text-[#1a1209] text-sm">
                      {temple.name}
                    </p>
                    <p className="text-xs text-[#6b5b45]">{temple.location}</p>
                  </div>
                  {temple.mapUrl && (
                    <a
                      href={temple.mapUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-gradient-to-r from-[#ff7f0a] to-[#ff9b30] text-white text-xs font-semibold px-5 py-2 rounded-full hover:shadow-sm transition-all"
                    >
                      Open in Google Maps →
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* ── RIGHT SIDEBAR ──────────────────────────────────────── */}
            <div className="space-y-5">
              {/* Quick Book */}
              <div className="bg-white border border-[#f0dcc8] rounded-2xl p-5 shadow-card sticky top-24">
                <h3 className="font-display font-semibold text-[#1a1209] mb-4">
                  Participate in a Pooja
                </h3>

                {poojas.length > 0 ? (
                  <>
                    <div className="space-y-1 mb-5">
                      {poojas.slice(0, 4).map((pooja) => (
                        <PoojaRow
                          key={pooja._id}
                          pooja={pooja}
                          showPrice={false}
                        />
                      ))}
                    </div>

                    <Link
                      href={`/poojas/${poojas[0].slug}`}
                      className="w-full block text-center bg-gradient-to-r from-[#ff7f0a] to-[#ff9b30] text-white font-semibold text-sm py-3 rounded-xl shadow-[0_4px_15px_rgba(255,127,10,0.3)] hover:shadow-[0_6px_25px_rgba(255,127,10,0.45)] transition-all mb-3"
                    >
                      Participate in a Pooja
                    </Link>
                  </>
                ) : (
                  <p className="text-xs text-[#6b5b45] mb-4 text-center py-2">
                    No poojas listed yet for this temple.
                  </p>
                )}

                <Link
                  href="/chadhava"
                  className="w-full block text-center border-2 border-[#ff7f0a] text-[#ff7f0a] font-semibold text-sm py-2.5 rounded-xl hover:bg-[#fff8f0] transition-colors"
                >
                  Make a Chadhava
                </Link>
                <p className="text-center text-[10px] text-[#6b5b45] mt-3 flex items-center justify-center gap-1">
                  Video proof on WhatsApp after pooja
                </p>
              </div>

              {/* Trust Box */}
              <div className="bg-[#fff8f0] border border-[#ffd9a8] rounded-2xl p-5">
                <h4 className="font-semibold text-[#1a1209] text-sm mb-3">
                  Why Participate with Mandirlok?
                </h4>
                {[
                  "Verified, experienced pandits only",
                  "HD video proof of pooja",
                  "100% secure Razorpay payment",
                  "Real-time WhatsApp updates",
                  "Authentic Vedic rituals",
                  "Full refund if cancelled 24h before",
                ].map((t) => (
                  <p
                    key={t}
                    className="text-xs text-[#6b5b45] py-1.5 border-b border-[#f0dcc8] last:border-0"
                  >
                    {t}
                  </p>
                ))}
              </div>

              {/* Temple Stats */}
              <div className="bg-white border border-[#f0dcc8] rounded-2xl p-5">
                <h4 className="font-semibold text-[#1a1209] text-sm mb-3">
                  Temple At a Glance
                </h4>
                <div className="space-y-2 text-xs text-[#6b5b45]">
                  <div className="flex justify-between">
                    <span>Category</span>
                    <span className="font-semibold text-[#1a1209]">
                      {temple.category}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-[#f0dcc8] pt-2">
                    <span>Main Deity</span>
                    <span className="font-semibold text-[#1a1209]">
                      {temple.deity}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-[#f0dcc8] pt-2">
                    <span>Location</span>
                    <span className="font-semibold text-[#1a1209]">
                      {temple.city}, {temple.state}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-[#f0dcc8] pt-2">
                    <span>Poojas Available</span>
                    <span className="font-semibold text-[#ff7f0a]">
                      {poojas.length}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-[#f0dcc8] pt-2">
                    <span>Devotees Served</span>
                    <span className="font-semibold text-[#1a1209]">
                      {temple.totalReviews >= 1000
                        ? `${(temple.totalReviews / 1000).toFixed(1)}k+`
                        : `${temple.totalReviews}+`}
                    </span>
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
