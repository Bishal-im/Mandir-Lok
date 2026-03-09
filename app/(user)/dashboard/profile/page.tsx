"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { User as UserIcon, Mail, Loader2, Camera, Check, AlertCircle } from "lucide-react";
import { updateProfile } from "@/lib/actions/user";

interface UserProfile {
    _id: string;
    name: string;
    email: string;
    photo?: string;
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Form states
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [photo, setPhoto] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch("/api/auth/me");
                const resData = await res.json();

                if (resData.success && resData.data) {
                    const userData = resData.data;
                    setProfile(userData);
                    setName(userData.name || "");
                    setEmail(userData.email || "");
                    setPhoto(userData.photo || "");
                } else {
                    setError("Session expired. Please log in again.");
                }
            } catch (err) {
                setError("Failed to fetch profile details.");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert("File size should be less than 2MB");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhoto(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdating(true);
        setError("");
        setSuccess("");

        try {
            const res = await updateProfile({ name, email, photo });
            if (res.success) {
                setSuccess("Profile updated successfully!");
                // Optionally refresh profile state
                setProfile(prev => prev ? { ...prev, name, email, photo } : null);
                // Trigger a refresh of any components using this data (like Navbar/Sidebar)
                // If we were using a state management library, we'd update it here.
                // For now, simple state is enough for this page.
            } else {
                setError(res.message || "Failed to update profile");
            }
        } catch (err: any) {
            setError(err.message || "An error occurred");
        } finally {
            setUpdating(false);
        }
    };

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = "/";
    };

    return (
        <>
            <Navbar />
            <main className="pt-20 min-h-screen bg-[#fdf6ee]">
                <div className="container-app py-8">
                    <div className="grid lg:grid-cols-4 gap-8">

                        {/* ── Sidebar ── */}
                        <div className="lg:col-span-1">
                            <div className="bg-white border border-[#f0dcc8] rounded-2xl p-5 shadow-card">
                                <div className="text-center mb-5 pb-5 border-b border-[#f0dcc8]">
                                    <div className="relative w-24 h-24 mx-auto mb-3">
                                        {photo ? (
                                            <img
                                                src={photo}
                                                alt={name}
                                                className="w-full h-full rounded-full object-cover border-4 border-orange-100 shadow-sm"
                                            />
                                        ) : (
                                            <div className="w-full h-full rounded-full bg-gradient-to-br from-[#ff7f0a] to-[#8b0000] text-white font-display font-bold text-3xl flex items-center justify-center border-4 border-orange-100 shadow-sm">
                                                {name ? name.charAt(0).toUpperCase() : "🙏"}
                                            </div>
                                        )}
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#ff7f0a] shadow-md border border-orange-100 hover:bg-orange-50 transition-colors"
                                        >
                                            <Camera size={16} />
                                        </button>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handlePhotoChange}
                                            className="hidden"
                                            accept="image/*"
                                        />
                                    </div>
                                    <h2 className="font-display font-semibold text-[#1a1209]">
                                        {loading ? "Loading..." : name || "Devotee"}
                                    </h2>
                                    <p className="text-xs text-[#6b5b45]">{profile?.email || ""}</p>
                                </div>

                                <nav className="space-y-1">
                                    {[
                                        { label: "My Bookings", href: "/dashboard" },
                                        { label: "Profile", href: "/dashboard/profile", active: true },
                                        { label: "Saved Temples", href: "/dashboard/saved" },
                                        { label: "Notifications", href: "/dashboard/notifications" },
                                    ].map((item) => (
                                        <Link
                                            key={item.label}
                                            href={item.href}
                                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-colors ${item.active
                                                ? "bg-[#fff8f0] text-[#ff7f0a] font-semibold border border-[#ffd9a8]"
                                                : "text-[#6b5b45] hover:bg-[#fdf6ee] hover:text-[#ff7f0a]"
                                                }`}
                                        >
                                            {item.label}
                                        </Link>
                                    ))}

                                    <button
                                        onClick={handleLogout}
                                        className="flex w-full text-left items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-[#6b5b45] hover:bg-red-50 hover:text-red-500 transition-colors"
                                    >
                                        Logout
                                    </button>
                                </nav>
                            </div>
                        </div>

                        {/* ── Main Content ── */}
                        <div className="lg:col-span-3">
                            <div className="bg-white border border-[#f0dcc8] rounded-2xl p-6 md:p-8 shadow-card">
                                <h1 className="heading-md text-[#1a1209] mb-8 flex items-center gap-2">
                                    <UserIcon className="text-[#ff7f0a]" /> Edit Profile
                                </h1>

                                {loading ? (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <Loader2 size={32} className="animate-spin text-[#ff7f0a] mb-3" />
                                        <p className="text-sm text-[#6b5b45]">Loading profile details...</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleUpdate} className="space-y-6 max-w-xl">
                                        {error && (
                                            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm flex items-center gap-2 animate-in fade-in duration-300">
                                                <AlertCircle size={18} /> {error}
                                            </div>
                                        )}
                                        {success && (
                                            <div className="bg-green-50 border border-green-200 text-green-600 p-4 rounded-xl text-sm flex items-center gap-2 animate-in fade-in duration-300">
                                                <Check size={18} /> {success}
                                            </div>
                                        )}

                                        <div className="space-y-4">
                                            {/* Photo Preview in Form for small screens */}
                                            <div className="lg:hidden flex items-center gap-4 mb-6">
                                                <div className="relative w-16 h-16">
                                                    {photo ? (
                                                        <img src={photo} className="w-full h-full rounded-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full rounded-full bg-orange-100 flex items-center justify-center text-orange-500">
                                                            <UserIcon size={24} />
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="text-xs font-bold text-[#ff7f0a]"
                                                >
                                                    Change Photo
                                                </button>
                                            </div>

                                            {/* Name */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-[#6b5b45] uppercase tracking-wider ml-1">
                                                    Full Name
                                                </label>
                                                <div className="relative">
                                                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                    <input
                                                        type="text"
                                                        value={name}
                                                        onChange={(e) => setName(e.target.value)}
                                                        className="input-divine w-full !pl-12"
                                                        placeholder="Your Name"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            {/* Email */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-[#6b5b45] uppercase tracking-wider ml-1">
                                                    Email Address
                                                </label>
                                                <div className="relative">
                                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                    <input
                                                        type="email"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        className="input-divine w-full !pl-12"
                                                        placeholder="email@example.com"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-[#f0dcc8] flex items-center gap-4">
                                            <button
                                                type="submit"
                                                disabled={updating}
                                                className="btn-saffron px-8 py-3 min-w-[160px] flex items-center justify-center gap-2"
                                            >
                                                {updating ? (
                                                    <Loader2 size={18} className="animate-spin" />
                                                ) : (
                                                    'Save Changes'
                                                )}
                                            </button>
                                            <Link
                                                href="/dashboard"
                                                className="text-sm font-semibold text-[#6b5b45] hover:text-[#1a1209] transition-colors"
                                            >
                                                Cancel
                                            </Link>
                                        </div>
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
