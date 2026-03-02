"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
    ChevronLeft,
    IndianRupee,
    Clock,
    User,
    MapPin,
    Award,
    FileCheck,
    Video,
    MessageCircle,
    Send,
    Save,
    AlertCircle
} from "lucide-react";
import Link from "next/link";
import { getOrderById, getPanditsAdmin, assignPanditToOrder, updateOrderStatus, updateOrderVideo } from "@/lib/actions/admin";
import CloudinaryUploader from "@/components/admin/CloudinaryUploader";

export default function OrderDetailPage() {
    const { id } = useParams() as { id: string };
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [pandits, setPandits] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPandit, setSelectedPandit] = useState("");
    const [videoUrl, setVideoUrl] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        async function fetchData() {
            const orderData = await getOrderById(id);
            const panditsData = await getPanditsAdmin();
            setOrder(orderData);
            setPandits(panditsData);
            if (orderData?.panditId?._id) setSelectedPandit(orderData.panditId._id);
            if (orderData?.videoUrl) setVideoUrl(orderData.videoUrl);
            setLoading(false);
        }
        fetchData();
    }, [id]);

    const handleAssignPandit = async () => {
        setSaving(true);
        await assignPanditToOrder(id, selectedPandit);
        const updated = await getOrderById(id);
        setOrder(updated);
        setSaving(false);
    };

    const handleStatusChange = async (status: string) => {
        setSaving(true);
        await updateOrderStatus(id, status);
        const updated = await getOrderById(id);
        setOrder(updated);
        setSaving(false);
    };

    const handleSaveVideo = async () => {
        setSaving(true);
        await updateOrderVideo(id, videoUrl);
        const updated = await getOrderById(id);
        setOrder(updated);
        setSaving(false);
    };

    if (loading) return <div className="p-10 text-center text-gray-500">Loading order details...</div>;
    if (!order) return <div className="p-10 text-center text-red-500">Order not found.</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/orders" className="p-2 rounded-xl bg-white border border-gray-100 text-gray-500 hover:text-[#ff7f0a] transition-colors">
                        <ChevronLeft size={20} />
                    </Link>
                    <div>
                        <h2 className="text-2xl font-display font-bold text-gray-900">Order {order.bookingId}</h2>
                        <p className="text-sm text-gray-500">Manage booking, assign pandit and update status.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase border ${order.paymentStatus === "paid" ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"
                        }`}>
                        Payment: {order.paymentStatus}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Summary Card */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
                        <div className="flex flex-wrap gap-8">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pooja</p>
                                <p className="font-bold text-gray-900">{order.poojaId?.name}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Temple</p>
                                <p className="font-bold text-gray-900">{order.templeId?.name}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Booking Date</p>
                                <p className="font-bold text-gray-900">{new Date(order.bookingDate).toLocaleDateString()}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Amount</p>
                                <p className="font-bold text-[#ff7f0a] flex items-center gap-0.5"><IndianRupee size={14} />{order.totalAmount}</p>
                            </div>
                            {order.packageSelected && (
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-amber-600">Selected Package</p>
                                    <p className="font-bold text-amber-600">{order.packageSelected.name} <span className="text-[10px] font-normal text-gray-400">(₹{order.packageSelected.price})</span></p>
                                </div>
                            )}
                        </div>

                        <div className="pt-6 border-t border-gray-50 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2"><User size={16} className="text-[#ff7f0a]" /> Devotee Details</h3>
                                <div className="space-y-2 text-sm">
                                    <p className="text-gray-600"><span className="text-gray-400">Name:</span> {order.sankalpName}</p>
                                    <p className="text-gray-600"><span className="text-gray-400">Gotra:</span> {order.gotra || "N/A"}</p>
                                    <p className="text-gray-600"><span className="text-gray-400">Phone:</span> {order.phone}</p>
                                    <p className="text-gray-600"><span className="text-gray-400">WhatsApp:</span> {order.whatsapp}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2"><MapPin size={16} className="text-[#ff7f0a]" /> Address/Sankalp</h3>
                                <div className="space-y-2 text-sm">
                                    <p className="text-gray-600"><span className="text-gray-400">Address:</span> {order.address || "Digital Pooja"}</p>
                                    <p className="text-gray-600 italic">"{order.sankalp || "No specific wish provided"}"</p>
                                </div>
                            </div>
                        </div>

                        {order.chadhavaItems?.length > 0 && (
                            <div className="pt-6 border-t border-gray-50 space-y-3">
                                <h3 className="text-sm font-bold text-gray-900">Selected Chadhava</h3>
                                <div className="flex flex-wrap gap-2">
                                    {order.chadhavaItems.map((item: any, i: number) => (
                                        <span key={i} className="bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-xl text-xs flex items-center gap-2">
                                            <span>{item.emoji}</span> {item.name} <span className="text-gray-400">₹{item.price}</span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Video / Delivery Card */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
                        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2"><Video size={16} className="text-[#ff7f0a]" /> Pooja Video URL</h3>

                        {/* Direct Cloudinary Upload */}
                        <div className="pb-2 border-b border-gray-50 mb-4">
                            <CloudinaryUploader
                                folder="pooja_recordings"
                                onUploadSuccess={(url) => {
                                    setVideoUrl(url);
                                    // Optionally auto-save after upload
                                    updateOrderVideo(id, url).then(updated => {
                                        if (updated) setOrder(updated);
                                    });
                                }}
                            />
                        </div>

                        <div className="flex gap-2">
                            <input
                                value={videoUrl}
                                onChange={(e) => setVideoUrl(e.target.value)}
                                placeholder="Enter S3/YouTube/Cloudinary Link"
                                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#ff7f0a]/20 outline-none text-sm"
                            />
                            <button
                                onClick={handleSaveVideo}
                                disabled={saving}
                                className="bg-[#ff7f0a] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#e67208] transition-all disabled:opacity-50 text-sm"
                            >
                                Save & Complete
                            </button>
                        </div>
                        {order.videoSentAt && (
                            <p className="text-[10px] text-green-600 font-medium">Video uploaded & marked complete on {new Date(order.videoSentAt).toLocaleString()}</p>
                        )}
                    </div>
                </div>

                {/* Right Column: Management */}
                <div className="space-y-6">
                    {/* Status Card */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
                        <h3 className="text-sm font-bold text-gray-900">Order Status</h3>
                        <div className="grid grid-cols-1 gap-2">
                            {["pending", "confirmed", "in-progress", "completed", "cancelled"].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => handleStatusChange(status)}
                                    disabled={saving}
                                    className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase transition-all border ${order.orderStatus === status
                                        ? "bg-gray-900 text-white border-gray-900"
                                        : "bg-white text-gray-500 border-gray-100 hover:border-gray-300"
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Pandit Assignment Card */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
                        <h3 className="text-sm font-bold text-gray-900">Assign Pandit</h3>
                        <select
                            value={selectedPandit}
                            onChange={(e) => setSelectedPandit(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none bg-white text-sm"
                        >
                            <option value="">Unassigned</option>
                            {pandits.map((p) => (
                                <option key={p._id} value={p._id}>{p.name}</option>
                            ))}
                        </select>
                        <button
                            onClick={handleAssignPandit}
                            disabled={saving || !selectedPandit}
                            className="w-full py-3 rounded-xl bg-gray-100 text-gray-900 font-bold text-sm hover:bg-[#ff7f0a] hover:text-white transition-all disabled:opacity-50"
                        >
                            {saving ? "Updating..." : "Confirm Assignment"}
                        </button>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-3">
                        <button
                            onClick={() => window.open(`https://wa.me/${order.whatsapp}`, "_blank")}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-green-50 text-green-700 text-sm font-bold hover:bg-green-100 transition-all"
                        >
                            <MessageCircle size={18} /> WhatsApp User
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
