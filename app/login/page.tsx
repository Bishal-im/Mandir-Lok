"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

type Step = "email" | "otp" | "name";

export default function LoginPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [shake, setShake] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (resendTimer > 0) {
      timerRef.current = setInterval(() => {
        setResendTimer((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current!);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resendTimer]);

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleSendOtp = async () => {
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      triggerShake();
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setStep("otp");
        setResendTimer(30);
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      } else {
        setError(data.message || "Failed to send OTP. Please try again.");
        triggerShake();
      }
    } catch {
      setError("Failed to send OTP. Please check your connection.");
      triggerShake();
    }
    setLoading(false);
  };

  const handleOtpChange = (idx: number, val: string) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[idx] = digit;
    setOtp(next);
    setError("");
    if (digit && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0)
      otpRefs.current[idx - 1]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      otpRefs.current[5]?.focus();
    }
    e.preventDefault();
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter the full 6-digit OTP.");
      triggerShake();
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code }),
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        // If user already has a name, go home; otherwise collect name
        if (data.hasName) {
          window.location.href = "/dashboard";
        } else {
          setStep("name");
        }
      } else {
        setError(data.message || "Incorrect OTP. Please try again.");
        triggerShake();
        setOtp(["", "", "", "", "", ""]);
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      }
    } catch {
      setError("Failed to verify OTP. Please check your connection.");
      triggerShake();
    }
    setLoading(false);
  };

  const handleSaveName = async () => {
    if (!name.trim()) {
      setError("Please enter your name.");
      triggerShake();
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/update-name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        window.location.href = "/dashboard";
      } else {
        setError(data.message || "Failed to save name. Please try again.");
        triggerShake();
      }
    } catch {
      setError("Failed to save name. Please check your connection.");
      triggerShake();
    }
    setLoading(false);
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setOtp(["", "", "", "", "", ""]);
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setResendTimer(30);
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      } else {
        setError(data.message || "Failed to resend OTP.");
        triggerShake();
      }
    } catch {
      setError("Failed to resend OTP. Please check your connection.");
      triggerShake();
    }
    setLoading(false);
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=DM+Sans:wght@400;500;600&display=swap');
        .display-font { font-family: 'Playfair Display', serif; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shake { 0%,100%{transform:translateX(0)} 15%{transform:translateX(-8px)} 30%{transform:translateX(8px)} 45%{transform:translateX(-6px)} 60%{transform:translateX(6px)} 75%{transform:translateX(-3px)} 90%{transform:translateX(3px)} }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes float { 0%,100%{transform:translateY(0px) rotate(0deg)} 33%{transform:translateY(-8px) rotate(2deg)} 66%{transform:translateY(-4px) rotate(-1deg)} }
        @keyframes pulse-ring { 0%{box-shadow:0 0 0 0 rgba(249,115,22,0.4)} 70%{box-shadow:0 0 0 12px rgba(249,115,22,0)} 100%{box-shadow:0 0 0 0 rgba(249,115,22,0)} }
        @keyframes success-pop { 0%{transform:scale(0.5);opacity:0} 60%{transform:scale(1.15)} 80%{transform:scale(0.95)} 100%{transform:scale(1);opacity:1} }
        @keyframes shimmer-btn { 0%{background-position:-200% center} 100%{background-position:200% center} }
        .fade-up { animation: fadeUp 0.5s ease-out both; }
        .fade-up-1 { animation: fadeUp 0.5s 0.1s ease-out both; }
        .fade-up-2 { animation: fadeUp 0.5s 0.2s ease-out both; }
        .fade-up-3 { animation: fadeUp 0.5s 0.3s ease-out both; }
        .fade-up-4 { animation: fadeUp 0.5s 0.4s ease-out both; }
        .shake { animation: shake 0.6s cubic-bezier(.36,.07,.19,.97) both; }
        .spinner { width:18px;height:18px;border:2px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;animation:spin 0.7s linear infinite;display:inline-block; }
        .float-diya { animation: float 4s ease-in-out infinite; }
        .float-diya-2 { animation: float 5s 1s ease-in-out infinite; }
        .float-diya-3 { animation: float 6s 2s ease-in-out infinite; }
        .btn-primary { background:linear-gradient(90deg,#c2410c 0%,#ea580c 35%,#fb923c 55%,#ea580c 75%,#c2410c 100%);background-size:200% auto;transition:background-position 0.4s ease,transform 0.15s ease,box-shadow 0.2s ease; }
        .btn-primary:hover { animation:shimmer-btn 1.5s linear infinite;box-shadow:0 8px 30px rgba(234,88,12,0.45);transform:translateY(-1px); }
        .btn-primary:active { transform:translateY(0) scale(0.98); }
        .otp-input { caret-color:#ea580c;transition:all 0.2s ease; }
        .otp-input:focus { border-color:#ea580c !important;box-shadow:0 0 0 3px rgba(234,88,12,0.15);transform:scale(1.08); }
        .otp-input.filled { border-color:#ea580c;background:#fff7ed;color:#c2410c; }
        .success-icon { animation:success-pop 0.6s cubic-bezier(.34,1.56,.64,1) forwards; }
        .left-panel-deco { background:radial-gradient(ellipse at 20% 20%,rgba(251,146,60,0.15) 0%,transparent 50%),radial-gradient(ellipse at 80% 80%,rgba(220,38,38,0.1) 0%,transparent 50%),linear-gradient(145deg,#1a0500 0%,#3d0a00 40%,#2d0600 100%); }
        .email-input-wrap input:focus { outline:none;border-color:#ea580c;box-shadow:0 0 0 3px rgba(234,88,12,0.12); }
        .google-btn:hover { border-color:#ea580c;background:#fff7ed;transform:translateY(-1px);box-shadow:0 4px 16px rgba(0,0,0,0.08); }
        .pulse-ring { animation:pulse-ring 2s ease-out infinite; }
        .name-input:focus { outline:none;border-color:#ea580c;box-shadow:0 0 0 3px rgba(234,88,12,0.12); }
      `}</style>

      {/* LEFT DECORATIVE PANEL */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-[42%] left-panel-deco flex-col items-center justify-center relative overflow-hidden p-12">
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
          <div className="w-[500px] h-[500px] rounded-full border-[40px] border-orange-300" />
          <div className="absolute w-[380px] h-[380px] rounded-full border-[2px] border-dashed border-orange-400" />
          <div className="absolute w-[260px] h-[260px] rounded-full border-[20px] border-orange-300" />
        </div>
        <div className="absolute top-16 left-12 float-diya text-4xl opacity-70"></div>
        <div className="absolute top-32 right-16 float-diya-2 text-3xl opacity-50"></div>
        <div className="absolute bottom-24 left-16 float-diya-3 text-3xl opacity-60"></div>
        <div className="absolute bottom-16 right-12 float-diya text-2xl opacity-40"></div>
        <div className="relative z-10 text-center">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-orange-500 to-rose-700 flex items-center justify-center text-5xl mx-auto mb-8 shadow-2xl shadow-orange-900/50 pulse-ring">
          </div>
          <h2 className="display-font text-4xl xl:text-5xl font-bold text-white mb-4 leading-tight">
            Welcome to
            <br />
            <span className="text-orange-400">Mandirlok</span>
          </h2>
          <p className="text-orange-200/80 text-base leading-relaxed max-w-xs mx-auto mb-10">
            Your sacred gateway to divine blessings. Connect with 500+ temples
            across India — from anywhere in the world.
          </p>
          <div className="space-y-3">
            {[
              { icon: "", text: "1 Million+ Devotees Trust Us" },
              { icon: "", text: "500+ Sacred Temples" },
              { icon: "", text: "Video Proof of Every Puja" },
              { icon: "", text: "100% Secure & Private" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-white/10"
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-white/80 text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT FORM PANEL */}
      <div className="flex-1 flex items-center justify-center bg-[#fdf6ee] p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8 fade-up">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center text-3xl mx-auto mb-3 shadow-lg">
            </div>
            <h1 className="display-font text-2xl font-bold text-[#1a0500]">Mandirlok</h1>
            <p className="text-orange-600 text-xs font-semibold tracking-widest uppercase mt-1">
              Sacred Services
            </p>
          </div>

          {/* STEP 1: EMAIL */}
          {step === "email" && (
            <div key="email-step">
              <div className="fade-up mb-2">
                <span className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1.5 rounded-full border border-orange-200">
                  ✦ Sign in to your account
                </span>
              </div>
              <h1 className="display-font fade-up-1 text-3xl xl:text-4xl font-bold text-[#1a0500] mb-2 leading-tight">
                Enter your
                <br />
                email address
              </h1>
              <p className="fade-up-2 text-gray-500 text-sm mb-8 leading-relaxed">
                We'll send a 6-digit OTP to your email. No password needed.
              </p>
              <div className={`space-y-5 fade-up-3 ${shake ? "shake" : ""}`}>
                <div className="email-input-wrap">
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                      placeholder="yourname@email.com"
                      className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-2xl text-[#1a0500] text-sm font-medium placeholder-gray-400 transition-all duration-200"
                      autoFocus
                      autoComplete="email"
                    />
                  </div>
                  {error && (
                    <p className="mt-2 text-red-500 text-xs flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {error}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl text-white font-bold text-sm shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <span className="spinner" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      Send OTP to Email
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </>
                  )}
                </button>

              </div>
              <p className="fade-up-4 mt-6 text-center text-xs text-gray-400 leading-relaxed">
                By continuing, you agree to our{" "}
                <Link href="/terms" className="text-orange-600 hover:underline font-medium">Terms of Service</Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-orange-600 hover:underline font-medium">Privacy Policy</Link>
              </p>
            </div>
          )}

          {/* STEP 2: OTP */}
          {step === "otp" && (
            <div key="otp-step">
              <button
                onClick={() => {
                  setStep("email");
                  setOtp(["", "", "", "", "", ""]);
                  setError("");
                }}
                className="fade-up flex items-center gap-2 text-gray-500 hover:text-orange-600 text-sm font-medium mb-6 transition-colors group"
              >
                <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              <div className="fade-up flex items-center justify-center w-16 h-16 bg-orange-100 rounded-2xl mb-5 border border-orange-200">
                <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="display-font fade-up-1 text-3xl font-bold text-[#1a0500] mb-2">
                Check your email
              </h1>
              <p className="fade-up-2 text-gray-500 text-sm mb-1 leading-relaxed">
                We sent a 6-digit code to
              </p>
              <p className="fade-up-2 text-[#1a0500] text-sm font-bold mb-8">
                {email}
              </p>

              <div className={`fade-up-3 ${shake ? "shake" : ""}`}>
                <div className="flex gap-2.5 justify-center mb-4" onPaste={handleOtpPaste}>
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { otpRefs.current[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className={`otp-input w-11 h-12 text-center text-lg font-bold bg-white border-2 rounded-xl transition-all duration-200 ${digit ? "filled border-orange-400 bg-orange-50 text-orange-700" : "border-gray-200 text-gray-900"}`}
                    />
                  ))}
                </div>
                {error && (
                  <p className="mb-4 text-red-500 text-xs flex items-center justify-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </p>
                )}
                <button
                  onClick={handleVerify}
                  disabled={loading || otp.join("").length < 6}
                  className="btn-primary w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl text-white font-bold text-sm shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                >
                  {loading ? (
                    <>
                      <span className="spinner" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify & Sign In{" "}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </>
                  )}
                </button>
                <div className="text-center text-sm text-gray-500">
                  Didn't receive it?{" "}
                  <button
                    onClick={handleResend}
                    disabled={resendTimer > 0 || loading}
                    className={`font-bold transition-colors ${resendTimer > 0 ? "text-gray-400 cursor-not-allowed" : "text-orange-600 hover:text-orange-700 hover:underline"}`}
                  >
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: NAME */}
          {step === "name" && (
            <div key="name-step">
              <div className="success-icon w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-400 to-rose-600 flex items-center justify-center text-4xl mx-auto mb-6 shadow-2xl shadow-orange-200">
              </div>
              <div className="fade-up mb-2 text-center">
                <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full border border-green-200">
                  ✓ Email verified successfully
                </span>
              </div>
              <h1 className="display-font fade-up-1 text-3xl font-bold text-[#1a0500] mb-2 text-center mt-4">
                Almost there!
              </h1>
              <p className="fade-up-2 text-gray-500 text-sm mb-8 text-center leading-relaxed">
                Tell us your name for a personalized divine experience.
              </p>
              <div className={`space-y-5 fade-up-3 ${shake ? "shake" : ""}`}>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setError("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                    placeholder="Enter your full name"
                    className="name-input w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-2xl text-[#1a0500] text-sm font-medium placeholder-gray-400 transition-all duration-200"
                    autoFocus
                    autoComplete="name"
                  />
                  {error && (
                    <p className="mt-2 text-red-500 text-xs flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {error}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleSaveName}
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl text-white font-bold text-sm shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <span className="spinner" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Start My Journey
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}