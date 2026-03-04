"use client";

import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/lib/context/LanguageContext";
import { Language } from "@/lib/i18n/translations";

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "hi", label: "Hindi (हिंदी)", flag: "🇮🇳" },
  { code: "ne", label: "Nepali", flag: "🇳🇵" },
  { code: "mr", label: "Marathi", flag: "🇮🇳" },
  { code: "ta", label: "Tamil", flag: "🇮🇳" },
];

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 border-orange-100 hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 group"
      >
        <span className="text-lg">{currentLang.flag}</span>
        <span className="text-xs font-bold text-[#1a0500] uppercase hidden sm:inline">{currentLang.code}</span>
        <svg
          className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden z-[60] py-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setIsOpen(false);
              }}
              className={`flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-orange-50 transition-colors group ${
                language === lang.code ? "bg-orange-50" : ""
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span className={`text-sm font-medium ${language === lang.code ? "text-orange-600" : "text-gray-700"}`}>
                {lang.label}
              </span>
              {language === lang.code && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
