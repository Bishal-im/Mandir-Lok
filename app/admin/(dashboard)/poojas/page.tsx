"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Edit2, Trash2, Clock, IndianRupee, MapPin, Filter, Info } from "lucide-react";
import { getPoojasAdmin, deletePooja, getTemplesAdmin } from "@/lib/actions/admin";

export default function PoojasAdminPage() {
    const [poojas, setPoojas] = useState<any[]>([]);
    const [filteredPoojas, setFilteredPoojas] = useState<any[]>([]);
    const [temples, setTemples] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedTemple, setSelectedTemple] = useState("All");
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            const pData = await getPoojasAdmin();
            const tData = await getTemplesAdmin();
            setPoojas(pData);
            setFilteredPoojas(pData);
            setTemples(tData);
            setLoading(false);
        }
        fetchData();
    }, []);

    useEffect(() => {
        let result = poojas;
        if (search) {
            result = result.filter(p =>
                p.name.toLowerCase().includes(search.toLowerCase()) ||
                (p.templeId?.name || "Deleted Temple").toLowerCase().includes(search.toLowerCase())
            );
        }
        if (selectedTemple !== "All") {
            result = result.filter(p => p.templeId?._id === selectedTemple);
        }
        setFilteredPoojas(result);
    }, [search, selectedTemple, poojas]);

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this pooja?")) {
            setDeletingId(id);
            const res = await deletePooja(id);
            if (res.success) {
                setPoojas(prev => prev.filter(p => p._id !== id));
            } else {
                alert("Error: " + res.error);
            }
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:items-center sm:flex-row justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-display font-bold text-gray-900">Pooja Management</h2>
                    <p className="text-sm text-gray-500">Manage poojas, set prices, and assign them to temples.</p>
                </div>
                <Link
                    href="/admin/poojas/add"
                    className="bg-[#ff7f0a] text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-[#e67208] transition-colors shadow-lg shadow-orange-100 w-full sm:w-auto text-sm"
                >
                    <Plus size={18} />
                    Add Pooja
                </Link>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search poojas by name or temple..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ff7f0a]/20 focus:border-[#ff7f0a] text-sm"
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Filter size={16} className="text-gray-400" />
                    <select
                        value={selectedTemple}
                        onChange={(e) => setSelectedTemple(e.target.value)}
                        className="flex-1 md:flex-none px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-[#ff7f0a]/20"
                    >
                        <option value="All">All Temples</option>
                        {temples.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-gray-400">Loading rituals...</div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="table-container">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">Pooja Name</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">Temple</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">Price</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredPoojas.map((pooja) => (
                                    <tr key={pooja._id} className={`hover:bg-gray-50/50 transition-colors ${deletingId === pooja._id ? "opacity-40" : ""}`}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gray-50 overflow-hidden flex items-center justify-center">
                                                    {pooja.images && pooja.images.length > 0 ? (
                                                        <img src={pooja.images[0]} alt={pooja.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <svg className="w-5 h-5 text-amber-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{pooja.name}</p>
                                                    <p className="text-[10px] text-[#ff7f0a] font-bold uppercase">{pooja.tag || "Standard"}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                            <p className="flex items-center gap-1"><MapPin size={12} className="text-gray-400" /> {pooja.templeId?.name}</p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <p className="font-bold text-gray-900 flex items-center gap-0.5"><IndianRupee size={12} />{pooja.price.toLocaleString()}</p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${pooja.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                                                {pooja.isActive ? "Active" : "Disabled"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/admin/poojas/edit/${pooja._id}`} className="p-2 text-gray-400 hover:text-[#ff7f0a] transition-all">
                                                    <Edit2 size={16} />
                                                </Link>
                                                <button onClick={() => handleDelete(pooja._id)} className="p-2 text-gray-400 hover:text-red-500 transition-all">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            {!loading && filteredPoojas.length === 0 && (
                <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                    <Info className="mx-auto text-gray-300 mb-3" size={40} />
                    <p className="text-gray-500 font-medium">No rituals found.</p>
                </div>
            )}
        </div>
    );
}
