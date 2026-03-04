"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useLanguage } from "@/lib/context/LanguageContext";
import { getSettings } from "@/lib/actions/admin";
import { getHomepageReviews } from "@/lib/actions/reviews";
import { getFeaturedPoojas } from "@/lib/actions/poojas";
import * as LucideIcons from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Pooja {
  _id: string;
  name: string;
  description: string;
  price: number;
  slug: string;
  emoji: string;
  tag: string;
  tagColor: string;
  availableDays: string;
  benefits: string[];
  images: string[];
  deity: string;
  templeId: {
    _id: string;
    name: string;
    location: string;
    city: string;
  };
}

// ── Temple Images (real Wikimedia Commons photos) ────────────────────────────
const getHeroSlides = (t: any) => [
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Kashi_Vishwanath_Temple.jpg/1200px-Kashi_Vishwanath_Temple.jpg",
    title: t("home.heroTitle1"),
    subtitle: t("home.heroSubtitle1"),
    cta: t("nav.participate"),
    ctaLink: "/poojas",
    secondary: t("nav.temples"),
    secondaryLink: "/temples",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Tirumala_temple_shoot.jpg/1200px-Tirumala_temple_shoot.jpg",
    title: t("home.heroTitle2"),
    subtitle: t("home.heroSubtitle2"),
    cta: t("nav.chadhava"),
    ctaLink: "/chadhava",
    secondary: t("nav.temples"),
    secondaryLink: "/temples",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Mahakaleshwar_Jyotirlinga.jpg/1200px-Mahakaleshwar_Jyotirlinga.jpg",
    title: t("home.heroTitle3"),
    subtitle: t("home.heroSubtitle3"),
    cta: t("home.getStarted"),
    ctaLink: "/poojas",
    secondary: t("home.howItWorks"),
    secondaryLink: "#how-it-works",
  },
];






const getHowItWorks = (t: any) => [
  {
    step: "01",
    title: t("home.step1Title"),
    desc: t("home.step1Desc"),
    icon: (
      <svg className="w-10 h-10 text-orange-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
      </svg>
    ),
  },
  {
    step: "02",
    title: t("home.step2Title"),
    desc: t("home.step2Desc"),
    icon: (
      <svg className="w-10 h-10 text-orange-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
      </svg>
    ),
  },
  {
    step: "03",
    title: t("home.step3Title"),
    desc: t("home.step3Desc"),
    icon: (
      <svg className="w-10 h-10 text-orange-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
      </svg>
    ),
  },
  {
    step: "04",
    title: t("home.step4Title"),
    desc: t("home.step4Desc"),
    icon: (
      <svg className="w-10 h-10 text-orange-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
      </svg>
    ),
  },
];

const getStats = (t: any) => [
  { value: "1M+", label: t("home.statsLabel1") },
  { value: "500+", label: t("home.statsLabel2") },
  { value: "50K+", label: t("home.statsLabel3") },
  { value: "25+", label: t("home.statsLabel4") },
];

const getFeatures = (t: any) => [
  {
    icon: (
      <svg className="w-8 h-8 text-orange-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
      </svg>
    ),
    title: t("home.feature1Title"),
    desc: t("home.feature1Desc"),
  },
  {
    icon: (
      <svg className="w-8 h-8 text-orange-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
    title: t("home.feature2Title"),
    desc: t("home.feature2Desc"),
  },
  {
    icon: (
      <svg className="w-8 h-8 text-orange-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0M3.124 7.5A8.969 8.969 0 015.292 3m13.416 0a8.969 8.969 0 012.168 4.5" />
      </svg>
    ),
    title: t("home.feature3Title"),
    desc: t("home.feature3Desc"),
  },
  {
    icon: (
      <svg className="w-8 h-8 text-orange-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12A9 9 0 1112 3a9 9 0 019 9z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
      </svg>
    ),
    title: t("home.feature4Title"),
    desc: t("home.feature4Desc"),
  },
  {
    icon: (
      <svg className="w-8 h-8 text-orange-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.33.185.506.541.499.911-.007.447-.213.846-.543 1.114a14.936 14.936 0 00-1.811 1.777c-.303.35-.599.742-.831 1.144-.216.374-.351.756-.403 1.13-.13.93-.165 1.946-.201 3.033-.012.355-.173.669-.475.86a2.25 2.25 0 01-2.513-.02c-.312-.212-.51-.555-.589-.92-.124-.574-.29-1.29-.533-2.028a11.137 11.137 0 01-.84-3.535l-.014-.52c0-.392.174-.764.484-1.004a11.137 11.137 0 015.65-2.001c.214-.025.432-.037.653-.037.168 0 .334.008.498.024a1.875 1.875 0 011.604 1.077z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.003 9.003 0 008.313-5.547M12 3a9.003 9.003 0 018.313 5.547M3.687 8.453A9.003 9.003 0 0112 3v18a9.003 9.003 0 01-8.313-5.547M12 3c-1.123 0-2.2.203-3.187.575m0 16.85c.987.372 2.064.575 3.187.575" />
      </svg>
    ),
    title: t("home.feature5Title"),
    desc: t("home.feature5Desc"),
  },
  {
    icon: (
      <svg className="w-8 h-8 text-orange-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.003 9.003 0 008.313-5.547M12 3a9.003 9.003 0 018.313 5.547M3.687 8.453A9.003 9.003 0 0112 3v18a9.003 9.003 0 01-8.313-5.547M12 3c-1.123 0-2.2.203-3.187.575m0 16.85c.987.372 2.064.575 3.187.575" />
      </svg>
    ),
    title: t("home.feature6Title"),
    desc: t("home.feature6Desc"),
  },
];

interface RealReview {
  _id: string;
  userId: { name: string; photo?: string };
  templeId: { name: string; location: string };
  rating: number;
  comment: string;
  createdAt: string;
}

// ── Star Rating ──────────────────────────────────────────────────────────────
function Stars({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg
          key={i}
          className="w-4 h-4 text-amber-400 fill-current"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

// ── Section Header ────────────────────────────────────────────────────────────
function SectionHeader({
  tag,
  title,
  subtitle,
}: {
  tag?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="text-center mb-10">
      {tag && (
        <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-3 border border-orange-100">
          {tag}
        </div>
      )}
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
        {title}
      </h2>
      {subtitle && (
        <p className="text-gray-500 max-w-2xl mx-auto text-base leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}

// ── Puja Card ────────────────────────────────────────────────────────────────
function PujaCard({ puja }: { puja: Pooja }) {
  const { t } = useLanguage();
  return (
    <div className="group bg-white rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 flex flex-col h-full">
      <div className="relative h-48 sm:h-56 bg-gradient-to-br from-orange-400 via-orange-500 to-amber-500 flex items-center justify-center overflow-hidden">
        {puja.images?.[0] ? (
          <img
            src={puja.images[0]}
            alt={puja.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <>
            <div className="absolute inset-0 opacity-10 mix-blend-overlay">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <path d="M50 0 L100 50 L50 100 L0 50 Z" fill="white" fillOpacity="0.2" />
              </svg>
            </div>
            <span className="text-8xl transform group-hover:scale-110 transition-transform duration-700 relative z-10">
              {puja.emoji || "🔱"}
            </span>
          </>
        )}
        {puja.tag && (
          <div className="absolute top-4 right-4 z-10">
            <span className={`${puja.tagColor || "bg-orange-500"} text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg backdrop-blur-sm`}>
              {puja.tag}
            </span>
          </div>
        )}
      </div>

      <div className="p-6 md:p-8 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
          <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">
            {puja.deity || "Sacred"} {t('nav.pujas')}
          </span>
        </div>

        <h3 className="text-xl md:text-2xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors duration-300 mb-2 line-clamp-2">
          {puja.name}
        </h3>

        <div className="flex items-start gap-2 mb-4">
          <svg className="w-4 h-4 text-orange-500 mt-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <p className="text-sm text-gray-600 leading-snug">{puja.templeId?.name}, {puja.templeId?.city}</p>
        </div>

        <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3">
          {puja.description}
        </p>

        <div className="mt-auto flex flex-col gap-4">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-orange-50/50 border border-orange-100/50">
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t('chadhava.contribution')}</p>
              <p className="font-bold text-gray-900 text-sm">{puja.benefits?.[0] || "Grace"}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t('contact.workingHours')}</p>
              <p className="font-bold text-orange-600 text-sm">{puja.availableDays || "Daily"}</p>
            </div>
          </div>



          <Link
            href={`/poojas/${puja.slug}`}
            className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl text-center group-hover:bg-orange-600 transition-all duration-300 shadow-xl shadow-gray-200 group-hover:shadow-orange-200"
          >
            {t('common.participatePuja')}
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Animated Sliding Hero ─────────────────────────────────────────────────────
function HeroSection() {
  const { t } = useLanguage();
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<"left" | "right">("left");
  const [nextIndex, setNextIndex] = useState(1);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = (idx: number, dir: "left" | "right" = "left") => {
    if (animating || idx === current) return;
    setDirection(dir);
    setNextIndex(idx);
    setAnimating(true);
    setTimeout(() => {
      setCurrent(idx);
      setAnimating(false);
    }, 800);
  };

  const [heroSlides, setHeroSlides] = useState(getHeroSlides(t));

  useEffect(() => {
    setHeroSlides(getHeroSlides(t));
  }, [t]);

  useEffect(() => {
    async function fetchSlides() {
      const res = await getSettings("landing_page_slides");
      if (res && res.value && res.value.length > 0) {
        setHeroSlides(res.value);
      }
    }
    fetchSlides();
  }, []);

  const next = () => goTo((current + 1) % heroSlides.length, "left");
  const prev = () =>
    goTo((current - 1 + heroSlides.length) % heroSlides.length, "right");

  useEffect(() => {
    timeoutRef.current = setTimeout(next, 5000);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [current, animating, heroSlides]);

  const slide = heroSlides[current];
  const nextSlide = heroSlides[nextIndex];

  return (
    <section className="relative w-full h-[560px] md:h-[640px] overflow-hidden bg-[#1a0500]">
      <style>{`
        @keyframes slideOutLeft  { from { transform: translateX(0); }    to { transform: translateX(-100%); } }
        @keyframes slideOutRight { from { transform: translateX(0); }    to { transform: translateX(100%); } }
        @keyframes slideInRight  { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes slideInLeft   { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hero-slide-out-left  { animation: slideOutLeft  800ms cubic-bezier(.77,0,.18,1) forwards; }
        .hero-slide-out-right { animation: slideOutRight 800ms cubic-bezier(.77,0,.18,1) forwards; }
        .hero-slide-in-right  { animation: slideInRight  800ms cubic-bezier(.77,0,.18,1) forwards; }
        .hero-slide-in-left   { animation: slideInLeft   800ms cubic-bezier(.77,0,.18,1) forwards; }
      `}</style>

      {/* ── Current slide (slides OUT) ── */}
      <div
        key={`cur-${current}`}
        className={`absolute inset-0 ${animating ? (direction === "left" ? "hero-slide-out-left" : "hero-slide-out-right") : ""}`}
        style={{ zIndex: 2 }}
      >
        <img
          src={slide.src}
          alt={slide.title}
          className="w-full h-full object-cover object-center"
        />
        {/* Dark overlay — stronger on left, lighter on right so image shows through */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(100deg, rgba(20,4,0,0.88) 0%, rgba(20,4,0,0.65) 40%, rgba(20,4,0,0.25) 70%, rgba(20,4,0,0.08) 100%)",
          }}
        />
      </div>

      {/* ── Next slide (slides IN) ── */}
      {animating && (
        <div
          key={`next-${nextIndex}`}
          className={
            direction === "left" ? "hero-slide-in-right" : "hero-slide-in-left"
          }
          style={{ position: "absolute", inset: 0, zIndex: 3 }}
        >
          <img
            src={nextSlide.src}
            alt={nextSlide.title}
            className="w-full h-full object-cover object-center"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(100deg, rgba(20,4,0,0.88) 0%, rgba(20,4,0,0.65) 40%, rgba(20,4,0,0.25) 70%, rgba(20,4,0,0.08) 100%)",
            }}
          />
        </div>
      )}

      {/* ── Text Content ── */}
      <div
        className="absolute inset-0 flex items-center"
        style={{ zIndex: 10 }}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 w-full">
          <div className="max-w-xl">
            <p
              key={`tag-${current}`}
              className="text-orange-300 text-xs font-bold tracking-widest uppercase mb-4"
              style={{ animation: "fadeSlideUp 0.55s ease-out 0.05s both" }}
            >
              {t("home.heroTag")}
            </p>
            <h1
              key={`h-${current}`}
              className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-white leading-tight mb-5"
              style={{ animation: "fadeSlideUp 0.6s ease-out 0.1s both" }}
            >
              {slide.title}
            </h1>
            <p
              key={`sub-${current}`}
              className="text-white/80 text-sm sm:text-base md:text-lg mb-8 leading-relaxed line-clamp-3 sm:line-clamp-none"
              style={{ animation: "fadeSlideUp 0.6s ease-out 0.2s both" }}
            >
              {slide.subtitle}
            </p>
            <div
              key={`cta-${current}`}
              className="flex flex-wrap gap-4"
              style={{ animation: "fadeSlideUp 0.6s ease-out 0.3s both" }}
            >
              <Link
                href={slide.ctaLink}
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3.5 rounded-full transition-all duration-200 shadow-xl hover:shadow-orange-500/40 hover:scale-105 text-sm"
              >
                {slide.cta}
                <svg
                  className="w-4 h-4"
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
              <Link
                href={slide.secondaryLink}
                className="inline-flex items-center gap-2 border-2 border-white/40 text-white font-semibold px-8 py-3.5 rounded-full hover:bg-white/10 transition-all duration-200 text-sm backdrop-blur-sm"
              >
                {slide.secondary}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Navigation Dots ── */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2"
        style={{ zIndex: 20 }}
      >
        {heroSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i, i > current ? "left" : "right")}
            className={`rounded-full transition-all duration-300 ${i === current ? "w-8 h-2.5 bg-orange-400" : "w-2.5 h-2.5 bg-white/40 hover:bg-white/70"}`}
          />
        ))}
      </div>

      {/* ── Prev / Next Arrows ── */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-orange-500 transition-all duration-200 border border-white/10"
        style={{ zIndex: 20 }}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-orange-500 transition-all duration-200 border border-white/10"
        style={{ zIndex: 20 }}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </section>
  );
}

// ── Trust Bar — infinite scrolling marquee ──────────────────────────────────
const getMarqueeItems = (t: any) => [
  { icon: "Users", label: t('common.trusted') },
  { icon: "ShieldCheck", label: t('common.secure') },
  { icon: "Building2", label: t('common.sacredTemples') },
  { icon: "Video", label: t('common.videoProof') },
  { icon: "Zap", label: t('common.participateEasy') },
  { icon: "CheckCircle2", label: t('common.authentic') },
  { icon: "Globe", label: t('common.countries') },
  { icon: "MessageSquare", label: t('home.feature5Title') },
  { icon: "Truck", label: t('common.prasad') },
];

function MarqueeIcon({ name, className }: { name: string; className?: string }) {
  const Icon = (LucideIcons as any)[name];
  if (!Icon) return null;
  return <Icon className={className} />;
}

function TrustBar() {
  const { t } = useLanguage();
  const [items, setItems] = useState(getMarqueeItems(t));

  useEffect(() => {
    setItems(getMarqueeItems(t));
  }, [t]);

  useEffect(() => {
    async function fetchMarquee() {
      const res = await getSettings("marquee_items");
      if (res && res.value && res.value.length > 0) {
        setItems(res.value);
      }
    }
    fetchMarquee();
  }, []);

  return (
    <div className="bg-gradient-to-r from-[#ffbf00] via-[#ff7f0a] to-[#ffbf00] border-b border-orange-200/30 shadow-sm overflow-hidden py-4 relative">
      <div
        className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
        style={{
          background: "linear-gradient(to right, #ffbf00 0%, transparent 100%)",
        }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
        style={{
          background: "linear-gradient(to left, #ffbf00 0%, transparent 100%)",
        }}
      />
      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          display: flex;
          width: max-content;
          animation: marquee 32s linear infinite;
        }
        .marquee-track:hover { animation-play-state: paused; }
      `}</style>
      <div className="marquee-track">
        {[...items, ...items].map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-8 whitespace-nowrap"
          >
            {item.icon.length > 2 ? (
              <MarqueeIcon name={item.icon} className="w-5 h-5 text-orange-950" />
            ) : (
              <span className="text-xl leading-none">{item.icon}</span>
            )}
            <span className="text-sm font-bold text-[#1a0500] uppercase tracking-tight">
              {item.label}
            </span>
            <span className="text-orange-950/20 text-xs ml-6 font-black tracking-widest hidden sm:inline">●</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── How It Works ─────────────────────────────────────────────────────────────
function HowItWorksSection() {
  const { t } = useLanguage();
  const howItWorks = getHowItWorks(t);
  return (
    <section
      id="how-it-works"
      className="py-12 md:py-16 bg-gradient-to-br from-orange-50 to-amber-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          tag={t("home.simpleProcess")}
          title={t("home.howItWorks")}
          subtitle={t("home.howSubtitle")}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {howItWorks.map((step, i) => (
            <div key={i} className="relative text-center group">
              {i < howItWorks.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[calc(50%+3rem)] w-full h-px border-t-2 border-dashed border-orange-200 z-0" />
              )}
              <div className="relative z-10">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-50 to-amber-50 shadow-[0_10px_30px_rgba(249,115,22,0.1)] flex items-center justify-center group-hover:scale-110 transition-all duration-300 border-2 border-orange-100/50 relative">
                  <div className="absolute inset-0 rounded-full bg-orange-200/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  {step.icon}
                </div>
                <div className="inline-block bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
                  {t('pujas.step1Title').split(' ')[0]} {step.step}
                </div>
                <h3 className="font-bold text-gray-900 text-base mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link
            href="/poojas"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-10 py-4 rounded-full shadow-lg hover:shadow-orange-300/50 transition-all duration-200 hover:scale-105 text-base"
          >
            {t("home.participateFirst")}
            <svg
              className="w-5 h-5"
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
    </section>
  );
}

// ── Stats ─────────────────────────────────────────────────────────────────────
function StatsSection({ stats }: { stats: any[] }) {
  const { t } = useLanguage();
  return (
    <section className="bg-gradient-to-r from-[#ffbf00] via-[#ff7f0a] to-[#ffbf00] py-10 md:py-14 border-y border-orange-200/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1a0500] mb-2">
            {t("home.statsTitle")}
          </h2>
          <p className="text-[#1a0500]/70 text-sm font-medium">
            {t("home.statsSubtitle")}
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl md:text-5xl font-extrabold text-[#1a0500] mb-1">
                {s.value}
              </div>
              <div className="text-[#1a0500]/80 text-sm font-bold uppercase tracking-tight">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Features ──────────────────────────────────────────────────────────────────
function FeaturesSection() {
  const { t } = useLanguage();
  const features = getFeatures(t);
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          tag={t("home.whyTag")}
          title={t("home.whyTitle")}
          subtitle={t("home.whyDesc")}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div
              key={i}
              className="flex gap-4 p-6 rounded-2xl hover:bg-orange-50 transition-colors duration-200 group border border-transparent hover:border-orange-100"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-50 to-amber-50 group-hover:from-orange-100 group-hover:to-amber-100 flex items-center justify-center shrink-0 transition-all duration-300 border border-orange-100 hover:shadow-lg hover:shadow-orange-200/20 relative">
                <div className="absolute inset-0 rounded-full bg-orange-400/10 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                {f.icon}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1.5">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Testimonials ──────────────────────────────────────────────────────────────
function TestimonialsSection() {
  const { t } = useLanguage();
  const [reviews, setReviews] = useState<RealReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      const res = await getHomepageReviews();
      if (res.success) {
        setReviews(res.data);
      }
      setLoading(false);
    }
    fetchReviews();
  }, []);

  if (!loading && reviews.length === 0) return null;

  return (
    <section className="py-12 md:py-16 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          tag={t("nav.reviews") || "Reviews"}
          title={t("home.reviewsTitle")}
          subtitle={t("home.reviewsSubtitle")}
        />

        <div className="relative">
          <div className="flex flex-wrap justify-center gap-6">
            {loading ? (
              // Loading skeletons
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="w-full md:w-[calc(33.333%-1rem)] bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 mb-6"></div>
                  <div className="flex gap-2">
                    <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-2 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              reviews.map((rev) => (
                <div key={rev._id} className="w-full md:w-[calc(33.333%-1rem)] bg-white p-6 rounded-2xl shadow-sm border border-orange-50 hover:border-orange-200 transition-all duration-300 hover:shadow-md group">
                  <div className="flex gap-1 mb-4">
                    <Stars count={rev.rating} />
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed mb-6 italic min-h-[60px]">
                    "{rev.comment}"
                  </p>
                  <div className="flex items-center gap-3">
                    {rev.userId?.photo ? (
                      <img src={rev.userId.photo} alt={rev.userId?.name || "Devotee"} className="w-10 h-10 rounded-full object-cover border-2 border-orange-100" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm">
                        {(rev.userId?.name || "D").charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{rev.userId?.name || "Devotee"}</h4>
                      <p className="text-xs text-orange-500 font-medium">{rev.templeId?.name || "Sacred Temple"}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────
export default function HomePage() {
  const { t, language } = useLanguage();
  const [poojas, setPoojas] = useState<Pooja[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(getStats(t));

  useEffect(() => {
    setStats(getStats(t));
  }, [t]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/stats");
        const data = await res.json();
        if (data.success) {
          const mappedStats = data.stats.map((s: any) => {
            let label = s.label;
            if (s.key === "devotees") label = t("home.statsLabel1");
            if (s.key === "temples") label = t("home.statsLabel2");
            if (s.key === "pujas") label = t("home.statsLabel3");
            if (s.key === "states") label = t("home.statsLabel4");
            return { value: s.value, label };
          });
          setStats(mappedStats);
        }
      } catch (err) {
        console.error("fetchStats error:", err);
      }
    }
    fetchStats();

    async function fetchPoojas() {
      try {
        setLoading(true);
        const res = await getFeaturedPoojas(language);
        if (res.success) {
          setPoojas(res.data);
        }
      } catch (err) {
        console.error("fetchPoojas error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPoojas();
  }, [language]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen font-sans bg-white">
        <HeroSection />
        <TrustBar />

        {/* Featured Poojas Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              tag={t("home.specialPujas")}
              title={t("home.upcomingPujas")}
              subtitle={t("home.upcomingPujasDesc")}
            />
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-gray-50 rounded-3xl h-96 animate-pulse" />
                ))}
              </div>
            ) : poojas.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {poojas.map((puja) => (
                  <PujaCard key={puja._id} puja={puja} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">No featured pujas available right now.</p>
              </div>
            )}
            <div className="text-center">
              <Link
                href="/poojas"
                className="inline-flex items-center gap-2 border-2 border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white font-bold px-8 py-3 rounded-full transition-all duration-200"
              >
                {t("home.viewAllPujas")}
                <svg
                  className="w-4 h-4"
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
        </section>

        <HowItWorksSection />
        <StatsSection stats={stats} />
        <FeaturesSection />
        <TestimonialsSection />
      </main>
      <Footer />
    </>
  );
}
