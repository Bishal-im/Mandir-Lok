"use client";

import { useEffect, useState } from "react";
import { getPayoutsAdmin, updatePayoutStatus, processPayoutWithRazorpayX } from "@/lib/actions/admin";
import { CheckCircle2, XCircle, Clock, Banknote, User, Search, Loader2 } from "lucide-react";

export default function PayoutsPage() {
    const [payouts, setPayouts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    useEffect(() => {
        fetchPayouts();
    }, []);

    async function fetchPayouts() {
        setLoading(true);
        const data = await getPayoutsAdmin();
        setPayouts(data);
        setLoading(false);
    }

    async function handleUpdateStatus(id: string, status: string) {
        setUpdatingId(id);
        const res = await updatePayoutStatus(id, status);
        if (res.success) {
            alert(`Payout status updated to ${status}`);
            setPayouts(prev => prev.map(p => p._id === id ? { ...p, status, processedAt: status === 'paid' ? new Date() : null } : p));
        } else {
            alert(res.error || "Failed to update status");
        }
        setUpdatingId(null);
    }

    async function handleAutoPayout(id: string) {
        if (!confirm("Are you sure you want to transfer money automatically?")) return;
        setUpdatingId(id);
        const res = await processPayoutWithRazorpayX(id);
        if (res.success) {
            alert("Payout initiated successfully! It will be marked as 'Paid' once confirmed by the bank.");
            setPayouts(prev => prev.map(p => p._id === id ? { ...p, status: 'processing' } : p));
        } else {
            alert(res.error || "Failed to initiate automatic payout");
        }
        setUpdatingId(null);
    }

    const statusConfig = {
        requested: { icon: <Clock size={14} />, label: "Requested", bg: "bg-blue-100", text: "text-blue-700" },
        processing: { icon: <Loader2 size={14} className="animate-spin" />, label: "Processing", bg: "bg-yellow-100", text: "text-yellow-700" },
        paid: { icon: <CheckCircle2 size={14} />, label: "Paid", bg: "bg-green-100", text: "text-green-700" },
        rejected: { icon: <XCircle size={14} />, label: "Rejected", bg: "bg-red-100", text: "text-red-700" },
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-400">
                <Loader2 className="animate-spin mb-2" size={32} />
                <p>Loading payouts...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-display font-bold text-gray-900">Pandit Payouts</h2>
                    <p className="text-sm text-gray-500">Track and manage payout requests from Pandits.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                {[
                                    "Date",
                                    "Pandit",
                                    "Amount",
                                    "Payment Details",
                                    "Status",
                                    "Action",
                                ].map((h) => (
                                    <th
                                        key={h}
                                        className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {payouts.map((p: any) => {
                                const sc = statusConfig[p.status as keyof typeof statusConfig] || statusConfig.requested;
                                return (
                                    <tr key={p._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                            {new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(p.createdAt))}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
                                                    <User size={16} />
                                                </div>
                                                <p className="text-gray-900 font-medium">{p.panditId?.name || "Unknown Pandit"}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 font-bold text-gray-900">
                                                ₹{p.amount?.toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-0.5">
                                                {p.upiId && <p className="text-xs font-mono text-gray-600">UPI: {p.upiId}</p>}
                                                {p.bankAccount && <p className="text-xs font-mono text-gray-600">Bank: {p.bankAccount}</p>}
                                                {!p.upiId && !p.bankAccount && <p className="text-xs text-gray-400">No details provided</p>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${sc.bg} ${sc.text}`}>
                                                {sc.icon}
                                                {sc.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {p.status === "requested" && (
                                                <div className="flex gap-2">
                                                    <button
                                                        disabled={updatingId === p._id}
                                                        onClick={() => handleAutoPayout(p._id)}
                                                        className="text-[10px] bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50 font-semibold shadow-sm"
                                                    >
                                                        Pay Now
                                                    </button>
                                                    <button
                                                        disabled={updatingId === p._id}
                                                        onClick={() => handleUpdateStatus(p._id, "processing")}
                                                        className="text-[10px] bg-gray-100 text-gray-600 border border-gray-200 px-2 py-1 rounded hover:bg-gray-200 disabled:opacity-50"
                                                    >
                                                        Mark Processing
                                                    </button>
                                                    <button
                                                        disabled={updatingId === p._id}
                                                        onClick={() => handleUpdateStatus(p._id, "rejected")}
                                                        className="text-[10px] bg-red-50 text-red-600 border border-red-100 px-2 py-1 rounded hover:bg-red-100 disabled:opacity-50"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                            {p.status === "processing" && (
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] text-yellow-600 font-medium italic flex items-center gap-1">
                                                        <Loader2 size={10} className="animate-spin" />
                                                        Processing...
                                                    </span>
                                                    <button
                                                        disabled={updatingId === p._id}
                                                        onClick={() => handleUpdateStatus(p._id, "paid")}
                                                        className="text-[10px] bg-green-50 text-green-600 border border-green-100 px-2 py-1 rounded hover:bg-green-100 disabled:opacity-50"
                                                    >
                                                        Force Mark Paid
                                                    </button>
                                                </div>
                                            )}
                                            {(p.status === "paid" || p.status === "rejected") && (
                                                <span className="text-[10px] text-gray-400">
                                                    Processed on {p.processedAt ? new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short' }).format(new Date(p.processedAt)) : "N/A"}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            {payouts.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 italic">
                                        No payout requests found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
