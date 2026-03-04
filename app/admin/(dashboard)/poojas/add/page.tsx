"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Info, Plus, X, IndianRupee, Clock, Image as ImageIcon } from "lucide-react";
import CloudinaryUploader from "@/components/admin/CloudinaryUploader";
import Link from "next/link";
import { createPooja, getTemplesAdmin } from "@/lib/actions/admin";

export default function AddPoojaPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [temples, setTemples] = useState<any[]>([]);
    
    const languages = [
        { code: "en", name: "English" },
        { code: "hi", name: "Hindi" },
        { code: "ne", name: "Nepali" },
        { code: "mr", name: "Marathi" },
        { code: "ta", name: "Tamil" },
    ];
    const [activeLang, setActiveLang] = useState("en");

    const [formData, setFormData] = useState({
        name: { en: "", hi: "", ne: "", mr: "", ta: "" },
        slug: "",
        templeIds: [] as string[],
        deity: "",
        emoji: "🪔",
        description: { en: "", hi: "", ne: "", mr: "", ta: "" },
        about: { en: "", hi: "", ne: "", mr: "", ta: "" },
        duration: { en: "45-60 Minutes", hi: "45-60 मिनट", ne: "45-60 मिनेट", mr: "45-60 मिनिटे", ta: "45-60 நிமிடங்கள்" },
        benefits: [] as any[], // Array of LocalizedString
        includes: [] as any[], // Array of LocalizedString
        tag: { en: "", hi: "", ne: "", mr: "", ta: "" },
        tagColor: "bg-orange-500",
        isActive: true,
        isFeatured: false,
        availableDays: "Every Day",
        images: [] as string[],
        packages: [] as { name: any; members: number; price: number }[],
    });

    const [newBenefit, setNewBenefit] = useState({ en: "", hi: "", ne: "", mr: "", ta: "" });
    const [newInclude, setNewInclude] = useState({ en: "", hi: "", ne: "", mr: "", ta: "" });
    const [newPackage, setNewPackage] = useState({ 
        name: { en: "", hi: "", ne: "", mr: "", ta: "" }, 
        members: 1, 
        price: 0 
    });
    const [newImageUrl, setNewImageUrl] = useState("");

    useEffect(() => {
        async function fetchTemples() {
            const data = await getTemplesAdmin();
            setTemples(data);
        }
        fetchTemples();
    }, []);

    const handleLocalizedChange = (field: string, val: string, lang: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: { ...(prev as any)[field], [lang]: val }
        }));

        if (field === "name" && lang === "en") {
            setFormData(prev => ({
                ...prev,
                slug: val.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, ""),
            }));
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
        setFormData((prev) => ({ ...prev, [name]: val }));
    };

    const addArrayItem = (type: "benefits" | "includes" | "images") => {
        if (type === "images") {
            if (newImageUrl && !formData.images.includes(newImageUrl)) {
                setFormData(prev => ({ ...prev, images: [...prev.images, newImageUrl] }));
                setNewImageUrl("");
            }
            return;
        }

        const val = type === "benefits" ? newBenefit : newInclude;
        if (val.en) {
            setFormData(prev => ({ ...prev, [type]: [...prev[type], { ...val }] }));
            if (type === "benefits") setNewBenefit({ en: "", hi: "", ne: "", mr: "", ta: "" });
            else setNewInclude({ en: "", hi: "", ne: "", mr: "", ta: "" });
        }
    };

    const removeArrayItem = (type: "benefits" | "includes" | "images", index: number) => {
        setFormData(prev => ({ 
            ...prev, 
            [type]: prev[type].filter((_, i) => i !== index) 
        }));
    };

    const addPackage = () => {
        if (newPackage.name.en && newPackage.price > 0) {
            setFormData(prev => ({ 
                ...prev, 
                packages: [...(prev.packages || []), { ...newPackage }] 
            }));
            setNewPackage({ 
                name: { en: "", hi: "", ne: "", mr: "", ta: "" }, 
                members: 1, 
                price: 0 
            });
        }
    };

    const removePackage = (index: number) => {
        setFormData(prev => ({ ...prev, packages: prev.packages.filter((_, i) => i !== index) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.templeIds.length === 0) { setError("Please select at least one temple"); return; }
        setLoading(true);
        try {
            const res = await createPooja(formData);
            if (res.success) router.push("/admin/poojas");
            else setError(res.error || "Failed to create pooja");
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/poojas" className="p-2 rounded-xl bg-white border border-gray-100 text-gray-500 hover:text-[#ff7f0a] transition-colors">
                    <ChevronLeft size={20} />
                </Link>
                <div>
                    <h2 className="text-2xl font-display font-bold text-gray-900">Add New Pooja</h2>
                    <p className="text-sm text-gray-500">Define a ritual, set pricing, and assign to a temple.</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                    <Info size={16} /> {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Language Toggler */}
                <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-2xl w-fit sticky top-0 z-30 shadow-md">
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

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pooja Name ({activeLang})</label>
                        <input 
                            required 
                            value={(formData.name as any)[activeLang]} 
                            onChange={(e) => handleLocalizedChange("name", e.target.value, activeLang)} 
                            placeholder={`Pooja name in ${languages.find(l => l.code === activeLang)?.name}`} 
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#ff7f0a]/20 focus:border-[#ff7f0a] outline-none" 
                        />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Temple Assignments</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 max-h-48 overflow-y-auto">
                            {temples.map((t: any) => (
                                <label key={t._id} className="flex items-center gap-2 cursor-pointer group">
                                    <input 
                                        type="checkbox" 
                                        checked={formData.templeIds.includes(t._id)}
                                        onChange={(e) => {
                                            const checked = e.target.checked;
                                            setFormData(prev => ({
                                                ...prev,
                                                templeIds: checked 
                                                    ? [...prev.templeIds, t._id]
                                                    : prev.templeIds.filter(id => id !== t._id)
                                            }));
                                        }}
                                        className="w-4 h-4 rounded border-gray-300 text-[#ff7f0a] focus:ring-[#ff7f0a]"
                                    />
                                    <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{t.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Deity</label>
                        <input required name="deity" value={formData.deity} onChange={handleChange} placeholder="e.g. Lord Shiva" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none" />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1"><Clock size={12} /> Duration ({activeLang})</label>
                        <input 
                            required 
                            value={(formData.duration as any)[activeLang]} 
                            onChange={(e) => handleLocalizedChange("duration", e.target.value, activeLang)} 
                            placeholder="45-60 Minutes" 
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none" 
                        />
                    </div>
                    
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Badge Tag ({activeLang})</label>
                        <input 
                            value={(formData.tag as any)[activeLang]} 
                            onChange={(e) => handleLocalizedChange("tag", e.target.value, activeLang)} 
                            placeholder="e.g. Best Seller" 
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none" 
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Emoji Icon</label>
                        <input name="emoji" value={formData.emoji} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none" />
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pricing Packages</label>
                        <span className="text-[10px] text-gray-400 font-medium bg-gray-50 px-2 py-0.5 rounded italic">Define dynamic pricing for members</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <input
                            placeholder={`Name (${activeLang})`}
                            value={(newPackage.name as any)[activeLang]}
                            onChange={(e) => setNewPackage({ ...newPackage, name: { ...newPackage.name, [activeLang]: e.target.value } })}
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm outline-none"
                        />
                        <input
                            type="number"
                            placeholder="Members"
                            value={newPackage.members}
                            onChange={(e) => setNewPackage({ ...newPackage, members: parseInt(e.target.value) || 1 })}
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm outline-none"
                        />
                        <div className="relative">
                            <IndianRupee size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="number"
                                placeholder="Price"
                                value={newPackage.price || ""}
                                onChange={(e) => setNewPackage({ ...newPackage, price: parseFloat(e.target.value) || 0 })}
                                className="w-full pl-8 pr-4 py-2 rounded-xl border border-gray-200 text-sm outline-none"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={addPackage}
                            className="bg-[#ff7f0a] text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#e67208] transition-colors"
                        >
                            <Plus size={16} /> Add Package
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                        {formData.packages.map((pkg, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-orange-50 bg-orange-50/30">
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{pkg.name[activeLang] || pkg.name.en}</p>
                                    <p className="text-xs text-[#ff7f0a] font-medium">{pkg.members} {pkg.members === 1 ? 'Person' : 'Persons'} · ₹{pkg.price}</p>
                                </div>
                                <button type="button" onClick={() => removePackage(idx)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Media Section */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1"><ImageIcon size={14} /> Pooja Images (URLs)</label>
                        <div className="flex gap-2">
                            <input
                                value={newImageUrl}
                                onChange={(e) => setNewImageUrl(e.target.value)}
                                placeholder="Paste image URL here"
                                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                            />
                            <CloudinaryUploader 
                                onUploadSuccess={(url) => setNewImageUrl(url)}
                                folder="poojas"
                                resourceType="image"
                                buttonText="Upload"
                            />
                            <button type="button" onClick={() => addArrayItem("images")} className="bg-gray-100 p-2.5 rounded-xl hover:bg-[#ff7f0a] hover:text-white transition-all"><Plus size={20} /></button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {formData.images.map((img, idx) => (
                                <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-gray-100 group">
                                    <img src={img} alt="preview" className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => removeArrayItem("images", idx)} className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
                    {/* Benefits */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Benefits ({activeLang})</label>
                        <div className="flex gap-2">
                            <input 
                                value={(newBenefit as any)[activeLang]} 
                                onChange={e => setNewBenefit(prev => ({ ...prev, [activeLang]: e.target.value }))} 
                                placeholder={`Add a benefit in ${activeLang}...`} 
                                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-sm" 
                            />
                            <button type="button" onClick={() => addArrayItem("benefits")} className="bg-gray-100 p-2 rounded-xl hover:bg-[#ff7f0a] hover:text-white transition-all"><Plus size={20} /></button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.benefits.map((b, idx) => (
                                <span key={idx} className="bg-orange-50 text-[#ff7f0a] px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2">
                                    {b[activeLang] || b.en} <X size={12} className="cursor-pointer" onClick={() => removeArrayItem("benefits", idx)} />
                                </span>
                            ))}
                        </div>
                    </div>
                    
                    {/* Includes */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Includes ({activeLang})</label>
                        <div className="flex gap-2">
                            <input 
                                value={(newInclude as any)[activeLang]} 
                                onChange={e => setNewInclude(prev => ({ ...prev, [activeLang]: e.target.value }))} 
                                placeholder={`Add what's included in ${activeLang}...`} 
                                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-sm" 
                            />
                            <button type="button" onClick={() => addArrayItem("includes")} className="bg-gray-100 p-2 rounded-xl hover:bg-[#ff7f0a] hover:text-white transition-all"><Plus size={20} /></button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.includes.map((inc, idx) => (
                                <span key={idx} className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2">
                                    {inc[activeLang] || inc.en} <X size={12} className="cursor-pointer" onClick={() => removeArrayItem("includes", idx)} />
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Short Description ({activeLang})</label>
                        <textarea 
                            required 
                            value={(formData.description as any)[activeLang]} 
                            onChange={(e) => handleLocalizedChange("description", e.target.value, activeLang)} 
                            rows={3} 
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none" 
                        />
                    </div>
                    
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">About Pooja ({activeLang})</label>
                        <textarea 
                            value={(formData.about as any)[activeLang]} 
                            onChange={(e) => handleLocalizedChange("about", e.target.value, activeLang)} 
                            rows={5} 
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none" 
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 pb-10">
                    <Link href="/admin/poojas" className="px-8 py-3 rounded-xl border border-gray-200 text-gray-500 font-semibold hover:bg-gray-50 transition-colors">Cancel</Link>
                    <button type="submit" disabled={loading} className="px-10 py-3 rounded-xl bg-[#ff7f0a] text-white font-bold shadow-lg shadow-[#ff7f0a]/30 hover:-translate-y-0.5 transition-all">
                        {loading ? "Saving..." : "Create Pooja"}
                    </button>
                </div>
            </form>
        </div>
    );
}
