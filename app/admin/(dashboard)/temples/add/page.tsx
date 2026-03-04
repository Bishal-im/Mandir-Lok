"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Save, Info, Image as ImageIcon, Plus, X, MapPin } from "lucide-react";
import CloudinaryUploader from "@/components/admin/CloudinaryUploader";
import Link from "next/link";
import { createTemple } from "@/lib/actions/admin";

export default function AddTemplePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

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
        location: "",
        city: "",
        state: "",
        category: "Famous Temples",
        deity: "",
        description: { en: "", hi: "", ne: "", mr: "", ta: "" },
        about: { en: "", hi: "", ne: "", mr: "", ta: "" },
        isActive: true,
        isPopular: false,
        isFeatured: false,
        openTime: "6:00 AM – 10:00 PM",
        phone: "",
        website: "",
        mapUrl: "",
        images: [] as string[],
    });

    const [newImageUrl, setNewImageUrl] = useState("");

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

    const addImage = () => {
        if (newImageUrl && !formData.images.includes(newImageUrl)) {
            setFormData((prev) => ({ ...prev, images: [...prev.images, newImageUrl] }));
            setNewImageUrl("");
        }
    };

    const removeImage = (url: string) => {
        setFormData((prev) => ({ ...prev, images: prev.images.filter((img) => img !== url) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await createTemple(formData);
            if (res.success) {
                router.push("/admin/temples");
            } else {
                setError(res.error || "Failed to create temple");
            }
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/temples" className="p-2 rounded-xl bg-white border border-gray-100 text-gray-500 hover:text-[#ff7f0a] transition-colors">
                    <ChevronLeft size={20} />
                </Link>
                <div>
                    <h2 className="text-2xl font-display font-bold text-gray-900">Add New Temple</h2>
                    <p className="text-sm text-gray-500">Create a new temple entry in the system.</p>
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

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                        <Info size={18} className="text-[#ff7f0a]" />
                        <h3 className="font-display font-bold text-gray-900">Basic Information</h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Temple Name ({activeLang})</label>
                            <input
                                required
                                value={(formData.name as any)[activeLang]}
                                onChange={(e) => handleLocalizedChange("name", e.target.value, activeLang)}
                                placeholder={`Temple name in ${languages.find(l => l.code === activeLang)?.name}`}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ff7f0a]/20 focus:border-[#ff7f0a] transition-all"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Slug (Auto from English name)</label>
                            <input
                                required
                                name="slug"
                                value={formData.slug}
                                onChange={handleChange}
                                placeholder="kashi-vishwanath"
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Deity</label>
                            <input required name="deity" value={formData.deity} onChange={handleChange} placeholder="e.g. Lord Shiva" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#ff7f0a]/20 focus:border-[#ff7f0a]" />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ff7f0a]/20 focus:border-[#ff7f0a] transition-all bg-white"
                            >
                                <option value="Jyotirlinga">Jyotirlinga</option>
                                <option value="Shaktipeeth">Shaktipeeth</option>
                                <option value="Vaishnavite">Vaishnavite</option>
                                <option value="Char Dham">Char Dham</option>
                                <option value="Famous Temples">Famous Temples</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Open Time</label>
                            <input name="openTime" value={formData.openTime} onChange={handleChange} placeholder="6:00 AM – 10:00 PM" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                        <MapPin size={18} className="text-[#ff7f0a]" />
                        <h3 className="font-display font-bold text-gray-900">Location Details</h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Address</label>
                            <input required name="location" value={formData.location} onChange={handleChange} placeholder="Full address" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ff7f0a]/20 focus:border-[#ff7f0a] transition-all" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">City</label>
                            <input required name="city" value={formData.city} onChange={handleChange} placeholder="City name" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">State</label>
                            <input required name="state" value={formData.state} onChange={handleChange} placeholder="State name" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                        <ImageIcon size={18} className="text-[#ff7f0a]" />
                        <h3 className="font-display font-bold text-gray-900">Images & Content</h3>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Temple Images (URL)</label>
                            <div className="flex gap-2 w-full">
                                <input value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} placeholder="Paste image URL here" className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 outline-none" />
                                <CloudinaryUploader onUploadSuccess={(url) => setNewImageUrl(url)} folder="temples" resourceType="image" buttonText="Upload" />
                                <button type="button" onClick={addImage} className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-xl font-semibold hover:bg-[#ff7f0a] hover:text-white transition-all flex items-center gap-2"><Plus size={18} /> Add</button>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                                {formData.images.map((url, idx) => (
                                    <div key={idx} className="relative aspect-video rounded-xl overflow-hidden group border border-gray-100">
                                        <img src={url} alt={`preview ${idx}`} className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => removeImage(url)} className="absolute top-1 right-1 p-1.5 rounded-lg bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"><X size={14} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Short Description ({activeLang})</label>
                            <textarea required value={(formData.description as any)[activeLang]} onChange={(e) => handleLocalizedChange("description", e.target.value, activeLang)} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ff7f0a]/20 focus:border-[#ff7f0a] transition-all" />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">About Temple ({activeLang})</label>
                            <textarea value={(formData.about as any)[activeLang]} onChange={(e) => handleLocalizedChange("about", e.target.value, activeLang)} rows={6} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ff7f0a]/20 focus:border-[#ff7f0a] transition-all" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-wrap gap-6">
                    {/* Activity Toggles */}
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" name="isActive" checked={formData.isActive} onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))} className="w-5 h-5 rounded-md border-gray-300 text-[#ff7f0a] focus:ring-[#ff7f0a]" />
                        <span className="text-sm font-medium text-gray-700">Is Active</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" name="isPopular" checked={formData.isPopular} onChange={(e) => setFormData(prev => ({ ...prev, isPopular: e.target.checked }))} className="w-5 h-5 rounded-md border-gray-300 text-[#ff7f0a] focus:ring-[#ff7f0a]" />
                        <span className="text-sm font-medium text-gray-700">Mark Popular</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))} className="w-5 h-5 rounded-md border-gray-300 text-[#ff7f0a] focus:ring-[#ff7f0a]" />
                        <span className="text-sm font-medium text-gray-700">Feature on Home</span>
                    </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 pb-10">
                    <Link href="/admin/temples" className="px-8 py-3 rounded-xl border border-gray-200 text-gray-500 font-semibold hover:bg-gray-50 transition-colors">Cancel</Link>
                    <button type="submit" disabled={loading} className="px-10 py-3 rounded-xl bg-[#ff7f0a] text-white font-bold shadow-lg shadow-[#ff7f0a]/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center gap-2">
                        {loading ? "Creating..." : <><Save size={18} /> Create Temple</>}
                    </button>
                </div>
            </form>
        </div>
    );
}
