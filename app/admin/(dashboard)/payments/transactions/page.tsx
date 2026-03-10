import { getTransactionsAdmin } from "@/lib/actions/admin";
import { IndianRupee, Calendar, User, Search } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
    const transactions = await getTransactionsAdmin();

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-display font-bold text-gray-900">Transactions</h2>
                    <p className="text-sm text-gray-500">View all successful payments and order details.</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by Order ID..."
                        className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-[#ff7f0a] focus:border-transparent"
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="table-container">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                {[
                                    "Date",
                                    "Order ID",
                                    "User",
                                    "Pooja / Temple",
                                    "Amount",
                                    "Payment ID",
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
                            {transactions.map((tx: any) => (
                                <tr key={tx._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Calendar size={14} className="text-gray-400" />
                                            {new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(tx.createdAt))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-[#ff7f0a]">
                                        {tx.bookingId}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-[#ff7f0a]">
                                                <User size={14} />
                                            </div>
                                            <div>
                                                <p className="text-gray-900 font-medium">{tx.userId?.name || "Unknown"}</p>
                                                <p className="text-[10px] text-gray-500">{tx.userId?.email || "N/A"}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-gray-900 font-medium">{tx.poojaId?.name || "Sacred Offering"}</p>
                                        <p className="text-[10px] text-gray-500">{tx.templeId?.name || "Unknown Temple"}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1 font-bold text-gray-900">
                                            <IndianRupee size={14} />
                                            {tx.totalAmount?.toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs text-gray-500 uppercase">
                                        {tx.cashfreePaymentId || "N/A"}
                                    </td>
                                </tr>
                            ))}
                            {transactions.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 italic">
                                        No transactions found.
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
