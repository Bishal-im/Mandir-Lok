"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Edit2, Trash2, MapPin, IndianRupee, Info } from "lucide-react";
import { getChadhavaAdmin, deleteChadhava } from "@/lib/actions/admin";

export default function ChadhavaAdminPage() {
    const [items, setItems] = useState<any[]>([]);
    const [filteredItems, setFilteredItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        async function fetch() {
            const data = await getChadhavaAdmin();
            setItems(data);
            setFilteredItems(data);
            setLoading(false);
        }
        fetch();
    }, []);

    useEffect(() => {
        const res = items.filter(i =>
            i.name.toLowerCase().includes(search.toLowerCase()) ||
            (i.templeId?.name || "Global").toLowerCase().includes(search.toLowerCase())
        );
        setFilteredItems(res);
    }, [search, items]);

    const handleDelete = async (id: string) => {
        if (confirm("Delete this offering?")) {
            const res = await deleteChadhava(id);
            if (res.success) setItems(prev => prev.filter(i => i._id !== id));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Chadhava Management</h2>
                <Link href="/admin/chadhava/add" className="bg-[#ff7f0a] text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-orange-100">
                    <Plus size={18} /> Add Item
                </Link>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        placeholder="Search offerings..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#ff7f0a]/20"
                    />
                </div>
            </div>

            {loading ? <div className="text-center py-10 opacity-50">Loading...</div> : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">Item</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">Temple</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">Price</th>
                                <th className="text-right px-6 py-4 text-xs font-bold text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredItems.map(item => (
                                <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 flex items-center gap-3 font-semibold text-gray-900">
                                        <div className="w-10 h-10 rounded-lg bg-gray-50 overflow-hidden flex items-center justify-center">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <svg className="w-5 h-5 text-amber-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            )}
                                        </div>
                                        {item.name}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        <div className="flex items-center gap-1"><MapPin size={12} className="text-gray-400" /> {item.templeId?.name || "Global"}</div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-900">
                                        <span className="flex items-center gap-0.5"><IndianRupee size={12} />{item.price}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 text-gray-400">
                                            <Link href={`/admin/chadhava/edit/${item._id}`} className="hover:text-[#ff7f0a]"><Edit2 size={16} /></Link>
                                            <button onClick={() => handleDelete(item._id)} className="hover:text-red-500"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {!loading && filteredItems.length === 0 && <div className="text-center py-20 text-gray-400 bg-white rounded-3xl border border-dashed border-gray-200">No items found.</div>}
        </div>
    );
}
