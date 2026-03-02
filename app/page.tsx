"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getSettings } from "@/lib/actions/admin";
import { getHomepageReviews } from "@/lib/actions/reviews";
import { getFeaturedPoojas } from "@/lib/actions/poojas";

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
const SLIDE_IMAGES = [
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Kashi_Vishwanath_Temple.jpg/1200px-Kashi_Vishwanath_Temple.jpg",
    title: "Perform Your Puja with Mandirlok",
    subtitle:
      "Let your prayers reach the Divine through authentic Vedic rituals performed on your behalf at India's holiest temples.",
    cta: "Participate in a Puja",
    ctaLink: "/poojas",
    secondary: "Explore Temples",
    secondaryLink: "/temples",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Tirumala_temple_shoot.jpg/1200px-Tirumala_temple_shoot.jpg",
    title: "Sacred Chadhava Offerings",
    subtitle:
      "Offer sacred items at renowned temples across India — from the comfort of your home.",
    cta: "Participate in Chadhava",
    ctaLink: "/chadhava",
    secondary: "View All Temples",
    secondaryLink: "/temples",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Mahakaleshwar_Jyotirlinga.jpg/1200px-Mahakaleshwar_Jyotirlinga.jpg",
    title: "Seek Divine Blessings Today",
    subtitle:
      "Connect with 500+ temples. Participate in pujas, chadhava and receive videos of completed rituals delivered on WhatsApp.",
    cta: "Get Started",
    ctaLink: "/poojas",
    secondary: "How It Works",
    secondaryLink: "#how-it-works",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Vaishno-devi-bhavan.jpg/1200px-Vaishno-devi-bhavan.jpg",
    title: "Experience Mata's Blessings",
    subtitle:
      "Can't travel to Mata Vaishno Devi? Let us carry your prayers to the divine abode in the Trikuta Mountains.",
    cta: "Participate in Aarti Seva",
    ctaLink: "/poojas",
    secondary: "Explore Devi Temples",
    secondaryLink: "/temples",
  },
];

const TRUST_BADGES = [
  { icon: "🙏", label: "Trusted by 1 Million+ Devotees" },
  { icon: "🔒", label: "100% Secure Payments" },
  { icon: "🕌", label: "500+ Sacred Temples" },
  { icon: "📹", label: "Video Proof of Every Puja" },
];




const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Choose Your Puja",
    desc: "Browse 500+ puja services across India's most sacred temples and select the one that resonates.",
    icon: "🙏",
  },
  {
    step: "02",
    title: "Enter Your Name",
    desc: "Provide your name and gotra for the Sankalp. Our pandits will chant it during the puja.",
    icon: "✍️",
  },
  {
    step: "03",
    title: "Secure Payment",
    desc: "Pay securely using UPI, credit/debit card, or net banking through our Razorpay gateway.",
    icon: "🔐",
  },
  {
    step: "04",
    title: "Receive Puja Video",
    desc: "Get a complete video of your puja performed at the temple, delivered within 24–48 hours.",
    icon: "📹",
  },
];

const STATS = [
  { value: "1M+", label: "Devotees Served" },
  { value: "500+", label: "Sacred Temples" },
  { value: "50K+", label: "Pujas Completed" },
  { value: "25+", label: "States Covered" },
];

const FEATURES = [
  {
    icon: "🛕",
    title: "Sacred Temple Network",
    desc: "Access 500+ renowned temples across India — Jyotirlingas, Shaktipeeths, Divya Desams and more.",
  },
  {
    icon: "📿",
    title: "Authentic Vedic Rituals",
    desc: "All rituals performed by trained, experienced pandits following traditional Vedic procedures.",
  },
  {
    icon: "📱",
    title: "Real-Time Updates",
    desc: "Track your puja participation status and receive instant WhatsApp updates on ritual completion.",
  },
  {
    icon: "🎥",
    title: "Video Proof",
    desc: "Receive a high-quality video of your puja so you can witness the divine ritual personally.",
  },
  {
    icon: "💬",
    title: "WhatsApp Support",
    desc: "Dedicated support via WhatsApp for all participation queries, customization and post-puja questions.",
  },
  {
    icon: "🌍",
    title: "Participate from Anywhere",
    desc: "Devotees across 30+ countries trust Mandirlok to connect them with India's sacred temples.",
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
          🌸 {tag}
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
            {puja.deity || "Sacred"} Special
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
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Benefit</p>
              <p className="font-bold text-gray-900 text-sm">{puja.benefits?.[0] || "Grace"}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Schedule</p>
              <p className="font-bold text-orange-600 text-sm">{puja.availableDays || "Daily"}</p>
            </div>
          </div>



          <Link
            href={`/poojas/${puja.slug}`}
            className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl text-center group-hover:bg-orange-600 transition-all duration-300 shadow-xl shadow-gray-200 group-hover:shadow-orange-200"
          >
            Participate Now 🙏
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Animated Sliding Hero ─────────────────────────────────────────────────────
function HeroSection() {
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

  const [heroSlides, setHeroSlides] = useState(SLIDE_IMAGES);

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
              🙏 Mandirlok Sacred Services
            </p>
            <h1
              key={`h-${current}`}
              className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-5"
              style={{ animation: "fadeSlideUp 0.6s ease-out 0.1s both" }}
            >
              {slide.title}
            </h1>
            <p
              key={`sub-${current}`}
              className="text-white/80 text-base md:text-lg mb-8 leading-relaxed"
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
const MARQUEE_ITEMS = [
  { icon: "🙏", label: "Trusted by 1 Million+ Devotees" },
  { icon: "🔒", label: "100% Secure Payments" },
  { icon: "🛕", label: "500+ Sacred Temples" },
  { icon: "📹", label: "Video Proof of Every Puja" },
  { icon: "⚡", label: "Participation in Under 2 Minutes" },
  { icon: "📿", label: "Authentic Vedic Rituals" },
  { icon: "🌍", label: "Devotees in 30+ Countries" },
  { icon: "💬", label: "WhatsApp Support 24/7" },
  { icon: "🎁", label: "Prasad Delivered to Door" },
  { icon: "✅", label: "100% Money-Back Guarantee" },
];

function TrustBar() {
  return (
    <div className="bg-white border-b border-orange-100 shadow-sm overflow-hidden py-3.5 relative">
      <div
        className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
        style={{
          background: "linear-gradient(to right, #fff 0%, transparent 100%)",
        }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
        style={{
          background: "linear-gradient(to left, #fff 0%, transparent 100%)",
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
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-2.5 px-7 whitespace-nowrap"
          >
            <span className="text-xl leading-none">{item.icon}</span>
            <span className="text-sm font-semibold text-gray-700">
              {item.label}
            </span>
            <span className="text-orange-200 text-lg ml-4">✦</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── How It Works ─────────────────────────────────────────────────────────────
function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="py-16 bg-gradient-to-br from-orange-50 to-amber-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          tag="Simple Process"
          title="How Mandirlok Works"
          subtitle="A seamless 4-step process to get authentic puja performed at India's sacred temples on your behalf."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {HOW_IT_WORKS.map((step, i) => (
            <div key={i} className="relative text-center group">
              {i < HOW_IT_WORKS.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[calc(50%+3rem)] w-full h-px border-t-2 border-dashed border-orange-200 z-0" />
              )}
              <div className="relative z-10">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-white shadow-md flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-300 border border-orange-100">
                  {step.icon}
                </div>
                <div className="inline-block bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
                  Step {step.step}
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
            Participate in Your First Puja
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
  return (
    <section className="bg-gradient-to-r from-orange-600 to-rose-700 py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            India's Growing Devotional Platform
          </h2>
          <p className="text-white/80 text-sm">
            Connecting devotees with sacred temples since 2020
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl md:text-5xl font-extrabold text-white mb-1">
                {s.value}
              </div>
              <div className="text-white/80 text-sm font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Features ──────────────────────────────────────────────────────────────────
function FeaturesSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          tag="Why Choose Us"
          title="One Platform for All Devotional Needs"
          subtitle="Mandirlok brings together the most sacred temples, trained pandits, and modern technology to serve your spiritual journey."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="flex gap-4 p-6 rounded-2xl hover:bg-orange-50 transition-colors duration-200 group border border-transparent hover:border-orange-100"
            >
              <div className="w-14 h-14 rounded-2xl bg-orange-100 group-hover:bg-orange-200 flex items-center justify-center text-3xl shrink-0 transition-colors duration-200">
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
    <section className="py-16 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          tag="Reviews"
          title="What Our Devotees Say"
          subtitle="Thousands of devotees trust Mandirlok to connect them with divine blessings from India's sacred temples."
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
  const [poojas, setPoojas] = useState<Pooja[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(STATS);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/stats");
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
        }
      } catch (err) {
        console.error("fetchStats error:", err);
      }
    }
    fetchStats();

    async function fetchPoojas() {
      try {
        setLoading(true);
        const res = await getFeaturedPoojas();
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
  }, []);

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
              tag="Mandirlok Special Pujas"
              title="Upcoming Sacred Pujas & Rituals"
              subtitle="Participate in authentic pujas performed at India's most powerful temples. Receive a video within 24–48 hours."
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
                View All Pujas
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
