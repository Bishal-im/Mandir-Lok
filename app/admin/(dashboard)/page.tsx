import Link from "next/link";
import {
  Users,
  IndianRupee,
  Star,
  ShoppingBag,
} from "lucide-react";
import { getDashboardStats, getOrdersAdmin } from "@/lib/actions/admin";

export const dynamic = "force-dynamic";

const statusConfig = {
  completed: { label: "Completed", bg: "bg-green-100", text: "text-green-700" },
  pending: { label: "Pending", bg: "bg-yellow-100", text: "text-yellow-700" },
  assigned: { label: "Assigned", bg: "bg-indigo-100", text: "text-indigo-700" },
  "in-progress": {
    label: "In Progress",
    bg: "bg-blue-100",
    text: "text-blue-700",
  },
  cancelled: { label: "Cancelled", bg: "bg-red-100", text: "text-red-700" },
};

export default async function AdminDashboard() {
  const statsDataRaw = (await getDashboardStats()) as any;
  const statsData = statsDataRaw.success
    ? statsDataRaw
    : { totalOrders: 0, totalRevenue: 0, totalUsers: 0, totalPandits: 0 };

  const recentOrdersRaw = await getOrdersAdmin();
  const recentOrders = Array.isArray(recentOrdersRaw) ? recentOrdersRaw.slice(0, 5) : [];

  const stats = [
    {
      label: "Total Orders",
      value: statsData.totalOrders.toLocaleString(),
      icon: <ShoppingBag size={20} />,
      color: "#ff7f0a",
    },
    {
      label: "Revenue",
      value: `₹${statsData.totalRevenue.toLocaleString()}`,
      icon: <IndianRupee size={20} />,
      color: "#8b0000",
    },
    {
      label: "Total Users",
      value: statsData.totalUsers.toLocaleString(),
      icon: <Users size={20} />,
      color: "#1a6b4a",
    },
    {
      label: "Active Pandits",
      value: statsData.totalPandits.toLocaleString(),
      icon: <Star size={20} />,
      color: "#f0bc00",
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                style={{ background: s.color }}
              >
                {s.icon}
              </div>
            </div>
            <p className="text-2xl font-display font-bold text-gray-900">
              {s.value}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Add Temple", emoji: "🛕", href: "/admin/temples/add" },
          { label: "Add Pooja", emoji: "🪔", href: "/admin/poojas/add" },
          { label: "Add Pandit", emoji: "🧘", href: "/admin/pandits/add" },
        ].map((a) => (
          <Link
            key={a.label}
            href={a.href}
            className="bg-white border border-gray-100 rounded-xl p-4 text-center hover:border-[#ffbd6e] hover:shadow-sm transition-all"
          >
            <div className="text-2xl mb-1.5">{a.emoji}</div>
            <p className="text-xs font-semibold text-gray-700">{a.label}</p>
          </Link>
        ))}
      </div>

      {/* ── Recent Orders Table ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-display font-semibold text-gray-900">
            Recent Orders
          </h2>
          <Link
            href="/admin/orders"
            className="text-xs text-[#ff7f0a] hover:underline"
          >
            View All →
          </Link>
        </div>

        <div className="table-container">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {[
                  "Order ID",
                  "User",
                  "Pooja",
                  "Amount",
                  "Status",
                  "Action",
                ].map((h) => (
                  <th
                    key={h}
                    className={`text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide ${(h === "Amount" || h === "Status") ? "hidden sm:table-cell" : ""
                      }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order: any, i: number) => {
                const sc = statusConfig[order.orderStatus as keyof typeof statusConfig] || statusConfig["pending"];
                return (
                  <tr
                    key={order._id}
                    className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${i % 2 === 0 ? "" : "bg-gray-50/20"}`}
                  >
                    <td className="px-4 py-3 text-[#ff7f0a] font-medium text-xs">
                      {order.bookingId}
                    </td>
                    <td className="px-4 py-3 text-gray-900 font-medium text-xs">
                      {order.userId?.name || "Unknown"}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {order.poojaId?.name || "Unknown"}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900 text-xs hidden sm:table-cell">
                      ₹{order.totalAmount?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${sc.bg || 'bg-gray-100'} ${sc.text || 'text-gray-700'}`}
                      >
                        {sc.label || order.orderStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <Link
                          href={`/admin/orders/${order._id}`}
                          className="text-[10px] text-gray-500 border border-gray-200 px-2.5 py-1 rounded-full hover:border-gray-400"
                        >
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-6 text-gray-500 text-sm">No orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
