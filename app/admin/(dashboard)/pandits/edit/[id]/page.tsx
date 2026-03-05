"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, Save, MapPin, Info, Phone, Mail, User, Briefcase, FileText, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { getPanditById, updatePandit, getTemplesAdmin } from "@/lib/actions/admin";

export default function EditPanditPage() {
    const { id } = useParams() as { id: string };
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [temples, setTemples] = useState([]);

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        whatsapp: "",
        email: "",
        photo: "",
        assignedTemples: [] as string[],
        experienceYears: 0,
        languages: [] as string[],
        bio: "",
        commissionPercentage: 80,
        isActive: true,
        aadhaarCardUrl: "",
        aadhaarStatus: "none" as string,
    });

    const [newLanguage, setNewLanguage] = useState("");

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const [p, t] = await Promise.all([getPanditById(id), getTemplesAdmin()]);
                setTemples(t);
                if (p) {
                    const { _id, createdAt, updatedAt, __v, ...cleanData } = p;
                    // Ensure assignedTemples is array of IDs
                    const ids = cleanData.assignedTemples?.map((item: any) => typeof item === 'string' ? item : item._id) || [];
                    setFormData({
                        ...formData,
                        ...cleanData,
                        assignedTemples: ids,
                        languages: cleanData.languages || []
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError("");

        try {
            // Include pending language
            let finalLangs = [...formData.languages];
            if (newLanguage && !finalLangs.includes(newLanguage)) finalLangs.push(newLanguage);

            const res = await updatePandit(id, { ...formData, languages: finalLangs });
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

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                        <input required name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none" />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1"><Phone size={12} /> Phone</label>
                        <input name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none" />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1"><Mail size={12} /> Email</label>
                        <input name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none" />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1"><Briefcase size={12} /> Experience (Years)</label>
                        <input type="number" name="experienceYears" value={formData.experienceYears} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none" />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase">Commission %</label>
                        <input type="number" name="commissionPercentage" value={formData.commissionPercentage} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none" />
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Assigned Temples</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-2xl max-h-60 overflow-y-auto">
                        {temples.map((t: any) => (
                            <label key={t._id} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl cursor-pointer hover:border-[#ff7f0a]/30 transition-all">
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

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase">Bio / Background</label>
                        <textarea name="bio" value={formData.bio} onChange={handleChange} rows={4} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none" />
                    </div>

                    <div className="flex flex-wrap gap-6 pt-2">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} className="w-5 h-5 text-[#ff7f0a] rounded border-gray-300" />
                            <span className="text-sm font-bold text-gray-700">Is Active</span>
                        </label>
                    </div>
                </div>

                {/* Aadhaar Card - Read Only for Admin */}
                {formData.aadhaarCardUrl && (
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-3">
                        <div className="flex items-center gap-2">
                            <FileText size={16} className="text-[#ff7f0a]" />
                            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Aadhaar Card (Submitted)</span>
                            <span className={`ml-auto px-2 py-0.5 rounded text-[9px] font-bold uppercase ${formData.aadhaarStatus === 'verified' ? 'bg-green-100 text-green-700' :
                                    formData.aadhaarStatus === 'rejected' ? 'bg-red-100 text-red-600' :
                                        formData.aadhaarStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-gray-100 text-gray-500'
                                }`}>{formData.aadhaarStatus || 'none'}</span>
                        </div>
                        <div className="relative rounded-2xl overflow-hidden border border-gray-100 shadow-inner max-w-sm">
                            <img src={formData.aadhaarCardUrl} alt="Aadhaar Card" className="w-full object-cover" />
                        </div>
                        <div className="flex gap-2 mt-2">
                            <button type="button" onClick={() => fetch(`/api/admin/pandit/aadhaar`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status: 'verified' }) }).then(() => setFormData(p => ({ ...p, aadhaarStatus: 'verified' })))} className="px-4 py-1.5 bg-green-100 text-green-700 text-xs font-bold rounded-xl hover:bg-green-200 transition-all">
                                ✓ Mark Verified
                            </button>
                            <button type="button" onClick={() => fetch(`/api/admin/pandit/aadhaar`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status: 'rejected' }) }).then(() => setFormData(p => ({ ...p, aadhaarStatus: 'rejected' })))} className="px-4 py-1.5 bg-red-100 text-red-600 text-xs font-bold rounded-xl hover:bg-red-200 transition-all">
                                ✕ Reject
                            </button>
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                    <Link href="/admin/pandits" className="px-8 py-3 rounded-xl border border-gray-200 text-gray-500 font-semibold">Cancel</Link>
                    <button type="submit" disabled={saving} className="px-10 py-3 rounded-xl bg-[#ff7f0a] text-white font-bold shadow-lg shadow-[#ff7f0a]/30 transition-all">
                        {saving ? "Saving..." : "Update Profile"}
                    </button>
                </div>
            </form>
        </div>
    );
}