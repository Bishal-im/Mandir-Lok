"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Step = "email" | "otp";

export default function AdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [shake, setShake] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.success && data.data?.role === "admin") {
          router.replace("/admin");
        } else {
          setCheckingAuth(false);
        }
      } catch (err) {
        setCheckingAuth(false);
        console.error("Auth check failed", err);
      }
    }
    checkAuth();

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
  }, [resendTimer, router]);

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
        setError(data.message || "Failed to send OTP.");
        triggerShake();
      }
    } catch {
      setError("Failed to send OTP. Check connection.");
      triggerShake();
    }
    setLoading(false);
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter the 6-digit OTP.");
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
        // IMPORTANT: The verify-otp route doesn't check role.
        // We have a guard in layout, but for UX, let's verify here if possible.
        // Since verify-otp already sets cookie, we can try to hit /api/auth/me
        const meRes = await fetch("/api/auth/me");
        const meData = await meRes.json();

        if (meData.success && meData.data?.role === "admin") {
          router.replace("/admin");
        } else {
          const msg = meData.success ? "Access Restricted. User role is not admin." : (meData.message || "Access Restricted. You do not have admin permissions.");
          setError(msg);
          triggerShake();
        }
      } else {
        setError(data.message || "Incorrect OTP.");
        triggerShake();
      }
    } catch {
      setError("Verification failed.");
      triggerShake();
    }
    setLoading(false);
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  return (
    <div className="min-h-screen flex bg-[#fdf6ee] items-center justify-center p-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&display=swap');
        .display-font { font-family: 'Playfair Display', serif; }
        @keyframes shake { 0%,100%{transform:translateX(0)} 15%{transform:translateX(-8px)} 30%{transform:translateX(8px)} 45%{transform:translateX(-6px)} 60%{transform:translateX(6px)} 75%{transform:translateX(-3px)} 90%{transform:translateX(3px)} }
        .shake { animation: shake 0.6s cubic-bezier(.36,.07,.19,.97) both; }
        .btn-admin { background: #1a0a00; border: 1px solid #3d1a00; color: white; transition: all 0.2s; }
        .btn-admin:hover { background: #2d1200; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
      `}</style>

      <div className={`w-full max-w-md bg-white border border-gray-200 rounded-3xl p-8 shadow-xl ${shake ? 'shake' : ''}`}>
        {checkingAuth ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="w-10 h-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mb-4" />
            <p className="text-gray-500 text-sm">Verifying session...</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#ff7f0a] to-[#8b0000] flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg text-white font-bold">म</div>
              <h1 className="display-font text-2xl font-bold text-gray-900">Admin Portal</h1>
              <p className="text-sm text-gray-500 mt-1">Please sign in to your administrator account</p>
            </div>

            {step === "email" ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Admin Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@mandirlok.com"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 transition-colors"
                    autoFocus
                  />
                </div>
                {error && <p className="text-red-500 text-xs text-center">{error}</p>}
                <button
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="btn-admin w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                >
                  {loading ? "Sending..." : "Send OTP"}
                </button>
                <Link href="/login" className="block text-center text-xs text-gray-400 hover:text-orange-600 transition-colors">← Back to Devotee Login</Link>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-center text-sm text-gray-600">Verification code sent to <strong>{email}</strong></p>
                <div className="flex gap-2 justify-center">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { otpRefs.current[idx] = el; }}
                      type="text"
                      maxLength={1}
                      value={digit}
                      className="w-10 h-12 text-center text-lg font-bold bg-white border border-gray-200 rounded-xl focus:border-orange-500 outline-none"
                      onChange={(e) => {
                        const next = [...otp];
                        next[idx] = e.target.value.replace(/\D/g, "").slice(-1);
                        setOtp(next);
                        if (next[idx] && idx < 5) otpRefs.current[idx + 1]?.focus();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace" && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus();
                      }}
                    />
                  ))}
                </div>
                {error && <p className="text-red-500 text-xs text-center">{error}</p>}
                <button
                  onClick={handleVerify}
                  disabled={loading || otp.join("").length < 6}
                  className="btn-admin w-full py-4 rounded-xl font-bold text-sm"
                >
                  {loading ? "Verifying..." : "Verify & Login"}
                </button>
                <button onClick={() => setStep("email")} className="w-full text-center text-xs text-gray-400 hover:text-orange-600">Change Email</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
