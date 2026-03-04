"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Info, IndianRupee, Image as ImageIcon, MapPin } from "lucide-react";
import CloudinaryUploader from "@/components/admin/CloudinaryUploader";
import Link from "next/link";
import { createChadhava, getTemplesAdmin } from "@/lib/actions/admin";

export default function AddChadhavaPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
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
        name: { en: "", hi: "", ne: "", mr: "", ta: "" },
        templeId: "",
        emoji: "🌸",
        image: "",
        price: 0,
        description: { en: "", hi: "", ne: "", mr: "", ta: "" },
        isActive: true,
    });

    useEffect(() => {
        async function fetch() {
            const data = await getTemplesAdmin();
            setTemples(data);
        }
        fetch();
    }, []);

    const handleLocalizedChange = (field: string, val: string, lang: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: { ...(prev as any)[field], [lang]: val }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createChadhava(formData);
            router.push("/admin/chadhava");
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/chadhava" className="p-2 rounded-xl bg-white border border-gray-100 text-gray-500 hover:text-[#ff7f0a] transition-colors">
                    <ChevronLeft size={20} />
                </Link>
                <h2 className="text-2xl font-display font-bold text-gray-900">Add Chadhava Item</h2>
            </div>

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

            <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Item Name ({activeLang})</label>
                        <input 
                            required 
                            value={(formData.name as any)[activeLang]} 
                            onChange={e => handleLocalizedChange("name", e.target.value, activeLang)} 
                            placeholder={`e.g. Saffron Box in ${activeLang}`} 
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#ff7f0a]/20 focus:border-[#ff7f0a]" 
                        />
                    </div>
                    
                    <div className="col-span-2 space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1 tracking-wider"><ImageIcon size={12} /> Image URL</label>
                        <div className="flex gap-2">
                            <input 
                                value={formData.image} 
                                onChange={e => setFormData({ ...formData, image: e.target.value })} 
                                placeholder="https://images.unsplash.com/..." 
                                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#ff7f0a]/20 focus:border-[#ff7f0a]" 
                            />
                            <CloudinaryUploader 
                                onUploadSuccess={(url) => setFormData({ ...formData, image: url })}
                                folder="chadhava"
                                resourceType="image"
                                buttonText="Upload"
                            />
                        </div>
                        <p className="text-[10px] text-gray-400 italic">Optional: Overrides emoji if provided.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Emoji</label>
                        <input value={formData.emoji} onChange={e => setFormData({ ...formData, emoji: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#ff7f0a]/20 focus:border-[#ff7f0a]" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1 tracking-wider"><IndianRupee size={12} /> Price</label>
                        <input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#ff7f0a]/20 focus:border-[#ff7f0a]" />
                    </div>
                    <div className="col-span-2 space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1"><MapPin size={12} /> Map to Temple</label>
                        <select required value={formData.templeId} onChange={e => setFormData({ ...formData, templeId: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white outline-none focus:ring-2 focus:ring-[#ff7f0a]/20 focus:border-[#ff7f0a]">
                            <option value="">Select Temple...</option>
                            {temples.map((t: any) => <option key={t._id} value={t._id}>{t.name}</option>)}
                        </select>
                    </div>
                </div>
                
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Description ({activeLang})</label>
                    <textarea 
                        value={(formData.description as any)[activeLang]} 
                        onChange={e => handleLocalizedChange("description", e.target.value, activeLang)} 
                        rows={3} 
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 resize-none outline-none focus:ring-2 focus:ring-[#ff7f0a]/20 focus:border-[#ff7f0a]" 
                        placeholder={`Enter item details in ${activeLang}...`} 
                    />
                </div>

                <div className="flex items-center gap-3 py-2">
                    <input 
                        type="checkbox" 
                        id="isActive" 
                        checked={formData.isActive} 
                        onChange={e => setFormData({ ...formData, isActive: e.target.checked })} 
                        className="w-4 h-4 rounded border-gray-300 text-[#ff7f0a] focus:ring-[#ff7f0a]"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Is Active</label>
                </div>

                <button disabled={loading} className="w-full py-4 rounded-xl bg-[#ff7f0a] text-white font-bold shadow-lg shadow-[#ff7f0a]/30 hover:shadow-[#ff7f0a]/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                    {loading ? "Adding..." : "Add Chadhava Item"}
                </button>
            </form>
        </div>
    );
}
