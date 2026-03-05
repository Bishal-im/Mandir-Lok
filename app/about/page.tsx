"use client";

import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useEffect, useState } from "react";
import { getSettings } from "@/lib/actions/admin";
// ── Data ──────────────────────────────────────────────────────────────────────
const DEFAULT_STATS = [
  {
    value: "1M+",
    label: "Devotees Served",
    icon: "",
    desc: "have trusted us in their devotional journey",
  },
  {
    value: "500+",
    label: "Sacred Temples",
    icon: "",
    desc: "Partnered with India's most revered temples across all states",
  },
  {
    value: "50K+",
    label: "Pujas Completed",
    icon: "",
    desc: "Millions of devotees have begun Puja and Chadhava at famous temples",
  },
  {
    value: "25+",
    label: "States Covered",
    icon: "",
    desc: "Connecting devotees with sacred temples across India",
  },
];

const TEAM = [
  {
    name: "Arjun Mehta",
    role: "Co-Founder & CEO",
    desc: "Spiritual technologist with 10+ years building devotional platforms. IIT alumnus.",
    initials: "AM",
    color: "bg-orange-500",
  },
  {
    name: "Priya Sharma",
    role: "Co-Founder & CTO",
    desc: "Engineering lead with deep passion for bridging tradition and technology.",
    initials: "PS",
    color: "bg-rose-500",
  },
  {
    name: "Pandit Ramesh Shastri",
    role: "Head of Rituals",
    desc: "Vedic scholar with 25+ years of experience performing authentic Vedic rituals.",
    initials: "RS",
    color: "bg-amber-500",
  },
  {
    name: "Kavya Iyer",
    role: "Head of Temple Relations",
    desc: "Manages partnerships with 500+ temples across India and ensures service quality.",
    initials: "KI",
    color: "bg-teal-500",
  },
];

const VALUES = [
  {
    icon: (
      <svg className="w-8 h-8 text-orange-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
    title: "Authentic Rituals",
    desc: "Every puja follows the traditional Vedic procedure. We never compromise on authenticity.",
  },
  {
    icon: (
      <svg className="w-8 h-8 text-orange-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "Trust & Transparency",
    desc: "Video proof of every ritual, real-time tracking and honest communication always.",
  },
  {
    icon: (
      <svg className="w-8 h-8 text-orange-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.003 9.003 0 008.313-5.547M12 3a9.003 9.003 0 018.313 5.547M3.687 8.453A9.003 9.003 0 0112 3v18a9.003 9.003 0 01-8.313-5.547M12 3c-1.123 0-2.2.203-3.187.575m0 16.85c.987.372 2.064.575 3.187.575" />
      </svg>
    ),
    title: "Accessibility",
    desc: "Making sacred temple rituals accessible to every devotee, regardless of location.",
  },
  {
    icon: (
      <svg className="w-8 h-8 text-orange-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
    title: "Devotee First",
    desc: "We exist to serve the devotional needs of our community — not for profit at their expense.",
  },
];

const MEDIA_LOGOS = [
  "Hindustan Times",
  "Times of India",
  "India Today",
  "NDTV",
  "Economic Times",
  "YourStory",
];

// ── Image Placeholder ──────────────────────────────────────────────────────────
function ImagePlaceholder({
  className = "",
  label = "",
  gradient = "from-orange-800/50 to-red-900/60",
}: {
  className?: string;
  label?: string;
  gradient?: string;
}) {
  return (
    <div
      className={`relative bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden ${className}`}
    >
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}
      />
      <div className="flex flex-col items-center text-white/40 gap-2 z-10 p-4">
        <span className="text-4xl"></span>
        {label && <p className="text-xs text-center opacity-60">{label}</p>}
        <p className="text-xs opacity-40">Upload Image</p>
      </div>
    </div>
  );
}

// ── Main Export ────────────────────────────────────────────────────────────────
export default function AboutPage() {
  const [settings, setSettings] = useState<any>(null);
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [contactSettings, setContactSettings] = useState<any>(null);

  useEffect(() => {
    async function fetchSettings() {
      const res = await getSettings("about_settings");
      if (res && res.value) {
        setSettings(res.value);
      }
    }

    async function fetchStats() {
      try {
        const res = await fetch("/api/stats");
        const data = await res.json();
        if (data.success && data.stats?.length > 0) {
          // Merge API values/labels with our static icons & descriptions
          setStats(
            data.stats.map((s: any, i: number) => ({
              value: s.value,
              label: s.label,
              icon: DEFAULT_STATS[i]?.icon || "",
              desc: DEFAULT_STATS[i]?.desc || "",
            }))
          );
        }
      } catch (err) {
        console.error("fetchStats error:", err);
      }
    }

    async function fetchContactSettings() {
      const res = await getSettings("contact_settings");
      if (res && res.value) {
        setContactSettings(res.value);
      }
    }

    fetchSettings();
    fetchStats();
    fetchContactSettings();
  }, []);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white font-sans">
        {/* Hero Banner */}
        <section className="relative h-72 md:h-96 overflow-hidden">
          {settings?.bannerUrl ? (
            <img 
              src={settings.bannerUrl} 
              alt="Hero Banner" 
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <ImagePlaceholder
              className="absolute inset-0 w-full h-full"
              gradient="from-[#2d0a00] to-[#1a0500]"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-[#1a0500]/95 via-[#2d0a00]/80 to-transparent" />
          <div className="relative z-10 h-full flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <p className="text-orange-300 text-xs font-semibold tracking-widest uppercase mb-3">
                Our Story
              </p>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
                {settings?.heroTitle || "About Mandirlok"}
              </h1>
              <p className="text-white/80 text-base md:text-lg max-w-xl leading-relaxed">
                {settings?.heroSubtitle || "India's growing platform for authentic temple rituals. Connecting millions of devotees with sacred temples across India."}
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Image */}
              <div className="rounded-3xl overflow-hidden shadow-xl aspect-square md:aspect-auto">
                {settings?.missionImage ? (
                  <img src={settings.missionImage} alt="Mandirlok Team" className="w-full h-full object-cover" />
                ) : (
                  <ImagePlaceholder
                    label="Mandirlok Team"
                    className="w-full h-72 md:h-96"
                    gradient="from-orange-700/60 to-red-900/70"
                  />
                )}
              </div>

              {/* Content */}
              <div>
                <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-4 border border-orange-100">
                  Our Mission
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  {settings?.missionTitle || "Committed to Building the Most Trusted Devotional Platform"}
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4 text-sm">
                  {settings?.missionDescription1 || "Mandirlok was founded with a single vision — to make authentic temple rituals accessible to every Hindu devotee in the world, regardless of their location."}
                </p>
                <p className="text-gray-600 leading-relaxed mb-6 text-sm">
                  {settings?.missionDescription2 || "We partner with India's most revered temples and trained Vedic pandits to perform authentic rituals on your behalf, with full video documentation."}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  {stats.map((item) => (
                    <div
                      key={item.label}
                      className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200/50 shadow-sm"
                    >
                      <div className="text-2xl font-extrabold text-orange-600">
                        {item.value}
                      </div>
                      <div className="text-xs text-gray-600 font-medium mt-0.5">
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  href="/poojas"
                  className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-full transition-all duration-200 shadow-md hover:shadow-orange-200 text-sm"
                >
                  Book a Puja Today
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
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-14 bg-gradient-to-r from-[#ffbf00] via-[#ff7f0a] to-[#ffbf00] border-y border-orange-200/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-[#1a0500] mb-2">
                India's Largest Devotional Platform
              </h2>
              <p className="text-[#1a0500]/70 text-sm font-medium">
                Trusted by devotees in 30+ countries
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-3xl md:text-4xl font-extrabold text-[#1a0500] mb-1">
                    {s.value}
                  </div>
                  <div className="text-[#1a0500] font-bold text-sm mb-1">
                    {s.label}
                  </div>
                  <p className="text-[#1a0500]/60 text-xs leading-relaxed font-medium">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-4 border border-orange-100">
                Our Values
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                What We Stand For
              </h2>
              <p className="text-gray-500 text-sm max-w-xl mx-auto">
                Our core values guide every decision, every partnership and
                every ritual we facilitate.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {VALUES.map((v) => (
                <div
                  key={v.title}
                  className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 group hover:border-orange-200 hover:-translate-y-1"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-50 to-amber-50 group-hover:from-orange-100 group-hover:to-amber-100 flex items-center justify-center mb-6 transition-all duration-300 border border-orange-100 relative shadow-sm">
                    <div className="absolute inset-0 rounded-full bg-orange-400/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    {v.icon}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{v.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {v.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>



        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-[#1a0500] to-[#3d1500] relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)",
              backgroundSize: "20px 20px",
            }}
          />
          <div className="relative z-10 text-center max-w-2xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Begin Your Devotional Journey Today
            </h2>
            <p className="text-white/70 text-sm mb-8 leading-relaxed">
              Join over 1 million devotees who trust Mandirlok to connect them
              with India's most sacred temples. Book your first puja in minutes.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/poojas"
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3.5 rounded-full transition-all duration-200 shadow-lg hover:shadow-orange-500/30 hover:scale-105"
              >
                Book a Puja
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
                href="/chadhava"
                className="inline-flex items-center gap-2 border border-white/50 text-white font-bold px-8 py-3.5 rounded-full hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
              >
                Explore Chadhava
              </Link>
            </div>
          </div>
        </section>

        {/* Address Section */}
        <section className="py-20 bg-gradient-to-b from-white to-orange-50/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-12">
              <div className="flex flex-col items-center text-center p-8 bg-white rounded-3xl shadow-sm border border-orange-100 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 mb-6">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <h4 className="font-bold text-gray-900 mb-3 text-lg">Our Address</h4>
                <p className="text-gray-500 text-sm leading-relaxed whitespace-pre-line">
                  {contactSettings?.address || "Mandirlok Technologies Pvt. Ltd.\nNoida, Uttar Pradesh - 201301"}
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-8 bg-white rounded-3xl shadow-sm border border-orange-100 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 mb-6">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                </div>
                <h4 className="font-bold text-gray-900 mb-3 text-lg">Contact Us</h4>
                <div className="space-y-1">
                  <p className="text-gray-500 text-sm font-medium">Phone: {contactSettings?.phone || "+91 98765 43210"}</p>
                  <p className="text-orange-600 text-sm font-bold break-all">
                    {contactSettings?.supportEmail || "help@mandirlok.com"}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center text-center p-8 bg-white rounded-3xl shadow-sm border border-orange-100 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 mb-6">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <h4 className="font-bold text-gray-900 mb-3 text-lg">Support Hours</h4>
                <p className="text-gray-500 text-sm whitespace-pre-line leading-relaxed">
                  {contactSettings?.workingHours || "Mon – Sat: 9 AM – 9 PM\nSun: 10 AM – 6 PM"}
                </p>
              </div>
            </div>
          </div>
        </section>


        {/* Developer Credits Section */}
        <section className="py-12 bg-[#1a0500] relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0 0 L100 100 M100 0 L0 100" stroke="white" strokeWidth="0.1" />
            </svg>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 px-5 py-2 rounded-full mb-8">
                <span className="w-1 h-1 rounded-full bg-orange-500 animate-pulse" />
                <p className="text-[10px] font-bold text-orange-200/80 uppercase tracking-[0.3em]">
                  Designed & Developed By
                </p>
                <span className="w-1 h-1 rounded-full bg-orange-500 animate-pulse" />
              </div>
              
              <div className="flex flex-wrap justify-center gap-8 md:gap-20">
                <div className="flex flex-col items-center gap-2 group">
                  <span className="text-base font-bold text-white group-hover:text-orange-400 transition-colors tracking-wide">Bishal Pandey</span>
                  <a href="mailto:bishalpandey.im@gmail.com" className="text-[11px] text-white/40 hover:text-orange-300 transition-colors flex items-center gap-2">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    bishalpandey.im@gmail.com
                  </a>
                </div>
                <div className="flex flex-col items-center gap-2 group">
                  <span className="text-base font-bold text-white group-hover:text-orange-400 transition-colors tracking-wide">Binod Shrestha</span>
                  <a href="mailto:binodstha060@gmail.com" className="text-[11px] text-white/40 hover:text-orange-300 transition-colors flex items-center gap-2">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    binodstha060@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
