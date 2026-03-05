"use client";

import { useEffect, useState } from "react";
import { Globe, ChevronDown } from "lucide-react";

const LANGUAGES = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "ne", name: "नेपाली", flag: "🇳🇵" },
  { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
  { code: "mr", name: "मराठी", flag: "🇮🇳" },
  { code: "te", name: "తెలుగు", flag: "🇮🇳" },
  { code: "ta", name: "தமிழ்", flag: "🇮🇳" },
];

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

interface GoogleTranslateProps {
  align?: "left" | "right";
}

export default function GoogleTranslate({ align = "right" }: GoogleTranslateProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(LANGUAGES[0]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 1. Initialize Google Translate
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,ne,hi,mr,te,ta",
          autoDisplay: false,
        },
        "google_translate_element"
      );
    };

    // 2. Load the script if not already loaded
    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }

    // 3. Hide Google Bar with CSS & Global Polishing
    const style = document.createElement("style");
    style.id = "goog-translate-hide-style";
    style.innerHTML = `
      /* Hide the Google Translate banner iframe completely */
      .goog-te-banner-frame,
      .goog-te-banner-frame.skiptranslate,
      iframe.goog-te-banner-frame,
      iframe[name="google_translate_o"] {
        display: none !important;
        visibility: hidden !important;
        height: 0 !important;
        max-height: 0 !important;
      }

      /* Prevent body from being pushed down by Google Translate */
      body {
        top: 0 !important;
        margin-top: 0 !important;
      }

      /* Hide the translate gadget widget itself */
      #google_translate_element,
      .goog-te-gadget,
      .skiptranslate.goog-te-gadget,
      .goog-te-gadget-icon,
      .goog-te-gadget-span { display: none !important; }

      /* Hide attribution and extra spans in the dropdown */
      .goog-te-menu-value span:nth-child(5) { display:none !important; }
      .goog-te-menu-value img { display:none !important; }
      .goog-te-menu-frame { box-shadow: none !important; }

      /* Smooth transitions for all elements when translated */
      font, [style*="font-family"] {
        transition: all 0.2s ease-in-out !important;
      }
    `;
    if (!document.getElementById("goog-translate-hide-style")) {
      document.head.appendChild(style);
    }

    // 4. Helper: forcefully reset body offset and hide any banner iframes
    const suppressBanner = () => {
      // Reset inline body.top set by Google Translate JS
      if (document.body.style.top && document.body.style.top !== "0px") {
        document.body.style.setProperty("top", "0px", "important");
        document.body.style.setProperty("margin-top", "0px", "important");
      }
      // Hide the banner iframe if it exists in the DOM
      const bannerFrame = document.querySelector<HTMLElement>(
        ".goog-te-banner-frame, iframe.goog-te-banner-frame, iframe[name='google_translate_o']"
      );
      if (bannerFrame) {
        bannerFrame.style.setProperty("display", "none", "important");
        bannerFrame.style.setProperty("height", "0", "important");
        bannerFrame.style.setProperty("visibility", "hidden", "important");
      }
    };

    // 5. MutationObserver: watch body style attribute changes AND new child nodes
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "attributes" || mutation.type === "childList") {
          suppressBanner();
        }
      }
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["style"],
      childList: true,
      subtree: false,
    });

    // 6. Poll as a safety-net (handles cases where GT loads after the observer)
    const interval = setInterval(suppressBanner, 500);

    // 7. Persistence: Check cookie to set initial language
    const getCookie = (name: string) => {
      const decodeValue = decodeURIComponent(document.cookie);
      const parts = decodeValue.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift();
      const partsNoSpace = decodeValue.split(`${name}=`);
      if (partsNoSpace.length === 2) return partsNoSpace.pop()?.split(";").shift();
    };

    const cookieValue = getCookie("googtrans");
    if (cookieValue) {
      const code = cookieValue.split("/").pop();
      const lang = LANGUAGES.find((l) => l.code === code);
      if (lang) setCurrentLang(lang);
    }

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  const changeLanguage = (lang: typeof LANGUAGES[0]) => {
    if (lang.code === currentLang.code) {
      setIsOpen(false);
      return;
    }

    setIsLoading(true);

    const hostname = window.location.hostname;
    const cookieString = `googtrans=/en/${lang.code}; path=/;`;
    
    document.cookie = cookieString;
    document.cookie = `${cookieString} domain=.${hostname};`;
    if (hostname.includes(".")) {
      document.cookie = `${cookieString} domain=${hostname};`;
    }

    const select = document.querySelector(".goog-te-combo") as HTMLSelectElement;
    if (select) {
      select.value = lang.code;
      select.dispatchEvent(new Event("change"));
    }

    setCurrentLang(lang);
    setIsOpen(false);

    // Give a small delay for visual feedback before reload
    setTimeout(() => {
      window.location.reload();
    }, 300);
  };

  return (
    <div className="notranslate skiptranslate relative inline-block text-left z-50">
      <div id="google_translate_element"></div>

      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border border-orange-200/50 bg-white/70 backdrop-blur-md hover:bg-orange-50 transition-all duration-300 group shadow-[0_2px_10px_rgba(251,146,60,0.05)] active:scale-95 disabled:opacity-70 ${
          isOpen ? "ring-2 ring-orange-200/50 bg-orange-50" : ""
        }`}
      >
        {isLoading ? (
          <div className="w-3.5 h-3.5 border-2 border-orange-500/30 border-t-orange-600 rounded-full animate-spin" />
        ) : (
          <Globe size={14} className="text-orange-600 group-hover:rotate-45 transition-transform duration-500" />
        )}
        <span className="text-[11px] font-bold text-orange-950 flex items-center gap-2">
          <span className="text-sm grayscale-[0.2] group-hover:grayscale-0 transition-all">{currentLang.flag}</span>
          <span className="tracking-tight">{currentLang.name}</span>
        </span>
        <ChevronDown 
          size={12} 
          className={`text-orange-400 transition-transform duration-500 ${isOpen ? "rotate-180" : ""}`} 
        />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/[0.02]" onClick={() => setIsOpen(false)}></div>
          <div 
            className={`absolute ${align === "right" ? "right-0" : "left-0"} mt-2 w-44 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-orange-100/50 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-300 ${align === "right" ? "origin-top-right" : "origin-top-left"}`}
          >
            <div className="p-1.5 space-y-0.5">
              <div className="px-3 py-2 mb-1 border-b border-orange-50">
                 <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">Select Language</p>
              </div>
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang)}
                  className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-left transition-all duration-200 group ${
                    currentLang.code === lang.code 
                      ? "bg-orange-600 text-white shadow-lg shadow-orange-200" 
                      : "text-gray-700 hover:bg-orange-50 hover:text-orange-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-base transition-transform duration-300 ${currentLang.code === lang.code ? "" : "group-hover:scale-125"}`}>
                      {lang.flag}
                    </span>
                    <span className="text-xs font-bold leading-none">{lang.name}</span>
                  </div>
                  {currentLang.code === lang.code && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  )}
                </button>
              ))}
            </div>
            <div className="bg-orange-50/50 px-3 py-2 border-t border-orange-50">
               <p className="text-[9px] text-orange-400 font-medium italic">Powered by Google Translate</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
