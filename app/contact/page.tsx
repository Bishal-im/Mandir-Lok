"use client";

import { useState, useEffect } from "react";
import { getSettings } from "@/lib/actions/admin";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  Send,
  MessageSquare,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const SUBJECTS = [
  "Booking Help",
  "Payment Issue",
  "Pooja Enquiry",
  "Pandit Query",
  "Temple Information",
  "Technical Support",
  "Other",
];

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [settings, setSettings] = useState({
    bannerUrl: "",
    heroTitle: "How can we help you?",
    heroSubtitle: "Our team is here to help you with bookings, payment issues, or any queries about our poojas and services.",
    supportEmail: "support@mandirlok.com",
    phone: "+91 98765 43210",
    address: "Mandirlok Technologies, India",
    workingHours: "Mon – Sat, 9:00 AM – 7:00 PM IST"
  });

  useEffect(() => {
    async function fetchSettings() {
      const res = await getSettings("contact_settings");
      if (res && res.value) {
        setSettings(prev => ({ ...prev, ...res.value }));
      }
    }
    fetchSettings();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setSuccess(true);
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to send message";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        {/* Hero */}
        <div
          className="relative py-20 md:py-28 flex items-center justify-center overflow-hidden bg-gray-900"
          style={{
            backgroundImage: settings.bannerUrl ? `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${settings.bannerUrl})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {!settings.bannerUrl && <div className="absolute inset-0 bg-dark-temple opacity-90" />}
          <div className="section-container text-center relative z-10">
            <span className="bg-orange-500/20 text-orange-200 border border-orange-500/30 px-4 py-1.5 rounded-full text-[10px] md:text-xs font-bold tracking-widest uppercase mb-6 inline-flex items-center gap-2 backdrop-blur-sm">
              <MessageSquare size={12} />
              Get In Touch
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-white mt-2 leading-tight">
              {settings.heroTitle}
            </h1>
            <p className="text-orange-100/80 mt-6 text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-medium">
              {settings.heroSubtitle}
            </p>
          </div>
        </div>

        <div className="section-container py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left — Info */}
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  Contact Information
                </h2>
                <p className="text-gray-500 text-sm">
                  We usually reply within 2-4 hours.
                </p>
              </div>

              {[
                {
                  icon: <Phone size={18} className="text-orange-500" />,
                  label: "Phone",
                  value: settings.phone,
                  sub: settings.workingHours,
                },
                {
                  icon: <Mail size={18} className="text-orange-500" />,
                  label: "Email Support",
                  value: settings.supportEmail,
                  sub: "Replies in 2-4 hours",
                },
                {
                  icon: <MapPin size={18} className="text-orange-500" />,
                  label: "Corporate Office",
                  value: settings.address,
                  sub: "India",
                },
                {
                  icon: <Clock size={18} className="text-orange-500" />,
                  label: "Working Hours",
                  value: settings.workingHours,
                  sub: "Standard IST Time",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                >
                  <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                      {item.label}
                    </p>
                    <p className="font-semibold text-gray-800 text-sm mt-0.5">
                      {item.value}
                    </p>
                    <p className="text-gray-400 text-xs">{item.sub}</p>
                  </div>
                </div>
              ))}

              {/* Social / trust */}
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                <p className="text-sm font-semibold text-orange-700 mb-1">
                  We're Here For You
                </p>
                <p className="text-xs text-orange-600 leading-relaxed">
                  Our support team is available to assist you with any questions about our services or your bookings.
                </p>
              </div>
            </div>

            {/* Right — Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                {success ? (
                  <div className="text-center py-10">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 size={40} className="text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Message Sent Successfully!
                    </h3>
                    <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
                      Our team has received your message and will get back to you shortly. Thank you for reaching out!
                    </p>
                    <button
                      onClick={() => setSuccess(false)}
                      className="btn-outline text-sm px-6 py-2.5"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        Send us a Message
                      </h2>
                      <p className="text-gray-400 text-sm mt-0.5">
                        Fill out the form below and we'll respond as soon as possible.
                      </p>
                    </div>

                    {/* Name + Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          placeholder="Your name"
                          required
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="you@email.com"
                          required
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                        />
                      </div>
                    </div>

                    {/* Phone + Subject */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Phone / WhatsApp
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          placeholder="+91 98765 43210"
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Inquiry Subject
                        </label>
                        <select
                          name="subject"
                          value={form.subject}
                          onChange={handleChange}
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition bg-white"
                        >
                          <option value="">Select a subject</option>
                          {SUBJECTS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Message <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        placeholder="Describe your query in detail..."
                        required
                        rows={5}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition resize-none"
                      />
                      <p className="text-xs text-gray-400 mt-1 text-right">
                        {form.message.length}/500 characters
                      </p>
                    </div>

                    {/* Error */}
                    {error && (
                      <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-red-600 text-sm">
                        ⚠️ {error}
                      </div>
                    )}

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary w-full justify-center text-sm py-3 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <svg
                            className="animate-spin h-4 w-4"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                          </svg>
                          Sending Message...
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
