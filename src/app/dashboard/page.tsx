"use client";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RTooltip,
    AreaChart,
    Area,
    BarChart,
    Bar,
    Legend,
} from "recharts";
import { TrendingUp, Users2, Package, ShoppingCart } from "lucide-react";

type Metrics = {
    customers: number;
    products: number;
    orders: number;
    revenue: number;
    topCustomers: { id: string; firstName: string | null; lastName: string | null; email: string | null; totalSpend: number | string }[];
    byDate: { date: string; orders: number; revenue: number }[];
};

export default function DashboardPage() {
    const [from, setFrom] = useState<string>("");
    const [to, setTo] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<Metrics | null>(null);

    async function load() {
        setLoading(true);
        const params = new URLSearchParams();
        if (from) params.set("from", from);
        if (to) params.set("to", to);
        const res = await fetch(`/api/metrics?${params.toString()}`);
        const json = await res.json();
        setData(json);
        if (res.headers.get("x-demo-data") === "true" || json.demo) {
            toast("Showing demo metrics (DB not connected)", { icon: "🔌" });
        } else {
            toast.success("Metrics loaded");
        }
        setLoading(false);
    }

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const totals = useMemo(() => ({
        customers: data?.customers ?? 0,
        products: data?.products ?? 0,
        orders: data?.orders ?? 0,
        revenue: data?.revenue ?? 0,
        avgOrder: (data && data.orders > 0) ? (data.revenue / data.orders) : 0,
    }), [data]);

    const spark = useMemo(() => (data?.byDate ?? []).slice(-10), [data]);

    return (
        <div className="min-h-dvh bg-white text-black dark:bg-neutral-950 dark:text-white">
            <div className="mx-auto max-w-7xl px-4 py-6">
                <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Insights Dashboard</h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Track your multi-tenant Shopify KPIs</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900" />
                        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900" />
                        <button onClick={load} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Apply</button>
                        <button onClick={() => {
                            const root = document.documentElement;
                            const isDark = root.classList.contains("dark");
                            if (isDark) {
                                root.classList.remove("dark");
                                root.classList.add("light");
                                toast("Switched to Light Mode", { icon: "🌤️" });
                            } else {
                                root.classList.remove("light");
                                root.classList.add("dark");
                                toast("Switched to Dark Mode", { icon: "🌙" });
                            }
                        }} className="rounded-md border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800">Toggle Theme</button>
                    </div>
                </header>

                {/* KPI Cards with sparklines */}
                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <KpiCard title="Customers" value={totals.customers.toLocaleString()} icon={<Users2 className="h-4 w-4" />} data={spark.map(d=>d.orders)} />
                    <KpiCard title="Products" value={totals.products.toLocaleString()} icon={<Package className="h-4 w-4" />} data={spark.map(d=>d.orders)} />
                    <KpiCard title="Orders" value={totals.orders.toLocaleString()} icon={<ShoppingCart className="h-4 w-4" />} data={spark.map(d=>d.orders)} accent="blue" />
                    <KpiCard title="Revenue" value={`₹${totals.revenue.toLocaleString()}`} icon={<TrendingUp className="h-4 w-4" />} data={spark.map(d=>d.revenue)} accent="emerald" />
                </section>

                <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 lg:col-span-2">
                        <h2 className="mb-3 text-sm font-semibold text-neutral-700 dark:text-neutral-200">Orders & Revenue by Date</h2>
                        {loading ? (
                            <div className="h-60 animate-pulse rounded-md bg-neutral-100 dark:bg-neutral-800" />
                        ) : (
                            <div className="h-60">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={data?.byDate ?? []} margin={{ left: 8, right: 8, top: 10 }}>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-200 dark:stroke-neutral-800" />
                                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                        <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                                        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                                        <RTooltip />
                                        <Legend />
                                        <Line yAxisId="left" type="monotone" dataKey="orders" name="Orders" stroke="#3b82f6" strokeWidth={2} dot={false} />
                                        <Line yAxisId="right" type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={2} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                        <h2 className="mb-3 text-sm font-semibold text-neutral-700 dark:text-neutral-200">Top 5 Customers by Spend</h2>
                        {loading ? (
                            <div className="h-60 animate-pulse rounded-md bg-neutral-100 dark:bg-neutral-800" />
                        ) : (
                            <div className="h-60">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={(data?.topCustomers ?? []).map((c) => ({
                                        name: (c.firstName || c.lastName ? `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim() : (c.email ?? "Unknown")),
                                        spend: Number(c.totalSpend),
                                    }))}>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-200 dark:stroke-neutral-800" />
                                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                        <YAxis tick={{ fontSize: 12 }} />
                                        <RTooltip />
                                        <Bar dataKey="spend" fill="#2563eb" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
// KPI Card with sparkline
function KpiCard({ title, value, icon, data, accent }: { title: string; value: string; icon: React.ReactNode; data: number[]; accent?: "blue" | "emerald" }) {
    const color = accent === "emerald" ? "#10b981" : "#3b82f6";
    const areaColor = accent === "emerald" ? "#34d399" : "#60a5fa";
    const points = (data ?? []).map((y, i) => ({ x: i, y }));
    return (
        <div className="relative overflow-hidden rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center justify-between">
                <p className="text-xs uppercase text-neutral-500">{title}</p>
                <span className="text-neutral-400">{icon}</span>
            </div>
            <p className="mt-2 text-3xl font-semibold">{value}</p>
            <div className="mt-2 h-14">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={points} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
                        <defs>
                            <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={areaColor} stopOpacity={0.5} />
                                <stop offset="100%" stopColor={areaColor} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="x" hide />
                        <YAxis hide />
                        <Area type="monotone" dataKey="y" stroke={color} strokeWidth={2} fill={`url(#grad-${title})`} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
