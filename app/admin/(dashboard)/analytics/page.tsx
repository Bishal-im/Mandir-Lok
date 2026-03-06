"use client";

import { useEffect, useState } from "react";
import { getAnalyticsData } from "@/lib/actions/admin";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell, PieChart, Pie, Legend
} from "recharts";
import {
    TrendingUp, Users, ShoppingBag, IndianRupee,
    ArrowUpRight, ArrowDownRight, Calendar, Loader2
} from "lucide-react";

export default function AnalyticsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const res = await getAnalyticsData();
            if (res.success) {
                setData(res);
            }
            setLoading(false);
        }
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-400">
                <Loader2 className="animate-spin mb-2" size={32} />
                <p>Analyzing data...</p>
            </div>
        );
    }

    if (!data) return <div className="p-8 text-center text-red-500">Failed to load analytics data.</div>;

    const COLORS = ["#ff7f0a", "#8b0000", "#1a6b4a", "#f0bc00", "#4B0082"];

    return (
        <div className="space-y-8 pb-10">
            <div>
                <h2 className="text-2xl font-display font-bold text-gray-900">Analytics & Insights</h2>
                <p className="text-sm text-gray-500">Numerical breakdown of Mandirlok performance over the last 30 days.</p>
            </div>

            {/* ── Revenue Graph ── */}
            <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <div>
                        <h3 className="font-bold text-gray-900 text-sm sm:text-base">Revenue Trend (INR)</h3>
                        <p className="text-[10px] sm:text-xs text-gray-500">Daily earnings from poojas and chadhava.</p>
                    </div>
                </div>
                <div className="h-[250px] sm:h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data.revenueData} margin={{ left: -20, right: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis
                                dataKey="_id"
                                tickFormatter={(str) => new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short' }).format(new Date(str))}
                                fontSize={9}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis fontSize={9} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '11px' }}
                                labelFormatter={(label) => new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(label))}
                                formatter={(value: any) => [`₹${value.toLocaleString()}`, "Revenue"]}
                            />
                            <Line
                                type="monotone"
                                dataKey="revenue"
                                stroke="#ff7f0a"
                                strokeWidth={2}
                                dot={{ fill: '#ff7f0a', strokeWidth: 1, r: 3 }}
                                activeDot={{ r: 5, strokeWidth: 0 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ── Top Temples ── */}
                <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4 sm:mb-6 text-sm sm:text-base">Top Performing Temples</h3>
                    <div className="space-y-4">
                        {data.topTemples.map((temple: any, i: number) => (
                            <div key={temple.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gray-50 flex items-center justify-center text-[10px] sm:text-xs font-bold text-gray-400">
                                        {i + 1}
                                    </div>
                                    <div className="max-w-[120px] sm:max-w-none">
                                        <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{temple.name}</p>
                                        <p className="text-[9px] sm:text-[10px] text-gray-500">{temple.count} bookings</p>
                                    </div>
                                </div>
                                <p className="text-xs sm:text-sm font-bold text-gray-900">₹{temple.revenue.toLocaleString()}</p>
                            </div>
                        ))}
                        {data.topTemples.length === 0 && <p className="text-center py-10 text-gray-400 italic text-sm">No data available.</p>}
                    </div>
                </div>

                {/* ── Top Poojas ── */}
                <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4 sm:mb-6 text-sm sm:text-base">Most Popular Poojas</h3>
                    <div className="h-[200px] sm:h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.topPoojas} layout="vertical" margin={{ left: -20, right: 20 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} fontSize={9} axisLine={false} tickLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '11px' }}
                                    formatter={(value: any) => [`₹${value.toLocaleString()}`, "Revenue"]}
                                />
                                <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                                    {data.topPoojas.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* ── Daily Orders ── */}
            <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4 sm:mb-6 text-sm sm:text-base">Daily Order Volume</h3>
                <div className="h-[180px] sm:h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.revenueData} margin={{ left: -30, right: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis
                                dataKey="_id"
                                tickFormatter={(str) => new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short' }).format(new Date(str))}
                                fontSize={9}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis fontSize={9} tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '11px' }}
                                labelFormatter={(label) => new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(label))}
                            />
                            <Bar dataKey="orders" fill="#1a6b4a" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
