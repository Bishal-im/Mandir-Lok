"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Save, MapPin, IndianRupee, Image as ImageIcon } from "lucide-react";
import CloudinaryUploader from "@/components/admin/CloudinaryUploader";
import Link from "next/link";
import { createChadhava, getTemplesAdmin } from "@/lib/actions/admin";

export default function AddChadhavaPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [temples, setTemples] = useState([]);
    const [formData, setFormData] = useState({
        name: "",
        templeId: "",
        emoji: "🌸",
        image: "",
        price: 0,
        description: "",
        isActive: true,
    });

    useEffect(() => {
        async function fetch() {
            const data = await getTemplesAdmin();
            setTemples(data);
        }
        fetch();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await createChadhava(formData);
        setLoading(false);
        router.push("/admin/chadhava");
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/chadhava" className="p-2 rounded-xl bg-white border border-gray-100 text-gray-500"><ChevronLeft size={20} /></Link>
                <h2 className="text-2xl font-display font-bold text-gray-900">Add Chadhava Item</h2>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Item Name</label>
                        <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Saffron Box" className="w-full px-4 py-3 rounded-xl border border-gray-200" />
                    </div>
                    
                    <div className="col-span-2 space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1"><ImageIcon size={12} /> Image URL</label>
                        <div className="flex gap-2">
                            <input 
                                value={formData.image} 
                                onChange={e => setFormData({ ...formData, image: e.target.value })} 
                                placeholder="https://images.unsplash.com/..." 
                                className="flex-1 px-4 py-3 rounded-xl border border-gray-200" 
                            />
                            <CloudinaryUploader 
                                onUploadSuccess={(url) => setFormData({ ...formData, image: url })}
                                folder="chadhava"
                                buttonText="Upload"
                            />
                        </div>
                        <p className="text-[10px] text-gray-400 italic">Optional: Overrides emoji if provided.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Emoji</label>
                        <input value={formData.emoji} onChange={e => setFormData({ ...formData, emoji: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1"><IndianRupee size={12} /> Price</label>
                        <input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl border border-gray-200" />
                    </div>
                    <div className="col-span-2 space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1"><MapPin size={12} /> Map to Temple</label>
                        <select required value={formData.templeId} onChange={e => setFormData({ ...formData, templeId: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white">
                            <option value="">Select Temple...</option>
                            {temples.map((t: any) => <option key={t._id} value={t._id}>{t.name}</option>)}
                        </select>
                    </div>
                </div>
                
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                    <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 resize-none" placeholder="Enter item details..." />
                </div>

                <button disabled={loading} className="w-full py-4 rounded-xl bg-[#ff7f0a] text-white font-bold shadow-lg shadow-[#ff7f0a]/30">
                    {loading ? "Adding..." : "Add Item"}
                </button>
            </form>
        </div>
    );
}
