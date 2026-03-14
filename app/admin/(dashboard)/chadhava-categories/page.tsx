"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Check, X, Tag } from "lucide-react";
import { 
    getChadhavaCategoriesAdmin, 
    createChadhavaCategory, 
    updateChadhavaCategory, 
    deleteChadhavaCategory 
} from "@/lib/actions/admin";

export default function ChadhavaCategoriesPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: "", isActive: true });
    const [newCategory, setNewCategory] = useState({ name: "" });
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        const data = await getChadhavaCategoriesAdmin();
        setCategories(data);
        setLoading(false);
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await createChadhavaCategory(newCategory);
        if (res.success) {
            setNewCategory({ name: "" });
            setIsAdding(false);
            fetchCategories();
        } else {
            alert(res.error);
        }
    };

    const handleUpdate = async (id: string) => {
        const res = await updateChadhavaCategory(id, formData);
        if (res.success) {
            setEditingId(null);
            fetchCategories();
        } else {
            alert(res.error);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this category?")) {
            const res = await deleteChadhavaCategory(id);
            if (res.success) {
                fetchCategories();
            } else {
                alert(res.error);
            }
        }
    };

    const startEditing = (category: any) => {
        setEditingId(category._id);
        setFormData({
            name: category.name,
            isActive: category.isActive
        });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-display font-bold text-gray-900">Chadhava Categories</h1>
                    <p className="text-sm text-gray-500">Manage categories for sacred offerings.</p>
                </div>
                <button 
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#ff7f0a] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#ff7f0a]/20"
                >
                    <Plus size={18} />
                    {isAdding ? "Cancel" : "Add Category"}
                </button>
            </div>

            {isAdding && (
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-top-4">
                    <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-4">
                        <div className="flex-1 space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase">Category Name</label>
                            <div className="flex gap-4">
                                <input 
                                    required
                                    value={newCategory.name}
                                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#ff7f0a]/20"
                                    placeholder="e.g. Sweets"
                                />
                                <button type="submit" className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm">
                                    Create Category
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden text-sm">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-100 uppercase text-[10px] font-bold text-gray-400">
                        <tr>
                            <th className="px-6 py-4">Category Name</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-400">Loading categories...</td></tr>
                        ) : categories.length === 0 ? (
                            <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-400">No categories found.</td></tr>
                        ) : categories.map((cat) => (
                            <tr key={cat._id} className="group hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    {editingId === cat._id ? (
                                        <input 
                                            value={formData.name} 
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full max-w-sm px-3 py-1 rounded border border-gray-200 outline-none focus:ring-2 focus:ring-[#ff7f0a]/20 font-medium"
                                        />
                                    ) : (
                                        <div className="font-medium text-gray-900">{cat.name}</div>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    {editingId === cat._id ? (
                                        <select 
                                            value={formData.isActive.toString()}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "true" })}
                                            className="px-2 py-1 rounded border border-gray-200 outline-none"
                                        >
                                            <option value="true">Active</option>
                                            <option value="false">Inactive</option>
                                        </select>
                                    ) : (
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${cat.isActive ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                                            {cat.isActive ? "ACTIVE" : "INACTIVE"}
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        {editingId === cat._id ? (
                                            <>
                                                <button onClick={() => handleUpdate(cat._id)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                                                    <Check size={18} />
                                                </button>
                                                <button onClick={() => setEditingId(null)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                    <X size={18} />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={() => startEditing(cat)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(cat._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
