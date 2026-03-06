"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, IndianRupee, Clock, CheckCircle, Filter, Info, Eye, User, MapPin } from "lucide-react";
import { getOrdersAdmin } from "@/lib/actions/admin";

const statusStyles: any = {
    pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    confirmed: "bg-blue-100 text-blue-700 border-blue-200",
    "in-progress": "bg-indigo-100 text-indigo-700 border-indigo-200",
    completed: "bg-green-100 text-green-700 border-green-200",
    cancelled: "bg-red-100 text-red-700 border-red-200",
};

export default function OrdersAdminPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    useEffect(() => {
        async function fetch() {
            const data = await getOrdersAdmin();
            setOrders(data);
            setFilteredOrders(data);
            setLoading(false);
        }
        fetch();
    }, []);

    useEffect(() => {
        let res = orders;
        if (search) {
            res = res.filter(o =>
                o.bookingId.toLowerCase().includes(search.toLowerCase()) ||
                o.sankalpName.toLowerCase().includes(search.toLowerCase()) ||
                o.phone.includes(search)
            );
        }
        if (statusFilter !== "All") {
            res = res.filter(o => o.orderStatus === statusFilter);
        }
        setFilteredOrders(res);
    }, [search, statusFilter, orders]);

    const statuses = ["All", "pending", "confirmed", "in-progress", "completed", "cancelled"];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-display font-bold text-gray-900">Order Management</h2>
                    <p className="text-sm text-gray-500">Track bookings, assign pandits, and manage puja status.</p>
                </div>
            </div>

            <div className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        placeholder="Search by ID, Name or Phone..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#ff7f0a]/20 text-sm"
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
                    <Filter size={14} className="text-gray-400 shrink-0" />
                    <div className="flex gap-2 min-w-max">
                        {statuses.map(s => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all border ${statusFilter === s ? "bg-gray-900 text-white border-gray-900" : "bg-gray-50 text-gray-500 border-gray-100 hover:border-gray-200"
                                    }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {loading ? <div className="text-center py-20 opacity-50">Loading orders...</div> : (
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                    <div className="table-container">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">Booking Info</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">User / Contact</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">Pooja / Temple</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">Amount</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredOrders.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-[#ff7f0a]">{order.bookingId}</p>
                                            <p className="text-[10px] text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-gray-900">{order.sankalpName}</p>
                                            <p className="text-xs text-gray-500">{order.phone}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-800">{order.poojaId?.name}</p>
                                            <p className="text-xs text-gray-500">{order.templeId?.name}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-gray-900 flex items-center gap-0.5"><IndianRupee size={12} />{order.totalAmount}</p>
                                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${order.paymentStatus === "paid" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                                                {order.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${statusStyles[order.orderStatus] || statusStyles.pending}`}>
                                                {order.orderStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link href={`/admin/orders/${order._id}`} className="inline-flex items-center gap-1 bg-orange-50 text-[#ff7f0a] text-[10px] font-bold px-3 py-1.5 rounded-lg border border-orange-100 hover:bg-[#ff7f0a] hover:text-white transition-all shadow-sm">
                                                <Eye size={14} /> Manage
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            {!loading && filteredOrders.length === 0 && <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200 italic text-gray-400">No orders found.</div>}
        </div>
    );
}
