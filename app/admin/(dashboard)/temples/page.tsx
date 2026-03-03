"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Edit2, Trash2, MapPin, Eye, Filter, Info, AlertTriangle } from "lucide-react";
import { getTemplesAdmin, deleteTemple } from "@/lib/actions/admin";

export default function TemplesAdminPage() {
    const [temples, setTemples] = useState<any[]>([]);
    const [filteredTemples, setFilteredTemples] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            const data = await getTemplesAdmin();
            setTemples(data);
            setFilteredTemples(data);
            setLoading(false);
        }
        fetchData();
    }, []);

    useEffect(() => {
        let result = temples;
        if (search) {
            result = result.filter(t =>
                t.name.toLowerCase().includes(search.toLowerCase()) ||
                t.city.toLowerCase().includes(search.toLowerCase())
            );
        }
        if (category !== "All") {
            result = result.filter(t => t.category === category);
        }
        setFilteredTemples(result);
    }, [search, category, temples]);

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this temple? This will also affect linked poojas.")) {
            setDeletingId(id);
            const res = await deleteTemple(id);
            if (res.success) {
                setTemples(prev => prev.filter(t => t._id !== id));
            } else {
                alert("Error: " + res.error);
            }
            setDeletingId(null);
        }
    };

    const categories = ["All", "Jyotirlinga", "Shaktipeeth", "Vaishnavite", "Char Dham", "Famous Temples"];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:items-center sm:flex-row justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-display font-bold text-gray-900">Temple Management</h2>
                    <p className="text-sm text-gray-500">Manage your temples, their descriptions, and images.</p>
                </div>
                <Link
                    href="/admin/temples/add"
                    className="bg-[#ff7f0a] text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-[#e67208] transition-colors shadow-lg shadow-orange-200 w-full sm:w-auto text-sm"
                >
                    <Plus size={18} />
                    Add Temple
                </Link>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search temples by name or city..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ff7f0a]/20 focus:border-[#ff7f0a] text-sm"
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                    <Filter size={16} className="text-gray-400 shrink-0" />
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap border ${category === cat ? "bg-[#ff7f0a] text-white border-[#ff7f0a]" : "bg-gray-50 text-gray-500 border-gray-100 hover:border-gray-300"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-gray-400">Loading temples...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTemples.map((temple) => (
                        <div key={temple._id} className={`bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all ${deletingId === temple._id ? "opacity-50 grayscale" : ""}`}>
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={temple.images?.[0] || "https://via.placeholder.com/400x300"}
                                    alt={temple.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-3 left-3 flex gap-2">
                                    <span className="bg-black/50 backdrop-blur-md text-white px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                                        {temple.category}
                                    </span>
                                    {!temple.isActive && (
                                        <span className="bg-red-500 text-white px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                            <AlertTriangle size={10} /> Disabled
                                        </span>
                                    )}
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                    <Link href={`/admin/temples/edit/${temple._id}`} className="p-3 bg-white rounded-full text-gray-900 hover:bg-[#ff7f0a] hover:text-white transition-all shadow-xl">
                                        <Edit2 size={20} />
                                    </Link>
                                    <button onClick={() => handleDelete(temple._id)} className="p-3 bg-white rounded-full text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-xl">
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                            <div className="p-5 space-y-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-display font-bold text-gray-900 leading-tight">{temple.name}</h3>
                                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                            <MapPin size={12} className="text-[#ff7f0a]" />
                                            {temple.city}, {temple.state}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                                    {temple.description}
                                </p>
                                <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                                    <div className="flex gap-4">
                                        <div className="text-center">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">Pooja</p>
                                            <p className="text-sm font-bold text-gray-700">12+</p>
                                        </div>
                                    </div>
                                    <Link href={`/temples/${temple.slug}`} target="_blank" className="text-[10px] font-bold text-[#ff7f0a] hover:underline flex items-center gap-1 uppercase tracking-wider">
                                        <Eye size={12} /> Live View
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {!loading && filteredTemples.length === 0 && (
                <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                    <Info className="mx-auto text-gray-300 mb-3" size={40} />
                    <p className="text-gray-500 font-medium">No temples found matching your criteria.</p>
                    <button onClick={() => { setSearch(""); setCategory("All") }} className="text-[#ff7f0a] font-bold text-sm mt-2 hover:underline">Clear all filters</button>
                </div>
            )}
        </div>
    );
}
