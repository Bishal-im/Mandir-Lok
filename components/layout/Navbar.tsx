"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/context/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";

import { getSettings } from "@/lib/actions/admin";

const getNavLinks = (t: (path: string) => string) => [
  { label: t("nav.home"), href: "/" },
  { label: t("nav.pujas"), href: "/poojas" },
  { label: t("nav.chadhava"), href: "/chadhava" },
  { label: t("nav.temples"), href: "/temples" },
  { label: t("nav.aarti"), href: "/aarti" },
];

const SPIRITUAL_WORDS = [
  "Spiritual",
  "Divine",
  "Sacred",
  "Blessed",
  "Devotional",
];

interface UserInfo {
  name: string;
  email: string;
  initials: string;
  photo?: string;
}

export default function Navbar() {
  const { t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const [wordVisible, setWordVisible] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // ── Fetch Logo ──
  useEffect(() => {
    async function loadLogo() {
      try {
        const setting = await getSettings("website_logo");
        if (setting && setting.value) setLogoUrl(setting.value);
      } catch (err) {
        console.error("Failed to load logo", err);
      }
    }
    loadLogo();
  }, []);

  // ── Check auth on mount ──
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const resData = await res.json();
          // API returns { success: true, data: userObject }
          const userObj = resData.data;

          const name = userObj?.name || userObj?.email?.split("@")[0] || "User";
          const email = userObj?.email || "";
          const initials = name
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
          const photo = userObj?.photo || "";
          setUser({ name, email, initials, photo });
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuth();
  }, []);

  // ── Logout ──
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setProfileOpen(false);
    window.location.href = "/";
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordVisible(false);
      setTimeout(() => {
        setWordIndex((i) => (i + 1) % SPIRITUAL_WORDS.length);
        setWordVisible(true);
      }, 350);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const IS_LOGGED_IN = !!user;

  return (
    <>
      <style suppressHydrationWarning>{`
        @keyframes topMarquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        .top-marquee { animation: topMarquee 22s linear infinite; }
        @keyframes wordIn { from{opacity:0;transform:translateY(10px) scale(0.92)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes wordOut { from{opacity:1;transform:translateY(0) scale(1)} to{opacity:0;transform:translateY(-10px) scale(0.92)} }
        .word-in { animation: wordIn 0.35s cubic-bezier(.34,1.56,.64,1) forwards; }
        .word-out { animation: wordOut 0.3s ease-in forwards; }
        @keyframes ripple { 0%{box-shadow:0 0 0 0 rgba(251,146,60,0.5)} 70%{box-shadow:0 0 0 10px rgba(251,146,60,0)} 100%{box-shadow:0 0 0 0 rgba(251,146,60,0)} }
        .btn-login:hover { animation: ripple 0.7s ease-out; }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        .btn-book { background:linear-gradient(90deg,#ea580c 0%,#f97316 30%,#fbbf24 50%,#f97316 70%,#ea580c 100%);background-size:200% auto; }
        .btn-book:hover { animation: shimmer 1.2s linear infinite; }
        @keyframes ping { 75%,100%{transform:scale(2);opacity:0} }
        .ping { animation: ping 1.4s cubic-bezier(0,0,.2,1) infinite; }
        .hamburger-line { display:block;width:22px;height:2px;background:#1a1209;border-radius:2px;transition:all 0.3s cubic-bezier(.77,0,.18,1);transform-origin:center; }
        .menu-open .hamburger-line:nth-child(1) { transform:translateY(7px) rotate(45deg); }
        .menu-open .hamburger-line:nth-child(2) { opacity:0;transform:scaleX(0); }
        .menu-open .hamburger-line:nth-child(3) { transform:translateY(-7px) rotate(-45deg); }
        @keyframes menuSlide { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }
        .mobile-menu { animation: menuSlide 0.3s cubic-bezier(.34,1.56,.64,1) forwards; }
        @keyframes profileSlide { from{opacity:0;transform:translateY(-6px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        .profile-dropdown { animation: profileSlide 0.2s ease-out forwards; }
        .nav-link { position:relative; }
        .nav-link::after { content:'';position:absolute;bottom:-2px;left:0;width:0;height:2px;background:#f97316;border-radius:2px;transition:width 0.25s ease; }
        .nav-link:hover::after { width:100%; }
      `}</style>

      {/* TOP MARQUEE BAR */}
      <div className="bg-gradient-to-r from-[#ffbf00] via-[#ff7f0a] to-[#ffbf00] text-[#1a0500] text-xs overflow-hidden h-8 flex items-center relative">
        <div className="absolute left-2 sm:left-4 z-10 flex items-center gap-1.5 sm:gap-2 bg-black/5 backdrop-blur-sm px-2.5 sm:px-3 py-0.5 rounded-full border border-black/10 shrink-0">
          <span className="text-orange-600 text-[10px] sm:text-xs">✦</span>
          <span
            key={wordIndex}
            className={
              wordVisible
                ? "word-in inline-block text-orange-700 font-bold tracking-wide text-[10px] sm:text-xs"
                : "word-out inline-block text-orange-700 font-bold tracking-wide text-[10px] sm:text-xs"
            }
          >
            {SPIRITUAL_WORDS[wordIndex]}
          </span>
          <span className="text-[#1a0500]/70 font-medium hidden md:inline text-[10px] sm:text-xs">{t("common.services")}</span>
        </div>
        <div className="flex whitespace-nowrap ml-48">
          <div className="top-marquee flex items-center gap-0">
            {[
              t("common.trusted"), t("common.secure"), t("common.sacredTemples"),
              t("common.videoProof"), t("common.participateEasy"), t("common.countries"),
              t("common.prasad"), t("common.authentic")
            ].map((item, i) => (
              <span key={i} className="flex items-center gap-5 px-6 text-[#1a0500]/90 font-medium text-[10px] sm:text-[11px]">
                {item}<span className="text-orange-900/30">·</span>
              </span>
            ))}
            {/* Duplicate for seamless loop */}
            {[
              t("common.trusted"), t("common.secure"), t("common.sacredTemples"),
              t("common.videoProof"), t("common.participateEasy"), t("common.countries"),
              t("common.prasad"), t("common.authentic")
            ].map((item, i) => (
              <span key={i + 'dup'} className="flex items-center gap-5 px-6 text-white/90 font-medium text-[10px] sm:text-[11px]">
                {item}<span className="text-orange-300/50">·</span>
              </span>
            ))}
          </div>
        </div>
        <a
          href="https://wa.me/919876543210"
          target="_blank"
          rel="noreferrer"
          className="absolute right-4 flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20ba5a] transition-colors text-white text-[11px] font-bold px-3 py-1 rounded-full z-10 shrink-0"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          <span className="hidden sm:inline">WhatsApp</span>
        </a>
      </div>

      {/* MAIN NAVBAR */}
      <nav className={`sticky top-0 z-50 bg-white transition-all duration-300 ${scrolled ? "shadow-[0_2px_20px_rgba(0,0,0,0.12)]" : "border-b border-orange-100"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* LOGO */}
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              {logoUrl ? (
                <img src={logoUrl} alt="Mandirlok Logo" className="h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-110" />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center text-white text-lg shadow-md group-hover:shadow-orange-300/50 transition-all duration-300 group-hover:scale-110">
                </div>
              )}
              <div className="flex flex-col leading-none">
                <span className="text-[15px] font-extrabold text-[#1a0500] tracking-tight">Mandirlok</span>
                <span className="text-[10px] text-orange-500 font-semibold tracking-widest uppercase">{t("common.services")}</span>
              </div>
            </Link>

            {/* DESKTOP NAV */}
            <div className="hidden md:flex items-center gap-1">
              {getNavLinks(t).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="nav-link px-4 py-2 text-sm font-semibold text-gray-700 hover:text-orange-600 transition-colors duration-200 rounded-lg hover:bg-orange-50"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* DESKTOP CTA */}
            <div className="hidden md:flex items-center gap-3">
              <LanguageSwitcher />
              {authLoading ? (
                // Loading skeleton
                <div className="w-24 h-9 bg-gray-100 rounded-xl animate-pulse" />
              ) : IS_LOGGED_IN ? (
                /* ── LOGGED IN: Profile Avatar + Dropdown ── */
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen((v) => !v)}
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border-2 border-orange-100 hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 group"
                  >
                    {user?.photo ? (
                      <img src={user.photo} className="w-8 h-8 rounded-full object-cover shadow-sm" alt={user.name} />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        {user!.initials}
                      </div>
                    )}
                    <div className="text-left hidden sm:block">
                      <p className="text-xs font-bold text-[#1a0500] leading-none">{user!.name.split(" ")[0]}</p>
                      <p className="text-[10px] text-gray-400 leading-none mt-0.5">{t("nav.myAccount")}</p>
                    </div>
                    <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${profileOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* LOGGED-IN DROPDOWN */}
                  {profileOpen && (
                    <div className="profile-dropdown absolute right-0 top-[calc(100%+10px)] w-72 bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden z-50">
                      {/* User header */}
                      <div className="bg-gradient-to-br from-orange-50 to-amber-50 px-5 py-4 border-b border-orange-100">
                        <div className="flex items-center gap-3">
                          {user?.photo ? (
                            <img src={user.photo} className="w-12 h-12 rounded-full object-cover shadow-md" alt={user.name} />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center text-white font-bold text-base shadow-md">
                              {user!.initials}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-[#1a0500] text-sm">{user!.name}</p>
                            <p className="text-xs text-gray-500">{user!.email}</p>
                          </div>
                        </div>
                      </div>

                      <div className="max-h-[70vh] overflow-y-auto">
                        {/* Account section */}
                        <div className="px-4 py-3">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 px-1">{t("nav.myAccount")}</p>
                          {[
                            { icon: "", label: t("nav.profile"), href: "/dashboard/profile" },
                            { icon: "", label: t("nav.bookings"), href: "/dashboard" },
                            { icon: "", label: t("nav.pujas"), href: "/poojas", badge: t("common.new") },
                            { icon: "", label: t("nav.chadhava"), href: "/chadhava", badge: t("common.new") },
                          ].map((item) => (
                            <Link
                              key={item.label}
                              href={item.href}
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-orange-50 transition-colors group"
                            >
                              <span className="text-base w-5 text-center">{item.icon}</span>
                              <span className="text-sm text-gray-700 group-hover:text-orange-600 flex-1 font-medium">{item.label}</span>
                              {item.badge && (
                                <span className="bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{item.badge}</span>
                              )}
                              <svg className="w-3.5 h-3.5 text-gray-300 group-hover:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </Link>
                          ))}
                        </div>

                        {/* Logout */}
                        <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors text-sm font-medium"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            {t("nav.logout")}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* ── NOT LOGGED IN ── */
                <>
                  <Link
                    href="/login"
                    className="btn-login relative flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-orange-400 text-orange-600 text-sm font-bold transition-all duration-200 hover:bg-orange-50 hover:border-orange-500 hover:-translate-y-0.5 active:scale-95"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {t("nav.login")}
                  </Link>
                  <Link
                    href="/poojas"
                    className="btn-book relative flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-bold shadow-lg shadow-orange-300/40 hover:shadow-orange-400/60 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 overflow-hidden"
                  >
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="ping absolute inline-flex h-full w-full rounded-full bg-yellow-200 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-100"></span>
                    </span>
                    {t("nav.participate")}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>

                  {/* Guest profile icon */}
                  <div className="relative" ref={profileRef}>
                    <button
                      onClick={() => setProfileOpen((v) => !v)}
                      className="w-9 h-9 rounded-full bg-gray-100 hover:bg-orange-100 border-2 border-transparent hover:border-orange-300 flex items-center justify-center transition-all duration-200"
                    >
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </button>

                    {profileOpen && (
                      <div className="profile-dropdown absolute right-0 top-[calc(100%+10px)] w-72 bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden z-50">
                        <div className="max-h-[70vh] overflow-y-auto">
                          <div className="p-4 border-b border-gray-100">
                            <Link
                              href="/login"
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2.5 rounded-xl transition-colors"
                            >
                              {t("nav.login")} / {t("nav.createAccount")}
                            </Link>
                          </div>
                          <div className="px-4 py-3">
                            {[
                              { icon: "", label: t("nav.bookings"), href: "/login" },
                              { icon: "", label: t("nav.pujas"), href: "/poojas", badge: t("common.new") },
                              { icon: "", label: t("nav.chadhava"), href: "/chadhava", badge: t("common.new") },
                            ].map((item) => (
                              <Link
                                key={item.label}
                                href={item.href}
                                onClick={() => setProfileOpen(false)}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-orange-50 transition-colors group"
                              >
                                <span className="text-base w-5 text-center">{item.icon}</span>
                                <span className="text-sm text-gray-700 group-hover:text-orange-600 flex-1 font-medium">{item.label}</span>
                                {item.badge && (
                                  <span className="bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{item.badge}</span>
                                )}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* MOBILE HAMBURGER */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className={`md:hidden flex flex-col justify-center items-center gap-[5px] w-10 h-10 rounded-xl hover:bg-orange-50 transition-colors ${menuOpen ? "menu-open" : ""}`}
              aria-label="Toggle menu"
            >
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {menuOpen && (
          <div className="mobile-menu md:hidden bg-white border-t border-orange-100 shadow-xl">
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
              <div className="flex justify-between items-center px-4 py-2 border-b border-orange-50 mb-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t("common.selectLanguage")}</span>
                <LanguageSwitcher />
              </div>
              {getNavLinks(t).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                  {link.label}
                </Link>
              ))}

              {IS_LOGGED_IN ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-orange-600 hover:bg-orange-50 rounded-xl transition-colors"
                  >
                    {t("nav.bookings")}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    {t("nav.logout")}
                  </button>
                </>
              ) : (
                <div className="flex gap-3 mt-3 pt-3 border-t border-orange-100">
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-orange-400 text-orange-600 text-sm font-bold hover:bg-orange-50 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/poojas"
                    onClick={() => setMenuOpen(false)}
                    className="flex-1 btn-book flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-bold shadow-md"
                  >
                    {t("nav.pujas")}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}