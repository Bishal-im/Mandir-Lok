"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getFooterData } from "@/lib/actions/footer";
import { Building2, Sparkles, Phone, Lock, MessageCircle, CheckCircle2 } from "lucide-react";

const mainLinks = [
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
];

const legalLinks = [
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Refund & Cancellation", href: "/refund" },
  { label: "Shipping & Delivery", href: "/shipping" },
];

export default function Footer() {
  const [temples, setTemples] = useState<any[]>([]);
  const [poojas, setPoojas] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      const res = await getFooterData();
      if (res.success) {
        setTemples(res.temples);
        setPoojas(res.poojas);
      }
    }
    fetchData();
  }, []);

  return (
    <footer className="bg-[#1a0a00] text-[#e8d5b8]">
      {/* Top wave */}
      <div className="overflow-hidden leading-none">
        <svg
          viewBox="0 0 1440 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
        >
          <path
            d="M0 48V24C240 8 480 0 720 0C960 0 1200 8 1440 24V48H0Z"
            fill="#fdf6ee"
          />
        </svg>
      </div>

      <div className="container-app py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ff7f0a] to-[#8b0000] flex items-center justify-center text-white font-bold text-lg">
              म
            </div>
            <div>
              <span className="text-lg font-display font-bold text-white">
                Mandirlok
              </span>
              <span className="block text-[10px] text-[#ff9b30] -mt-0.5 tracking-widest uppercase">
                Divine Bookings
              </span>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-[#b89b7a] mb-5">
            Connect with holy pilgrimage sites and divine temples of India. Book
            pooja from the comfort of your home.
          </p>

        </div>

        {/* Popular Temples */}
        <div>
          <h4 className="text-white font-display font-semibold mb-4 text-sm tracking-wide uppercase">
            Popular Temples
          </h4>
          <ul className="space-y-2.5">
            {temples.length > 0 ? (
              temples.map((t) => (
                <li key={t.slug}>
                  <Link
                    href={`/temples/${t.slug}`}
                    className="text-sm text-[#b89b7a] hover:text-[#ff9b30] transition-colors flex items-center gap-2"
                  >
                    <Building2 size={12} className="text-[#ff7f0a] shrink-0" /> {t.name}
                  </Link>
                </li>
              ))
            ) : (
              <p className="text-xs text-[#b89b7a]/50">Loading temples...</p>
            )}
          </ul>
        </div>

        {/* Popular Poojas */}
        <div>
          <h4 className="text-white font-display font-semibold mb-4 text-sm tracking-wide uppercase">
            Popular Poojas
          </h4>
          <ul className="space-y-2.5">
            {poojas.length > 0 ? (
              poojas.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/poojas/${p.slug}`}
                    className="text-sm text-[#b89b7a] hover:text-[#ff9b30] transition-colors flex items-center gap-2"
                  >
                    <Sparkles size={12} className="text-[#f0bc00] shrink-0" /> {p.name}
                  </Link>
                </li>
              ))
            ) : (
              <p className="text-xs text-[#b89b7a]/50">Loading poojas...</p>
            )}
          </ul>
        </div>

        {/* Support & Legal */}
        <div>
          <h4 className="text-white font-display font-semibold mb-4 text-sm tracking-wide uppercase">
            Support & Legal
          </h4>
          <ul className="space-y-2.5">
            {mainLinks.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className="text-sm text-[#b89b7a] hover:text-[#ff9b30] transition-colors"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            {legalLinks.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className="text-sm text-[#b89b7a] hover:text-[#ff9b30] transition-colors"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Info */}
        <div className="lg:col-span-1">
          <h4 className="text-white font-display font-semibold mb-4 text-sm tracking-wide uppercase">
            Contact Us
          </h4>
          <div className="space-y-4 text-sm text-[#b89b7a]">
            <div className="flex items-start gap-3">
              <Phone size={14} className="text-[#ff7f0a] mt-1 shrink-0" />
              <div>
                <p className="text-white font-medium">+91 98765 43210</p>
                <p className="text-xs">Mon-Sat, 9AM-7PM IST</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MessageCircle size={14} className="text-[#ff7f0a] mt-1 shrink-0" />
              <div>
                <p className="text-white font-medium">support@mandirlok.com</p>
                <p className="text-xs">Response in 24 hours</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Building2 size={14} className="text-[#ff7f0a] mt-1 shrink-0" />
              <div>
                <p className="font-medium text-white">Mandirlok Technologies Pvt. Ltd.</p>
                <p className="text-xs leading-relaxed">
                  Noida, Uttar Pradesh - 201301, India
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container-app py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#7a6050]">
          <p>
            © {new Date().getFullYear()} Mandirlok Technologies Pvt. Ltd. All rights reserved. Made
            in India
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><Lock size={11} className="text-green-400" /> Cashfree Secured</span>
            <span className="flex items-center gap-1"><MessageCircle size={11} className="text-green-400" /> WhatsApp Updates</span>
            <span className="flex items-center gap-1"><CheckCircle2 size={11} className="text-green-400" /> Verified Pandits</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

