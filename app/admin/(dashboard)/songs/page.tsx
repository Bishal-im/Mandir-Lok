"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, Music as MusicIcon, X } from "lucide-react";
import CloudinaryImageUploader from "@/components/admin/CloudinaryImageUploader";
import CloudinaryUploader from "@/components/admin/CloudinaryUploader";
import { getSettings } from "@/lib/actions/admin";

interface Song {
    _id: string;
    title: string;
    artist: string;
    audioUrl: string;
    imageUrl: string;
    type: "bhajan" | "aarti" | "chalisa";
    deity: string;
    isActive: boolean;
}

export default function SongsPage() {
    const [songs, setSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSong, setEditingSong] = useState<Song | null>(null);
    const [deities, setDeities] = useState<{ id: string, name: string }[]>([]);

    const [formData, setFormData] = useState({
        title: "",
        artist: "",
        audioUrl: "",
        imageUrl: "",
        type: "bhajan",
        deity: "",
        isActive: true,
    });

    useEffect(() => {
        fetchSongs();
        fetchDeities();
    }, []);

    const fetchDeities = async () => {
        const res = await getSettings("aarti_settings");
        if (res && res.value && res.value.deities) {
            const goddessList = res.value.deities;
            setDeities(goddessList);
            // Default to first deity if adding new
            if (!editingSong && goddessList.length > 0) {
                setFormData(prev => ({ ...prev, deity: goddessList[0].name }));
            }
        }
    };

    const fetchSongs = async () => {
        try {
            const res = await fetch("/api/admin/songs");
            const data = await res.json();
            if (data.success) {
                setSongs(data.data);
            }
        } catch (error) {
            alert("Failed to fetch songs");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.audioUrl) return alert("Please upload an audio file first");
        if (!formData.imageUrl) return alert("Please upload a thumbnail image first");

        const url = editingSong ? `/api/admin/songs/${editingSong._id}` : "/api/admin/songs";
        const method = editingSong ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (data.success) {
                alert(editingSong ? "Song updated" : "Song added");
                setIsModalOpen(false);
                setEditingSong(null);
                setFormData({
                    title: "",
                    artist: "",
                    audioUrl: "",
                    imageUrl: "",
                    type: "bhajan",
                    deity: deities.length > 0 ? deities[0].name : "",
                    isActive: true,
                });
                fetchSongs();
            } else {
                alert(`Error: ${data.message || "Operation failed"}`);
            }
        } catch (error: any) {
            alert(`Network error: ${error.message}`);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            const res = await fetch(`/api/admin/songs/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                alert("Song deleted");
                fetchSongs();
            }
        } catch (error) {
            alert("Delete failed");
        }
    };

    const openEditModal = (song: Song) => {
        setEditingSong(song);
        setFormData({
            title: song.title,
            artist: song.artist,
            audioUrl: song.audioUrl,
            imageUrl: song.imageUrl,
            type: song.type,
            deity: song.deity,
            isActive: song.isActive,
        });
        setIsModalOpen(true);
    };

    const filteredSongs = songs.filter(song =>
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.deity.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Songs Management</h2>
                    <p className="text-gray-500 text-sm">Manage Bhajans, Aartis, and Chalisas</p>
                </div>
                <button
                    onClick={() => {
                        setEditingSong(null);
                        setFormData({
                            title: "",
                            artist: "",
                            audioUrl: "",
                            imageUrl: "",
                            type: "bhajan",
                            deity: deities.length > 0 ? deities[0].name : "",
                            isActive: true,
                        });
                        setIsModalOpen(true);
                    }}
                    className="flex items-center justify-center gap-2 bg-[#ff7f0a] hover:bg-[#e66a00] text-white px-4 py-2.5 rounded-xl transition-colors font-medium"
                >
                    <Plus size={18} /> Add New Song
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                    <Search className="text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by title, artist or deity..."
                        className="flex-1 outline-none text-sm text-gray-700"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Song</th>
                                <th className="px-6 py-4 font-semibold">Artist</th>
                                <th className="px-6 py-4 font-semibold">Deity</th>
                                <th className="px-6 py-4 font-semibold">Type</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-4 h-16 bg-gray-50/50" />
                                    </tr>
                                ))
                            ) : filteredSongs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        No songs found.
                                    </td>
                                </tr>
                            ) : (
                                filteredSongs.map((song) => (
                                    <tr key={song._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img src={song.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                                <span className="font-medium text-gray-900">{song.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 text-sm">{song.artist}</td>
                                        <td className="px-6 py-4">
                                            <span className="bg-orange-50 text-orange-700 px-2 py-1 rounded-md text-xs font-medium border border-orange-100 uppercase tracking-tighter">
                                                {song.deity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 text-sm capitalize">{song.type}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-[11px] font-bold ${song.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                                {song.isActive ? "ACTIVE" : "INACTIVE"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button onClick={() => openEditModal(song)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(song._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                            <h3 className="text-xl font-bold text-gray-900">{editingSong ? "Edit Song" : "Add New Song"}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Song Title</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                                        placeholder="e.g. Om Jai Shiv Omkara"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Artist</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                                        placeholder="e.g. Anuradha Paudwal"
                                        value={formData.artist}
                                        onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Deity</label>
                                    <select
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none"
                                        value={formData.deity}
                                        onChange={(e) => setFormData({ ...formData, deity: e.target.value })}
                                    >
                                        {deities.length > 0 ? (
                                            deities.map((d: any) => (
                                                <option key={d.id} value={d.name}>{d.name}</option>
                                            ))
                                        ) : (
                                            <option value="">No Deities Added</option>
                                        )}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Type</label>
                                    <select
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none"
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                    >
                                        <option value="bhajan">Bhajan</option>
                                        <option value="aarti">Aarti</option>
                                        <option value="chalisa">Chalisa</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Audio File</label>
                                <CloudinaryUploader
                                    onUploadSuccess={(url) => setFormData({ ...formData, audioUrl: url })}
                                    folder="temple_songs"
                                    accept="audio/*"
                                    resourceType="video"
                                    label="Upload Audio File (.mp3)"
                                />
                                {formData.audioUrl && (
                                    <audio src={formData.audioUrl} controls className="w-full h-10 mt-2" />
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Thumbnail Image</label>
                                <CloudinaryImageUploader
                                    onUploadSuccess={(url) => setFormData({ ...formData, imageUrl: url })}
                                    folder="temple_songs"
                                />
                                {formData.imageUrl && (
                                    <img src={formData.imageUrl} alt="preview" className="w-24 h-24 object-cover rounded-xl mt-2" />
                                )}
                            </div>

                            <div className="flex items-center gap-2 py-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                                />
                                <label htmlFor="isActive" className="text-sm text-gray-700">Active and visible to users</label>
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 rounded-xl bg-[#ff7f0a] hover:bg-[#e66a00] text-white transition-colors font-medium"
                                >
                                    {editingSong ? "Update Song" : "Add Song"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
