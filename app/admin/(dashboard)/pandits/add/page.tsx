"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Info, Briefcase, Mail, Phone, User } from "lucide-react";
import Link from "next/link";
import { createPandit, getTemplesAdmin } from "@/lib/actions/admin";

export default function AddPanditPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [temples, setTemples] = useState([]);

    const languages = [
        { code: "en", name: "English" },
        { code: "hi", name: "Hindi" },
        { code: "ne", name: "Nepali" },
        { code: "mr", name: "Marathi" },
        { code: "ta", name: "Tamil" },
    ];
    const [activeLang, setActiveLang] = useState("en");

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        photo: "",
        assignedTemples: [] as string[],
        experienceYears: 0,
        languages: [] as string[],
        bio: { en: "", hi: "", ne: "", mr: "", ta: "" },
        commissionPercentage: 80,
    });

    useEffect(() => {
        async function fetch() {
            const data = await getTemplesAdmin();
            setTemples(data);
        }
        fetch();
    }, []);

    const toggleTemple = (id: string) => {
        setFormData(prev => ({
            ...prev,
            assignedTemples: prev.assignedTemples.includes(id)
                ? prev.assignedTemples.filter(i => i !== id)
                : [...prev.assignedTemples, id]
        }));
    };

    const handleLocalizedChange = (field: string, val: string, lang: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: { ...(prev as any)[field], [lang]: val }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        const payload = {
            ...formData,
            email: formData.email.toLowerCase().trim(),
            phone: formData.phone.trim() || null,
        };
        const res = await createPandit(payload);
        setLoading(false);
        if (res.success) {
            router.push("/admin/pandits");
        } else {
            setError(res.error || "Failed to add Pandit. Please check the details and try again.");
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/pandits" className="p-2 rounded-xl bg-white border border-gray-100 text-gray-500 hover:text-[#ff7f0a] transition-colors"><ChevronLeft size={20} /></Link>
                <h2 className="text-2xl font-display font-bold text-gray-900">Add New Pandit</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 pb-20">
                {error && (
                    <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-medium flex items-center gap-2">
                        <Info size={16} /> {error}
                    </div>
                )}

                {/* Language Toggler */}
                <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-2xl w-fit">
                    {languages.map(l => (
                        <button
                            key={l.code}
                            type="button"
                            onClick={() => setActiveLang(l.code)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeLang === l.code ? "bg-white text-[#ff7f0a] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                        >
                            {l.name}
                        </button>
                    ))}
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2 space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1"><User size={12} /> Full Name</label>
                        <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Pt. Ramesh Sharma" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#ff7f0a]/20" />
                    </div>
                    
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1"><Mail size={12} /> Email Address</label>
                        <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="pandit@example.com" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#ff7f0a]/20" />
                    </div>
                    
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1"><Phone size={12} /> Phone (Optional)</label>
                        <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="Alternative contact" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#ff7f0a]/20" />
                    </div>
                    
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1"><Briefcase size={12} /> Experience (Years)</label>
                        <input type="number" value={formData.experienceYears} onChange={e => setFormData({ ...formData, experienceYears: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#ff7f0a]/20" />
                    </div>
                    
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Commission %</label>
                        <input type="number" value={formData.commissionPercentage} onChange={e => setFormData({ ...formData, commissionPercentage: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#ff7f0a]/20" />
                    </div>

                    <div className="col-span-2 space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bio / Background ({activeLang})</label>
                        <textarea 
                            value={(formData.bio as any)[activeLang]} 
                            onChange={e => handleLocalizedChange("bio", e.target.value, activeLang)} 
                            rows={4} 
                            placeholder={`Enter Pandit's bio in ${activeLang}...`} 
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#ff7f0a]/20 resize-none" 
                        />
                    </div>

                    <div className="col-span-2 space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Assign Temples</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            {temples.map((t: any) => (
                                <label key={t._id} className="flex items-center gap-3 p-2 bg-white rounded-lg cursor-pointer hover:border-[#ff7f0a]/30 transition-all border border-transparent">
                                    <input type="checkbox" checked={formData.assignedTemples.includes(t._id)} onChange={() => toggleTemple(t._id)} className="w-4 h-4 text-[#ff7f0a] rounded border-gray-300 focus:ring-[#ff7f0a]" />
                                    <span className="text-sm text-gray-700 font-medium">{t.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6 flex items-start gap-4 shadow-sm">
                    <Info className="text-blue-500 shrink-0 mt-1" size={20} />
                    <p className="text-sm text-blue-700 leading-relaxed font-medium">
                        The Pandit's photo, WhatsApp number, and verified documents will be managed directly from their specialized Pandit Dashboard after their initial registration here.
                    </p>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Link href="/admin/pandits" className="px-8 py-3 rounded-xl border border-gray-200 text-gray-500 font-semibold hover:bg-gray-50 transition-colors">Cancel</Link>
                    <button disabled={loading} type="submit" className="px-10 py-3 rounded-xl bg-[#ff7f0a] text-white font-bold shadow-lg shadow-[#ff7f0a]/30 hover:shadow-xl hover:shadow-[#ff7f0a]/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                        {loading ? "Registering..." : "Register Pandit"}
                    </button>
                </div>
            </form>
        </div>
    );
}
