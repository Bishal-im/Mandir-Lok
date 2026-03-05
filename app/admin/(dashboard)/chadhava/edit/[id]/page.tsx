"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, Save, IndianRupee, Info, Image as ImageIcon, Upload } from "lucide-react";
import CloudinaryUploader from "@/components/admin/CloudinaryUploader";
import Link from "next/link";
import { getChadhavaById, updateChadhava, getTemplesAdmin } from "@/lib/actions/admin";

export default function EditChadhavaPage() {
    const { id } = useParams() as { id: string };
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
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
        async function fetchData() {
            setLoading(true);
            try {
                const [item, t] = await Promise.all([getChadhavaById(id), getTemplesAdmin()]);
                setTemples(t);
                if (item) {
                    const { _id, createdAt, updatedAt, __v, ...cleanData } = item;
                    setFormData({ ...formData, ...cleanData });
                } else {
                    setError("Chadhava item not found");
                }
            } catch (err) {
                setError("Failed to load data");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
        setFormData((prev) => ({ ...prev, [name]: val }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError("");

        try {
            const res = await updateChadhava(id, formData);
            if (res.success) {
                router.push("/admin/chadhava");
            } else {
                setError(res.error || "Failed to update item");
            }
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center text-gray-400">Loading item data...</div>;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/chadhava" className="p-2 rounded-xl bg-white border border-gray-100 text-gray-500 hover:text-[#ff7f0a] transition-colors">
                    <ChevronLeft size={20} />
                </Link>
                <div>
                    <h2 className="text-2xl font-display font-bold text-gray-900">Edit Chadhava Item</h2>
                    <p className="text-sm text-gray-500">Update specific offering for devotions.</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                    <Info size={16} /> {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-6">
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase">Item Name</label>
                        <input required name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none" />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1"><ImageIcon size={12} /> Image URL</label>
                        <div className="flex gap-2">
                            <input 
                                name="image" 
                                value={formData.image} 
                                onChange={handleChange} 
                                placeholder="https://..." 
                                className="flex-1 px-4 py-3 rounded-xl border border-gray-200" 
                            />
                            <CloudinaryUploader 
                                onUploadSuccess={(url) => setFormData({ ...formData, image: url })}
                                folder="chadhava"
                                resourceType="image"
                                buttonText="Upload"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase">Emoji</label>
                            <input name="emoji" value={formData.emoji} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1"><IndianRupee size={12} /> Price (₹)</label>
                            <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200" />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase">Temple Assignment</label>
                        <select name="templeId" value={formData.templeId} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white">
                            {temples.map((t: any) => <option key={t._id} value={t._id}>{t.name}</option>)}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none" />
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer group pt-2">
                        <input
                            type="checkbox"
                            name="isActive"
                            checked={formData.isActive}
                            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                            className="w-5 h-5 rounded-md border-gray-300 text-[#ff7f0a] focus:ring-[#ff7f0a]"
                        />
                        <span className="text-sm font-medium text-gray-700">Is Active</span>
                    </label>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Link href="/admin/chadhava" className="px-8 py-3 rounded-xl border border-gray-200 text-gray-500 font-semibold">Cancel</Link>
                    <button type="submit" disabled={saving} className="px-10 py-3 rounded-xl bg-[#ff7f0a] text-white font-bold shadow-lg shadow-[#ff7f0a]/30 transition-all">
                        {saving ? "Saving..." : "Update Item"}
                    </button>
                </div>
            </form>
        </div>
    );
}
