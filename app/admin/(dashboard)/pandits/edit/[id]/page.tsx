"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, Info, Phone, Mail, Briefcase, FileText } from "lucide-react";
import Link from "next/link";
import { getPanditById, updatePandit, getTemplesAdmin } from "@/lib/actions/admin";

export default function EditPanditPage() {
    const { id } = useParams() as { id: string };
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
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
        whatsapp: "",
        email: "",
        photo: "",
        assignedTemples: [] as string[],
        experienceYears: 0,
        languages: [] as string[],
        bio: { en: "", hi: "", ne: "", mr: "", ta: "" },
        commissionPercentage: 80,
        isActive: true,
        aadhaarCardUrl: "",
        aadhaarStatus: "none" as string,
    });

    const [newLanguage, setNewLanguage] = useState("");

    const ensureLocalized = (val: any) => {
        if (typeof val === "object" && val !== null && !Array.isArray(val)) {
            return { en: "", hi: "", ne: "", mr: "", ta: "", ...val };
        }
        return { en: typeof val === "string" ? val : "", hi: "", ne: "", mr: "", ta: "" };
    };

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const [p, t] = await Promise.all([getPanditById(id), getTemplesAdmin()]);
                setTemples(t);
                if (p) {
                    const { _id, createdAt, updatedAt, __v, ...cleanData } = p;
                    const ids = cleanData.assignedTemples?.map((item: any) => typeof item === 'string' ? item : item._id) || [];
                    setFormData({
                        ...formData,
                        ...cleanData,
                        assignedTemples: ids,
                        languages: cleanData.languages || [],
                        bio: ensureLocalized(cleanData.bio)
                    });
                } else {
                    setError("Pandit not found");
                }
            } catch (err) {
                setError("Failed to load data");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [id]);

    const handleLocalizedChange = (field: string, val: string, lang: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: { ...(prev as any)[field], [lang]: val }
        }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const val = type === "number" ? Number(value) : value;
        setFormData((prev) => ({ ...prev, [name]: val }));
    };

    const toggleTemple = (templeId: string) => {
        setFormData(prev => ({
            ...prev,
            assignedTemples: prev.assignedTemples.includes(templeId)
                ? prev.assignedTemples.filter(i => i !== templeId)
                : [...prev.assignedTemples, templeId]
        }));
    };

    const addLanguage = () => {
        if (newLanguage && !formData.languages.includes(newLanguage)) {
            setFormData(prev => ({ ...prev, languages: [...prev.languages, newLanguage] }));
            setNewLanguage("");
        }
    };

    const removeLanguage = (lang: string) => {
        setFormData(prev => ({ ...prev, languages: prev.languages.filter(l => l !== lang) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError("");

        try {
            const res = await updatePandit(id, formData);
            if (res.success) {
                router.push("/admin/pandits");
            } else {
                setError(res.error || "Failed to update profile");
            }
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center text-gray-400">Loading profile...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/pandits" className="p-2 rounded-xl bg-white border border-gray-100 text-gray-500 hover:text-[#ff7f0a] transition-colors">
                    <ChevronLeft size={20} />
                </Link>
                <div>
                    <h2 className="text-2xl font-display font-bold text-gray-900">Edit Pandit Profile</h2>
                    <p className="text-sm text-gray-500">Update professional details for {formData.name}</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                    <Info size={16} /> {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 pb-20">
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

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
                        <input required name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#ff7f0a]/20" />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1 tracking-wider"><Phone size={12} /> Phone</label>
                        <input name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#ff7f0a]/20" />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1 tracking-wider"><Mail size={12} /> Email</label>
                        <input name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#ff7f0a]/20" />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1 tracking-wider"><Briefcase size={12} /> Experience (Years)</label>
                        <input type="number" name="experienceYears" value={formData.experienceYears} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#ff7f0a]/20" />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Commission %</label>
                        <input type="number" name="commissionPercentage" value={formData.commissionPercentage} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#ff7f0a]/20" />
                    </div>

                    <div className="col-span-2 space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bio / Background ({activeLang})</label>
                        <textarea 
                            value={(formData.bio as any)[activeLang]} 
                            onChange={e => handleLocalizedChange("bio", e.target.value, activeLang)} 
                            rows={5} 
                            placeholder={`Enter bio in ${activeLang}...`}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#ff7f0a]/20 resize-none" 
                        />
                    </div>
                    
                    <div className="col-span-2 space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Spoken Languages</label>
                        <div className="flex gap-2">
                            <input value={newLanguage} onChange={e => setNewLanguage(e.target.value)} placeholder="e.g. Sanskrit" className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm" />
                            <button type="button" onClick={addLanguage} className="px-4 py-2 bg-gray-100 rounded-xl hover:bg-[#ff7f0a] hover:text-white transition-all text-xs font-bold">Add</button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {formData.languages.map(l => (
                                <span key={l} className="bg-orange-50 text-[#ff7f0a] px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 border border-orange-100">
                                    {l} <button type="button" onClick={() => removeLanguage(l)}>✕</button>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-4">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">Assigned Temples</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-2xl max-h-60 overflow-y-auto border border-gray-100">
                        {temples.map((t: any) => (
                            <label key={t._id} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl cursor-pointer hover:border-[#ff7f0a]/30 transition-all shadow-sm">
                                <input
                                    type="checkbox"
                                    checked={formData.assignedTemples.includes(t._id)}
                                    onChange={() => toggleTemple(t._id)}
                                    className="w-4 h-4 text-[#ff7f0a] rounded border-gray-300 focus:ring-[#ff7f0a]"
                                />
                                <span className="text-sm font-medium text-gray-700">{t.name}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Aadhaar Card - Read Only for Admin */}
                {formData.aadhaarCardUrl && (
                    <div className="bg-white rounded-3xl border border-red-50 shadow-sm p-8 space-y-4">
                        <div className="flex items-center gap-2">
                            <FileText size={18} className="text-[#ff7f0a]" />
                            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Identity Verification (Aadhaar)</span>
                            <span className={`ml-auto px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${formData.aadhaarStatus === 'verified' ? 'bg-green-100 text-green-700' :
                                    formData.aadhaarStatus === 'rejected' ? 'bg-red-100 text-red-600' :
                                        formData.aadhaarStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-gray-100 text-gray-500'
                                } shadow-sm`}>{formData.aadhaarStatus || 'none'}</span>
                        </div>
                        <div className="relative rounded-2xl overflow-hidden border border-gray-100 shadow-md max-w-sm group">
                            <img src={formData.aadhaarCardUrl} alt="Aadhaar Card" className="w-full object-cover" />
                            <a href={formData.aadhaarCardUrl} target="_blank" className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-bold text-xs uppercase">View Full Image</a>
                        </div>
                        <div className="flex gap-2">
                            <button type="button" onClick={() => fetch(`/api/admin/pandit/aadhaar`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status: 'verified' }) }).then(() => setFormData(p => ({ ...p, aadhaarStatus: 'verified' })))} className="px-6 py-2.5 bg-green-500 text-white text-xs font-bold rounded-xl hover:bg-green-600 transition-all shadow-md">
                                Approve Account
                            </button>
                            <button type="button" onClick={() => fetch(`/api/admin/pandit/aadhaar`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status: 'rejected' }) }).then(() => setFormData(p => ({ ...p, aadhaarStatus: 'rejected' })))} className="px-6 py-2.5 bg-red-50 text-red-500 text-xs font-bold rounded-xl hover:bg-red-100 transition-all border border-red-100">
                                Reject Documents
                            </button>
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-3 pt-4 px-2">
                    <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} className="w-5 h-5 text-[#ff7f0a] rounded border-gray-300 focus:ring-[#ff7f0a]" />
                    <label htmlFor="isActive" className="text-sm font-bold text-gray-700">Account Active</label>
                </div>

                <div className="flex justify-end gap-3 pt-6">
                    <Link href="/admin/pandits" className="px-8 py-3 rounded-xl border border-gray-200 text-gray-500 font-semibold hover:bg-gray-50 transition-colors">Cancel</Link>
                    <button type="submit" disabled={saving} className="px-10 py-3 rounded-xl bg-[#ff7f0a] text-white font-bold shadow-lg shadow-[#ff7f0a]/30 hover:shadow-[#ff7f0a]/40 hover:-translate-y-0.5 transition-all outline-none">
                        {saving ? "Saving Changes..." : "Save Pandit Profile"}
                    </button>
                </div>
            </form>
        </div>
    );
}