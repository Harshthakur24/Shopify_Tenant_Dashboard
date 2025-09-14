'use client'
import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
    CheckCircle2,
    Loader2,
    Package,
    Search,
    TrendingUp,
    TrendingDown,
    Users,
    Star,
    BarChart3,
    PieChart,
    Activity,
    Zap,
    ShoppingBag,
    ArrowRight,
    Calendar,
    X
} from "lucide-react";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    Title,
    Filler
} from "chart.js";
import CountUp from "react-countup";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AreaChartStacked, BarChartMultiple, LineChartMultiple, PieChartLabel, RadarChartMultiple, RadialChartStacked } from "@/components/charts";
import { transformPricesToBarChart, transformVendorsToLineChart, calculateTrend } from "@/lib/chart-utils";
import { WebhookActivity } from "@/components/webhook-activity";
import CustomersList from "@/components/customers-list";
import OrdersList from "@/components/orders-list";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend, Title, Filler);

type ShopifyVariant = {
    id: number | string;
    title: string;
    price: string;
    option1?: string | null;
    inventory_quantity?: number | null;
};

type ShopifyOption = {
    id: number | string;
    name: string;
    values: string[];
};

type ShopifyImage = {
    src?: string;
    alt?: string | null;
};

type ShopifyProduct = {
    id: number | string;
    title: string;
    body_html?: string;
    status?: string;
    vendor?: string;
    product_type?: string;
    handle?: string;
    created_at?: string;
    image?: ShopifyImage | null;
    images?: ShopifyImage[];
    options?: ShopifyOption[];
    variants: ShopifyVariant[];
};

export default function ShopifyDashboard() {
    const [products, setProducts] = useState<ShopifyProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState<string>("");
    const [sort, setSort] = useState<string>("recent");
    const [fallbackToast, setFallbackToast] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
        start: "",
        end: ""
    });
    const [showDateFilter, setShowDateFilter] = useState(false);
    const [descExpanded, setDescExpanded] = useState<Record<string, boolean>>({});
    const [colorsVisible, setColorsVisible] = useState<Record<string, boolean>>({});
    const [variantsExpanded, setVariantsExpanded] = useState<Record<string, boolean>>({});
    const [activeTab, setActiveTab] = useState("overview");
    const [selectedButton, setSelectedButton] = useState("products");
    // Navbar removed per request

    // Ensure overview tab and products button are shown by default
    useEffect(() => {
        setActiveTab("overview");
        setSelectedButton("products");
    }, []);

    useEffect(() => {
        const fetchProducts = async (): Promise<void> => {
            try {
                const url = new URL('/api/shopify/products', window.location.origin);
                if (dateRange.start) url.searchParams.set('startDate', dateRange.start);
                if (dateRange.end) url.searchParams.set('endDate', dateRange.end);

                const res = await fetch(url.toString());
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json = await res.json();
                setProducts(Array.isArray(json?.products) ? json.products : []);
                if (json.__fallback) {
                    setFallbackToast("Using default admin store because your Shopify access token is missing or invalid.");
                    setTimeout(() => setFallbackToast(null), 10000);
                }
            } catch (e) {
                setError(`Failed to load products: ${String((e as Error).message ?? e)}`);
            } finally {
                setLoading(false);
            }
        };

        // Initial fetch
        fetchProducts();

        // Refetch after 3.5 seconds (just to ensure latest data is loaded after sync)
        const timeout1 = setTimeout(() => {
            fetchProducts();
        }, 3500);


        return () => {
            clearTimeout(timeout1);
        };
    }, [dateRange.start, dateRange.end]);

    // Navbar logic removed

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white px-4">
                <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-red-700">
                    {error}
                </div>
            </div>
        );
    }

    // Derived metrics + filters
    const categories = Array.from(new Set(products.map(p => p.product_type || "Uncategorized")));
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.status === "active").length;
    const uniqueVendors = new Set(products.map(p => p.vendor || "Unknown")).size;
    const avgPrice = products.length
        ? products.reduce((sum, p) => sum + Number(p.variants?.[0]?.price || 0), 0) / products.length
        : 0;
    const allVariants = products.flatMap(p => p.variants || []);
    const totalVariants = allVariants.length;

    // Price buckets (₹)
    const bucketLabels = ["<500", "500-999", "1000-1999", "2000-4999", "5000+"];
    const bucketCounts = [0, 0, 0, 0, 0];
    for (const v of allVariants) {
        const price = Number(v.price || 0);
        let idx = 4;
        if (price < 500) idx = 0; else if (price < 1000) idx = 1; else if (price < 2000) idx = 2; else if (price < 5000) idx = 3; else idx = 4;
        bucketCounts[idx] += 1;
    }

    // Color / option1 distribution
    const colorCounts: Record<string, number> = {};
    for (const v of allVariants) {
        const key = (v.option1 || v.title || "Unknown").trim();
        if (!key) continue;
        colorCounts[key] = (colorCounts[key] || 0) + 1;
    }
    const colorLabels = Object.keys(colorCounts).slice(0, 12); // cap labels for readability
    const colorValues = colorLabels.map(k => colorCounts[k]);

    // Products created by day
    const byDay: Record<string, number> = {};
    for (const p of products) {
        if (!p.created_at) continue;
        const d = new Date(p.created_at);
        if (isNaN(d.getTime())) continue;
        const key = d.toISOString().slice(0, 10);
        byDay[key] = (byDay[key] || 0) + 1;
    }
    const dayLabels = Object.keys(byDay).sort();
    const dayValues = dayLabels.map(k => byDay[k]);

    // Vendors share & top products by variant count
    const vendorCounts: Record<string, number> = {};
    for (const p of products) {
        const v = p.vendor || "Unknown";
        vendorCounts[v] = (vendorCounts[v] || 0) + 1;
    }
    const vendorLabels = Object.keys(vendorCounts);
    const vendorValues = vendorLabels.map(k => vendorCounts[k]);

    const productsByVariantCount = [...products]
        .map(p => ({ title: p.title, count: (p.variants || []).length }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);
    const topVariantLabels = productsByVariantCount.map(p => p.title);
    const topVariantValues = productsByVariantCount.map(p => p.count);

    // Min/Max price and stock status
    const prices = allVariants.map(v => Number(v.price || 0)).filter(n => !isNaN(n));
    const minPrice = prices.length ? Math.min(...prices) : 0;
    const maxPrice = prices.length ? Math.max(...prices) : 0;
    const outOfStock = allVariants.filter(v => (v.inventory_quantity ?? undefined) === 0).length;

    const chartColors = {
        blue: "#2563eb",
        blueLight: "#93c5fd",
        violet: "#7c3aed",
        emerald: "#10b981",
        amber: "#f59e0b",
        rose: "#f43f5e",
    } as const;

    const baseAnim = { animation: { duration: 900, easing: 'easeOutQuart' as const } };

    const priceBar = {
        labels: bucketLabels,
        datasets: [
            {
                label: "Variants",
                data: bucketCounts,
                backgroundColor: chartColors.blue,
                borderRadius: 8,
            },
        ],
    };



    const filtered = products
        .filter(p => p.title.toLowerCase().includes(search.toLowerCase()))
        .filter(p => category === "" ? true : (p.product_type || "Uncategorized") === category)
        .sort((a, b) => {
            if (sort === "price-asc") return Number(a.variants?.[0]?.price || 0) - Number(b.variants?.[0]?.price || 0);
            if (sort === "price-desc") return Number(b.variants?.[0]?.price || 0) - Number(a.variants?.[0]?.price || 0);
            return 0;
        });

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
            {/* Toast Notification */}
            {fallbackToast && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="fixed left-1/2 top-4 z-50 w-[600px] max-w-[95vw] -translate-x-1/2"
                >
                    <Card className="border-emerald-200 bg-emerald-50/95 backdrop-blur-sm">
                        <CardContent className="flex items-center gap-3 p-4">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                            <span className="text-sm font-medium text-emerald-800">{fallbackToast}</span>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            <div className="container mx-auto p-6 space-y-8">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    <Card className="border-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                    <CardTitle className="text-3xl font-bold text-white">
                                        Shopify Analytics Dashboard
                                    </CardTitle>
                                    <CardDescription className="text-blue-100">
                                        Real-time insights and performance metrics
                                    </CardDescription>
                                </div>
                                <div className="flex flex-col lg:flex-row items-end gap-4">


                                    {/* Search and Filters in Header */}
                                    <div className="flex flex-col lg:flex-row gap-3 items-end">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
                                            <input
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                placeholder="Search products..."
                                                className="w-64 rounded-lg bg-white/20 border border-white/30 px-10 py-2 text-sm text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/30"
                                            />
                                        </div>
                                        <select
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            className="rounded-lg bg-white/20 border border-white/30 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                                        >
                                            <option value="" className="text-gray-900">Select Category</option>
                                            {categories.map((c) => (
                                                <option key={c} value={c} className="text-gray-900">{c}</option>
                                            ))}
                                        </select>
                                        <select
                                            value={sort}
                                            onChange={(e) => setSort(e.target.value)}
                                            className="rounded-lg bg-white/20 border border-white/30 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                                        >
                                            <option value="recent" className="text-gray-900">Sort by Recent</option>
                                            <option value="price-asc" className="text-gray-900">Price: Low to High</option>
                                            <option value="price-desc" className="text-gray-900">Price: High to Low</option>
                                        </select>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                                            onClick={() => setShowDateFilter(!showDateFilter)}
                                        >
                                            <Calendar className="h-4 w-4 mr-2" />
                                            Date Range
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* KPI Cards Row */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.1 }}
                                    className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-blue-100 text-sm font-medium">Total Products</p>
                                            <p className="text-2xl font-bold text-white">
                                                <CountUp end={totalProducts} duration={2} />
                                            </p>
                                        </div>
                                        <Package className="h-8 w-8 text-blue-200" />
                                    </div>
                                    <div className="flex items-center mt-2 text-xs">
                                        <TrendingUp className="h-3 w-3 mr-1" />
                                        <span className="text-blue-100">+12% from last month</span>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-blue-100 text-sm font-medium">Active Products</p>
                                            <p className="text-2xl font-bold text-white">
                                                <CountUp end={activeProducts} duration={2} />
                                            </p>
                                        </div>
                                        <Activity className="h-8 w-8 text-green-300" />
                                    </div>
                                    <div className="flex items-center mt-2 text-xs">
                                        <TrendingUp className="h-3 w-3 mr-1" />
                                        <span className="text-blue-100">+8% from last month</span>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-blue-100 text-sm font-medium">Vendors</p>
                                            <p className="text-2xl font-bold text-white">
                                                <CountUp end={uniqueVendors} duration={2} />
                                            </p>
                                        </div>
                                        <Users className="h-8 w-8 text-purple-300" />
                                    </div>
                                    <div className="flex items-center mt-2 text-xs">
                                        <TrendingUp className="h-3 w-3 mr-1" />
                                        <span className="text-blue-100">+3 new vendors</span>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-blue-100 text-sm font-medium">Avg. Price</p>
                                            <p className="text-2xl font-bold text-white">
                                                ₹<CountUp end={Math.round(avgPrice)} duration={2} separator="," />
                                            </p>
                                        </div>
                                        <Star className="h-8 w-8 text-yellow-300" />
                                    </div>
                                    <div className="flex items-center mt-2 text-xs">
                                        <TrendingDown className="h-3 w-3 mr-1" />
                                        <span className="text-blue-100">-2% from last month</span>
                                    </div>
                                </motion.div>
                            </div>
                        </CardContent>
                    </Card>

                </motion.div>

                {/* Date Range Filter */}
                {showDateFilter && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Date Range Filter</h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setShowDateFilter(false);
                                    setDateRange({ start: '', end: '' });
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    value={dateRange.start}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    value={dateRange.end}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div className="flex items-end">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setDateRange({ start: "", end: "" })}
                                    className="text-gray-600 hover:text-gray-800"
                                >
                                    Clear
                                </Button>
                            </div>
                        </div>
                        {(dateRange.start || dateRange.end) && (
                            <div className="mt-3 flex items-center gap-2 text-sm text-blue-600">
                                <Calendar className="h-4 w-4" />
                                <span>
                                    {dateRange.start && dateRange.end
                                        ? `Filtering products from ${dateRange.start} to ${dateRange.end}`
                                        : dateRange.start
                                            ? `Showing products from ${dateRange.start} onwards`
                                            : `Showing products up to ${dateRange.end}`
                                    }
                                </span>
                            </div>
                        )}
                    </motion.div>
                )}

                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${selectedButton === "products" ? "bg-orange-500" :
                        selectedButton === "customers" ? "bg-blue-500" :
                            selectedButton === "orders" ? "bg-purple-500" :
                                "bg-orange-500"
                        }`}>
                        {selectedButton === "products" && <ShoppingBag className="h-6 w-6 text-white" />}
                        {selectedButton === "customers" && <Users className="h-6 w-6 text-white" />}
                        {selectedButton === "orders" && <Package className="h-6 w-6 text-white" />}
                        {!selectedButton && <ShoppingBag className="h-6 w-6 text-white" />}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">
                            {selectedButton === "products" && "Your Store Products"}
                            {selectedButton === "customers" && "Your Customers"}
                            {selectedButton === "orders" && "Your Orders"}
                            {!selectedButton && "Your Store Products"}
                        </h2>
                        <p className="text-muted-foreground">
                            {selectedButton === "products" && "Comprehensive view of your Products"}
                            {selectedButton === "customers" && "Manage your customer relationships"}
                            {selectedButton === "orders" && "Track and manage your orders"}
                            {!selectedButton && "Comprehensive view of your Products"}
                        </p>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center gap-3 ml-10">
                        <Button
                            onClick={() => setSelectedButton("products")}
                            className={`py-7 px-5 text-white shadow-lg rounded-full hover:cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 ${selectedButton === "products"
                                ? "bg-orange-600 ring-2 ring-orange-300"
                                : "bg-orange-500 hover:bg-orange-600"
                                }`}
                        >
                            <ShoppingBag className="w-4 h-4 mr-2" />
                            Your Products {selectedButton === "products" && "✓"}
                        </Button>

                        <Button
                            onClick={() => setSelectedButton("customers")}
                            className={`py-7 px-5 text-white shadow-lg rounded-full hover:cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 ${selectedButton === "customers"
                                ? "bg-blue-600 ring-2 ring-blue-300"
                                : "bg-blue-500 hover:bg-blue-600"
                                }`}
                        >
                            <Users className="w-4 h-4 mr-2" />
                            Your Customers {selectedButton === "customers" && "✓"}
                        </Button>

                        <Button
                            onClick={() => setSelectedButton("orders")}
                            className={`py-7 px-5 text-white shadow-lg rounded-full hover:cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 ${selectedButton === "orders"
                                ? "bg-purple-600 ring-2 ring-purple-300"
                                : "bg-purple-500 hover:bg-purple-600"
                                }`}
                        >
                            <Package className="w-4 h-4 mr-2" />
                            Your Orders {selectedButton === "orders" && "✓"}
                        </Button>

                        <Link href="/shopify-integration">
                            <Button className="bg-green-500 py-7 px-5 text-white shadow-lg rounded-full hover:bg-green-600 hover:cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105">
                                <ShoppingBag className="w-4 h-4 mr-2" />
                                Shopify Integration <ArrowRight className="w-4 h-4 group-hover:translate-x-1 items-center" />
                            </Button>
                        </Link>
                    </div>
                </div>



                {/* Content Switching Area */}
                <div className="space-y-6">
                    {selectedButton === "products" && (
                        <div>
                            <h3 className="text-xl font-semibold mb-4">Your Products</h3>
                            <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {filtered.map((product) => (
                                    <article key={product.id} className="group overflow-hidden rounded-2xl border border-blue-100/50 bg-white/80 shadow-lg transition duration-300 hover:scale-[1.02] hover:shadow-xl hover:bg-white/90">
                                        <div className="relative h-64 w-full bg-neutral-100 overflow-hidden">
                                            {product.image?.src ? (
                                                <Image
                                                    src={product.image.src}
                                                    alt={product.image.alt || product.title}
                                                    fill
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                    className="object-cover transition duration-300 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full bg-gradient-to-br from-neutral-100 to-neutral-200">
                                                    <div className="text-center">
                                                        <Package className="h-12 w-12 text-neutral-400 mx-auto mb-2" />
                                                        <p className="text-sm text-neutral-500">No Image</p>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/20 to-transparent p-4">
                                                <div className="flex items-center justify-between">
                                                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${product.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-700'}`}>
                                                        {product.status || 'draft'}
                                                    </span>
                                                    <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                                                        ₹{Number(product.variants?.[0]?.price || 0).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <div className="flex items-start justify-between gap-2">
                                                <h2 className="line-clamp-1 text-lg font-semibold text-neutral-900">{product.title}</h2>
                                                {product.vendor && (
                                                    <span className="whitespace-nowrap text-xs text-neutral-500">{product.vendor}</span>
                                                )}
                                            </div>
                                            <div
                                                className={`prose prose-sm mt-2 max-w-none text-neutral-600 ${descExpanded[String(product.id)] ? '' : 'line-clamp-3'}`}
                                                dangerouslySetInnerHTML={{ __html: product.body_html || '' }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setDescExpanded((s) => ({ ...s, [String(product.id)]: !s[String(product.id)] }))}
                                                className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                                            >
                                                {descExpanded[String(product.id)] ? 'Show less' : 'Show more'}
                                            </button>

                                            {product.options && product.options.length > 0 && (
                                                <div className="mt-3">
                                                    {!colorsVisible[String(product.id)] ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => setColorsVisible((s) => ({ ...s, [String(product.id)]: true }))}
                                                            className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
                                                        >
                                                            Show colors
                                                        </button>
                                                    ) : (
                                                        <>
                                                            <div className="mb-2 flex flex-wrap gap-2">
                                                                {product.options.flatMap((opt) =>
                                                                    (opt.values || []).map((val, idx) => (
                                                                        <span key={`${String(opt.id)}-${idx}`} className="inline-flex items-center rounded-md bg-blue-100/50 px-2 py-1 text-xs font-medium text-blue-700 backdrop-blur-lg">
                                                                            {val}
                                                                        </span>
                                                                    ))
                                                                )}
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => setColorsVisible((s) => ({ ...s, [String(product.id)]: false }))}
                                                                className="rounded-md border border-blue-200 bg-white px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50"
                                                            >
                                                                Hide colors
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            )}

                                            <div className="mt-4 rounded-lg border border-neutral-200/50 bg-white/50">
                                                {(variantsExpanded[String(product.id)] ? (product.variants || []) : (product.variants || []).slice(0, 1)).map((variant, idx, arr) => (
                                                    <div key={`${product.id}-variant-${idx}-${variant.id}`} className={`flex items-center justify-between px-3 py-2 ${idx === 0 ? 'first:rounded-t-lg' : ''} ${idx === arr.length - 1 && (!variantsExpanded[String(product.id)] || (product.variants || []).length === arr.length) ? 'last:rounded-b-lg last:border-0' : ''} border-b border-neutral-200`}>
                                                        <span className="text-sm text-neutral-700">{variant.title}</span>
                                                        <span className="text-sm font-semibold text-blue-600">₹{Number(variant.price).toLocaleString()}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            {(product.variants && product.variants.length > 1) && (
                                                <button
                                                    type="button"
                                                    onClick={() => setVariantsExpanded((s) => ({ ...s, [String(product.id)]: !s[String(product.id)] }))}
                                                    className="mt-2 border border-blue-200 bg-white px-4 py-3 text-xs font-bold rounded-full hover:scale-105 duration-300 hover:cursor-pointer text-blue-700 hover:bg-blue-50"
                                                >
                                                    {variantsExpanded[String(product.id)] ? 'Hide varieties' : `Show all varieties of this product (${product.variants.length})`}
                                                </button>
                                            )}

                                            <div className="mt-4 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <a
                                                        href={`https://xeno-assignment-store.myshopify.com/products/${product.handle ?? ''}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:translate-y-[-1px] hover:shadow-md active:translate-y-[1px]"
                                                    >
                                                        View Product
                                                    </a>
                                                    <a
                                                        href={`https://xeno-assignment-store.myshopify.com/products/${product.handle ?? ''}`}
                                                        target="_blank"
                                                        className="rounded-xl border border-blue-200 bg-white/80 px-4 py-2 text-sm font-medium text-blue-600 shadow-sm backdrop-blur-lg transition hover:border-blue-300 hover:bg-white hover:translate-y-[-1px] hover:shadow-md active:translate-y-[1px]"
                                                    >
                                                        Manage Stock
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </section>
                            {filtered.length === 0 && (
                                <Card className="text-center py-12">
                                    <CardContent className="space-y-4">
                                        <Package className="h-16 w-16 text-muted-foreground mx-auto" />
                                        <div className="space-y-2">
                                            <CardTitle className="text-xl">No products found</CardTitle>
                                            <CardDescription>
                                                Try adjusting your search criteria or filters to find products
                                            </CardDescription>
                                        </div>
                                        <Button variant="outline" onClick={() => {
                                            setSearch('');
                                            setCategory('');
                                            setDateRange({ start: '', end: '' });
                                        }}>
                                            Clear Filters
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}

                    {selectedButton === "customers" && (
                        <div>
                            <CustomersList />
                        </div>
                    )}

                    {selectedButton === "orders" && (
                        <div>
                            <OrdersList />
                        </div>
                    )}
                </div>

                {/* Quick Navigation Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Card className="bg-gradient-to-r from-slate-50 to-blue-50 border-blue-200">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Navigation</h3>
                                    <p className="text-sm text-gray-600">Jump directly to your customers and orders data</p>
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        onClick={() => {
                                            console.log('Quick nav customers clicked');
                                            setActiveTab("customers");
                                        }}
                                        variant="outline"
                                        className={`${activeTab === "customers"
                                            ? "bg-blue-50 border-blue-400 text-blue-700"
                                            : "bg-white hover:bg-blue-50 border-blue-200 hover:border-blue-300"
                                            }`}
                                    >
                                        <Users className="w-4 h-4 mr-2" />
                                        Customers {activeTab === "customers" && "✓"}
                                    </Button>
                                    <Button
                                        onClick={() => setActiveTab("orders")}
                                        variant="outline"
                                        className={`${activeTab === "orders"
                                            ? "bg-purple-50 border-purple-400 text-purple-700"
                                            : "bg-white hover:bg-purple-50 border-purple-200 hover:border-purple-300"
                                            }`}
                                    >
                                        <Package className="w-4 h-4 mr-2" />
                                        Orders {activeTab === "orders" && "✓"}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Analytics Tabs Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="space-y-6"
                    >
                        <div className="flex items-center justify-between">
                            <TabsList className="grid w-full max-w-2xl grid-cols-3">
                                <TabsTrigger value="overview" className="flex items-center gap-2">
                                    <BarChart3 className="h-4 w-4" />
                                    Overview
                                </TabsTrigger>
                                <TabsTrigger value="performance" className="flex items-center gap-2">
                                    <Activity className="h-4 w-4" />
                                    Performance
                                </TabsTrigger>
                                <TabsTrigger value="vendors" className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    Vendors
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="overview" className="space-y-8">
                            {/* Products Section */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-500 p-2 rounded-lg">
                                        <Package className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-foreground">Products Analytics</h2>
                                        <p className="text-muted-foreground">Comprehensive view of your product portfolio</p>
                                    </div>
                                </div>

                                {/* Product Charts Row 1 */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <Card className="hover:shadow-lg transition-shadow">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-base font-semibold">Price Distribution</CardTitle>
                                            <div className="bg-blue-100 p-2 rounded-lg">
                                                <BarChart3 className="h-4 w-4 text-blue-600" />
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <Bar data={priceBar} options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                scales: {
                                                    y: {
                                                        ticks: { precision: 0 },
                                                        grid: { color: '#f1f5f9' }
                                                    },
                                                    x: { grid: { display: false } }
                                                },
                                                plugins: { legend: { display: false } },
                                                backgroundColor: '#3b82f6',
                                                ...baseAnim
                                            }} height={280} />
                                        </CardContent>
                                    </Card>

                                    <Card className="hover:shadow-lg transition-shadow overflow-hidden">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-base font-semibold">Product Categories</CardTitle>
                                            <div className="bg-gradient-to-r from-emerald-400 to-cyan-400 p-2 rounded-lg">
                                                <BarChart3 className="h-4 w-4 text-white" />
                                            </div>
                                        </CardHeader>
                                        <CardContent className="relative">
                                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-cyan-50/50 pointer-events-none"></div>
                                            <div className="relative">
                                                <Line data={{
                                                    labels: categories.map(cat => cat.length > 10 ? cat.slice(0, 10) + "..." : cat),
                                                    datasets: [{
                                                        label: "Products",
                                                        data: categories.map(cat => products.filter(p => (p.product_type || "Uncategorized") === cat).length),
                                                        fill: true,
                                                        backgroundColor: (context: { chart: { ctx: CanvasRenderingContext2D } }) => {
                                                            const ctx = context.chart.ctx;
                                                            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                                                            gradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)');
                                                            gradient.addColorStop(0.5, 'rgba(6, 182, 212, 0.2)');
                                                            gradient.addColorStop(1, 'rgba(6, 182, 212, 0.05)');
                                                            return gradient;
                                                        },
                                                        borderColor: '#10b981',
                                                        borderWidth: 3,
                                                        tension: 0.4,
                                                        pointBackgroundColor: '#ffffff',
                                                        pointBorderColor: '#10b981',
                                                        pointBorderWidth: 3,
                                                        pointRadius: 6,
                                                        pointHoverRadius: 8,
                                                        pointHoverBackgroundColor: '#10b981',
                                                        pointHoverBorderColor: '#ffffff',
                                                        pointHoverBorderWidth: 3,
                                                        pointShadowColor: 'rgba(16, 185, 129, 0.3)',
                                                        pointShadowBlur: 10
                                                    }]
                                                }} options={{
                                                    responsive: true,
                                                    maintainAspectRatio: false,
                                                    interaction: {
                                                        intersect: false,
                                                        mode: 'index'
                                                    },
                                                    plugins: {
                                                        legend: { display: false },
                                                        tooltip: {
                                                            backgroundColor: 'rgba(0, 0, 0, 0.9)',
                                                            titleColor: '#ffffff',
                                                            bodyColor: '#ffffff',
                                                            borderColor: '#10b981',
                                                            borderWidth: 2,
                                                            cornerRadius: 12,
                                                            displayColors: false,
                                                            padding: 12,
                                                            titleFont: { size: 14, weight: 'bold' },
                                                            bodyFont: { size: 13 },
                                                            callbacks: {
                                                                title: function (context: Array<{ dataIndex: number }>) {
                                                                    return categories[context[0].dataIndex];
                                                                },
                                                                label: function (context: { parsed: { y: number } }) {
                                                                    return `${context.parsed.y} products`;
                                                                },
                                                                afterLabel: function (context: { parsed: { y: number } }) {
                                                                    const total = categories.reduce((sum, cat) =>
                                                                        sum + products.filter(p => (p.product_type || "Uncategorized") === cat).length, 0);
                                                                    const percentage = ((context.parsed.y / total) * 100).toFixed(1);
                                                                    return `${percentage}% of total`;
                                                                }
                                                            }
                                                        }
                                                    },
                                                    scales: {
                                                        y: {
                                                            beginAtZero: true,
                                                            ticks: {
                                                                precision: 0,
                                                                color: '#64748b',
                                                                font: { size: 12 },
                                                                padding: 8
                                                            },
                                                            grid: {
                                                                color: 'rgba(148, 163, 184, 0.1)',
                                                                drawBorder: false,
                                                                lineWidth: 1
                                                            },
                                                            border: { display: false }
                                                        },
                                                        x: {
                                                            ticks: {
                                                                color: '#64748b',
                                                                font: { size: 11 },
                                                                maxRotation: 0,
                                                                padding: 8
                                                            },
                                                            grid: { display: false },
                                                            border: { display: false }
                                                        }
                                                    },
                                                    elements: {
                                                        line: {
                                                            borderJoinStyle: 'round',
                                                            borderCapStyle: 'round'
                                                        }
                                                    },
                                                    ...baseAnim
                                                }} height={280} />
                                            </div>
                                        </CardContent>
                                        <div className="px-6 pb-6">
                                            <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 mb-1">
                                                <TrendingUp className="h-4 w-4" />
                                                Category Performance Trend
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Visual distribution across product categories with gradient fill
                                            </p>
                                        </div>
                                    </Card>

                                    <Card className="hover:shadow-lg transition-shadow">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-base font-semibold">Creation Trend</CardTitle>
                                            <div className="bg-purple-100 p-2 rounded-lg">
                                                <Activity className="h-4 w-4 text-purple-600" />
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <Line data={{
                                                labels: dayLabels,
                                                datasets: [{
                                                    label: "Products Created",
                                                    data: dayValues,
                                                    borderColor: '#8b5cf6',
                                                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                                                    tension: 0.4,
                                                    fill: true,
                                                    pointBackgroundColor: '#8b5cf6',
                                                    pointBorderColor: '#ffffff',
                                                    pointBorderWidth: 2
                                                }]
                                            }} options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: { legend: { display: false } },
                                                scales: {
                                                    y: {
                                                        ticks: { precision: 0 },
                                                        grid: { color: '#f1f5f9' }
                                                    },
                                                    x: { grid: { display: false } }
                                                },
                                                ...baseAnim
                                            }} height={280} />
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Product Charts Row 2 */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <Card className="hover:shadow-lg transition-shadow">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <div className="bg-orange-100 p-2 rounded-lg">
                                                    <Users className="h-5 w-5 text-orange-600" />
                                                </div>
                                                Vendor Market Share
                                            </CardTitle>
                                            <CardDescription>Distribution of products across different vendors</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <Doughnut data={{
                                                labels: vendorLabels,
                                                datasets: [{
                                                    data: vendorValues,
                                                    backgroundColor: [
                                                        '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'
                                                    ],
                                                    borderWidth: 0,
                                                    spacing: 2
                                                }]
                                            }} options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: {
                                                        position: 'bottom',
                                                        labels: { usePointStyle: true, padding: 15 }
                                                    }
                                                },
                                                cutout: '65%',
                                                ...baseAnim
                                            }} height={320} />
                                        </CardContent>
                                    </Card>

                                    <Card className="hover:shadow-lg transition-shadow">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <div className="bg-cyan-100 p-2 rounded-lg">
                                                    <BarChart3 className="h-5 w-5 text-cyan-600" />
                                                </div>
                                                Top Products by Variants
                                            </CardTitle>
                                            <CardDescription>Products with the most variant options available</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <Bar data={{
                                                labels: topVariantLabels,
                                                datasets: [{
                                                    label: 'Variants',
                                                    data: topVariantValues,
                                                    backgroundColor: 'rgba(6, 182, 212, 0.8)',
                                                    borderColor: '#06b6d4',
                                                    borderWidth: 1,
                                                    borderRadius: 4
                                                }]
                                            }} options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                indexAxis: 'y' as const,
                                                plugins: { legend: { display: false } },
                                                scales: {
                                                    x: {
                                                        ticks: { precision: 0 },
                                                        grid: { color: '#f1f5f9' }
                                                    },
                                                    y: { grid: { display: false } }
                                                },
                                                ...baseAnim
                                            }} height={320} />
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Variant Analysis Row */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <Card className="hover:shadow-lg transition-shadow">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <div className="bg-rose-100 p-2 rounded-lg">
                                                    <PieChart className="h-5 w-5 text-rose-600" />
                                                </div>
                                                Variant Colors Distribution
                                            </CardTitle>
                                            <CardDescription>Most popular color options across all variants</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <Doughnut data={{
                                                labels: colorLabels,
                                                datasets: [{
                                                    data: colorValues,
                                                    backgroundColor: [
                                                        '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#06b6d4',
                                                        '#f97316', '#84cc16', '#06b6d4', '#8b5cf6', '#ec4899', '#14b8a6'
                                                    ],
                                                    borderWidth: 0,
                                                    spacing: 1
                                                }]
                                            }} options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: {
                                                        position: 'right',
                                                        labels: { usePointStyle: true, padding: 10 }
                                                    }
                                                },
                                                cutout: '45%',
                                                ...baseAnim
                                            }} height={300} />
                                        </CardContent>
                                    </Card>

                                    <Card className="hover:shadow-lg transition-shadow">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <div className="bg-emerald-100 p-2 rounded-lg">
                                                    <BarChart3 className="h-5 w-5 text-emerald-600" />
                                                </div>
                                                Price Range Analysis
                                            </CardTitle>
                                            <CardDescription>Product count distribution across price ranges</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <Bar data={{
                                                labels: bucketLabels,
                                                datasets: [{
                                                    label: 'Products',
                                                    data: bucketCounts,
                                                    backgroundColor: [
                                                        'rgba(16, 185, 129, 0.8)',
                                                        'rgba(59, 130, 246, 0.8)',
                                                        'rgba(245, 158, 11, 0.8)',
                                                        'rgba(239, 68, 68, 0.8)',
                                                        'rgba(139, 92, 246, 0.8)'
                                                    ],
                                                    borderColor: [
                                                        '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'
                                                    ],
                                                    borderWidth: 1,
                                                    borderRadius: 6
                                                }]
                                            }} options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: { legend: { display: false } },
                                                scales: {
                                                    y: {
                                                        ticks: { precision: 0 },
                                                        grid: { color: '#f1f5f9' }
                                                    },
                                                    x: { grid: { display: false } }
                                                },
                                                ...baseAnim
                                            }} height={300} />
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>

                            {/* Metrics & Stats Section */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="bg-emerald-500 p-2 rounded-lg">
                                        <BarChart3 className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-foreground">Metrics & Stats</h2>
                                        <p className="text-muted-foreground">Key performance indicators and detailed analytics</p>
                                    </div>
                                </div>

                                {/* Enhanced Metrics Cards */}
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                    <Card className="p-4 hover:shadow-lg transition-shadow">
                                        <div className="flex flex-col space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-medium text-muted-foreground">Total Variants</span>
                                                <Zap className="h-3 w-3 text-amber-500" />
                                            </div>
                                            <div className="text-xl font-bold">
                                                <CountUp end={totalVariants} duration={2} />
                                            </div>
                                            <Progress value={75} className="h-1" />
                                        </div>
                                    </Card>

                                    <Card className="p-4 hover:shadow-lg transition-shadow">
                                        <div className="flex flex-col space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-medium text-muted-foreground">Out of Stock</span>
                                                <Package className="h-3 w-3 text-red-500" />
                                            </div>
                                            <div className="text-xl font-bold text-red-600">
                                                <CountUp end={outOfStock} duration={2} />
                                            </div>
                                            <Progress value={outOfStock > 0 ? (outOfStock / totalVariants) * 100 : 0} className="h-1" />
                                        </div>
                                    </Card>

                                    <Card className="p-4 hover:shadow-lg transition-shadow">
                                        <div className="flex flex-col space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-medium text-muted-foreground">Min Price</span>
                                                <TrendingDown className="h-3 w-3 text-green-500" />
                                            </div>
                                            <div className="text-xl font-bold">
                                                ₹<CountUp end={Math.round(minPrice)} duration={2} separator="," />
                                            </div>
                                        </div>
                                    </Card>

                                    <Card className="p-4 hover:shadow-lg transition-shadow">
                                        <div className="flex flex-col space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-medium text-muted-foreground">Max Price</span>
                                                <TrendingUp className="h-3 w-3 text-blue-500" />
                                            </div>
                                            <div className="text-xl font-bold">
                                                ₹<CountUp end={Math.round(maxPrice)} duration={2} separator="," />
                                            </div>
                                        </div>
                                    </Card>

                                    <Card className="p-4 hover:shadow-lg transition-shadow">
                                        <div className="flex flex-col space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-medium text-muted-foreground">Categories</span>
                                                <Package className="h-3 w-3 text-purple-500" />
                                            </div>
                                            <div className="text-xl font-bold">
                                                <CountUp end={categories.length} duration={2} />
                                            </div>
                                        </div>
                                    </Card>

                                    <Card className="p-4 hover:shadow-lg transition-shadow">
                                        <div className="flex flex-col space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-medium text-muted-foreground">Avg Variants</span>
                                                <Activity className="h-3 w-3 text-indigo-500" />
                                            </div>
                                            <div className="text-xl font-bold">
                                                <CountUp end={Math.round(totalVariants / Math.max(totalProducts, 1))} duration={2} />
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            </div>

                            {/* New Enhanced Charts Section */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-2 rounded-lg">
                                        <Activity className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-foreground">Advanced Analytics</h2>
                                        <p className="text-muted-foreground">Enhanced insights with modern chart components</p>
                                    </div>
                                </div>

                                {/* Transform data for the new charts */}
                                {(() => {

                                    const barData = transformPricesToBarChart(products);
                                    const lineData = transformVendorsToLineChart(products);
                                    const barTrend = calculateTrend(barData);
                                    const lineTrend = calculateTrend(lineData);

                                    return (
                                        <div className="space-y-6">
                                            {/* Row 1: Area Chart with Hardcoded Data */}
                                            <div className="grid grid-cols-1 gap-6">
                                                <AreaChartStacked
                                                    data={[
                                                        { period: "January", desktop: 186, mobile: 80 },
                                                        { period: "February", desktop: 305, mobile: 200 },
                                                        { period: "March", desktop: 237, mobile: 120 },
                                                        { period: "April", desktop: 73, mobile: 190 },
                                                        { period: "May", desktop: 209, mobile: 130 },
                                                        { period: "June", desktop: 214, mobile: 140 },
                                                    ]}
                                                    title="Product Creation Trends"
                                                    description="Total vs Active products created over time"
                                                    trend={{ value: 5.2, period: "month" }}
                                                    config={{
                                                        desktop: {
                                                            label: "Total Products",
                                                            color: "#8B5CF6", // purple-500
                                                        },
                                                        mobile: {
                                                            label: "Active Products",
                                                            color: "#3B82F6", // blue-500
                                                        },
                                                    }}
                                                />
                                            </div>

                                            {/* Row 2: New Charts - Pie, Radar, Radial */}
                                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                                <PieChartLabel
                                                    data={[
                                                        { category: "Electronics", value: 275, fill: "#8B5CF6" }, // purple-500
                                                        { category: "Clothing", value: 200, fill: "#3B82F6" }, // blue-500
                                                        { category: "Books", value: 187, fill: "#A855F7" }, // purple-600
                                                        { category: "Home", value: 173, fill: "#1D4ED8" }, // blue-700
                                                        { category: "Other", value: 90, fill: "#C084FC" }, // purple-400
                                                    ]}
                                                    title="Product Categories"
                                                    description="Distribution by category"
                                                    trend={{ value: 3.1, period: "month" }}
                                                    config={{
                                                        value: {
                                                            label: "Products",
                                                        },
                                                        electronics: {
                                                            label: "Electronics",
                                                            color: "#8B5CF6",
                                                        },
                                                        clothing: {
                                                            label: "Clothing",
                                                            color: "#3B82F6",
                                                        },
                                                        books: {
                                                            label: "Books",
                                                            color: "#A855F7",
                                                        },
                                                        home: {
                                                            label: "Home",
                                                            color: "#1D4ED8",
                                                        },
                                                        other: {
                                                            label: "Other",
                                                            color: "#C084FC",
                                                        },
                                                    }}
                                                />

                                                <RadarChartMultiple
                                                    data={[
                                                        { category: "Quality", desktop: 186, mobile: 180 },
                                                        { category: "Price", desktop: 305, mobile: 200 },
                                                        { category: "Support", desktop: 237, mobile: 120 },
                                                        { category: "Features", desktop: 173, mobile: 190 },
                                                        { category: "Usability", desktop: 209, mobile: 130 },
                                                        { category: "Design", desktop: 214, mobile: 140 },
                                                    ]}
                                                    title="Performance Metrics"
                                                    description="Multi-dimensional analysis"
                                                    trend={{ value: 2.8, period: "quarter" }}
                                                    config={{
                                                        desktop: {
                                                            label: "Desktop Performance",
                                                            color: "#8B5CF6", // purple-500
                                                        },
                                                        mobile: {
                                                            label: "Mobile Performance",
                                                            color: "#3B82F6", // blue-500
                                                        },
                                                    }}
                                                />

                                                <RadialChartStacked
                                                    data={[
                                                        { period: "current", desktop: 1260, mobile: 570 }
                                                    ]}
                                                    title="Current Performance"
                                                    description="Desktop vs Mobile usage"
                                                    trend={{ value: 4.5, period: "month" }}
                                                    config={{
                                                        desktop: {
                                                            label: "Desktop Users",
                                                            color: "#7C3AED", // purple-600
                                                        },
                                                        mobile: {
                                                            label: "Mobile Users",
                                                            color: "#2563EB", // blue-600
                                                        },
                                                    }}
                                                />
                                            </div>

                                            {/* Row 3: Bar and Line Charts */}
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                <BarChartMultiple
                                                    data={barData}
                                                    title="Price Range Distribution"
                                                    description="Product availability across price ranges"
                                                    trend={{ value: barTrend, period: "month" }}
                                                    config={{
                                                        desktop: {
                                                            label: "Total Variants",
                                                            color: "#A855F7", // purple-600
                                                        },
                                                        mobile: {
                                                            label: "In Stock",
                                                            color: "#1D4ED8", // blue-700
                                                        },
                                                    }}
                                                />

                                                <LineChartMultiple
                                                    data={lineData}
                                                    title="Top Vendor Performance"
                                                    description="Product launches by leading vendors"
                                                    trend={{ value: lineTrend, period: "month" }}
                                                    config={{
                                                        desktop: {
                                                            label: lineData.length > 0 ? "Top Vendor" : "Vendor A",
                                                            color: "#C084FC", // purple-400
                                                        },
                                                        mobile: {
                                                            label: lineData.length > 0 ? "Second Vendor" : "Vendor B",
                                                            color: "#2563EB", // blue-600
                                                        },
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Webhook Activity Section */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-2 rounded-lg">
                                        <Zap className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-foreground">Webhook Activity</h2>
                                        <p className="text-muted-foreground">Real-time Shopify webhook events and data updates</p>
                                    </div>
                                </div>

                                <WebhookActivity />
                            </div>

                        </TabsContent>

                        <TabsContent value="products" className="space-y-6">
                            <div className="grid grid-cols-1 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Package className="h-5 w-5" />
                                            Product Categories
                                        </CardTitle>
                                        <CardDescription>Breakdown of products by category</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {categories.map((category, index) => {
                                                const categoryProducts = products.filter(p => (p.product_type || "Uncategorized") === category);
                                                const percentage = Math.round((categoryProducts.length / totalProducts) * 100);
                                                return (
                                                    <div key={category} className="flex items-center justify-between p-4 border rounded-lg">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: [chartColors.blue, chartColors.violet, chartColors.emerald, chartColors.amber, chartColors.rose][index % 5] }}></div>
                                                            <div>
                                                                <p className="font-medium">{category}</p>
                                                                <p className="text-sm text-muted-foreground">{categoryProducts.length} products</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <Progress
                                                                value={percentage}
                                                                className="w-20 h-2"
                                                            />
                                                            <Badge variant="outline">
                                                                {percentage}%
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="performance" className="space-y-6">
                            <div className="grid grid-cols-1 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Activity className="h-5 w-5" />
                                            Performance Metrics
                                        </CardTitle>
                                        <CardDescription>Key performance indicators for your store</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium">Active Products Rate</span>
                                                    <Badge variant="secondary">{Math.round((activeProducts / Math.max(totalProducts, 1)) * 100)}%</Badge>
                                                </div>
                                                <Progress value={(activeProducts / Math.max(totalProducts, 1)) * 100} className="h-2" />
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium">Inventory Health</span>
                                                    <Badge variant="secondary">{Math.round(((totalVariants - outOfStock) / Math.max(totalVariants, 1)) * 100)}%</Badge>
                                                </div>
                                                <Progress value={((totalVariants - outOfStock) / Math.max(totalVariants, 1)) * 100} className="h-2" />
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium">Vendor Diversity</span>
                                                    <Badge variant="secondary">{Math.round((uniqueVendors / Math.max(totalProducts, 1)) * 100)}%</Badge>
                                                </div>
                                                <Progress value={(uniqueVendors / Math.max(totalProducts, 1)) * 100} className="h-2" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="vendors" className="space-y-6">
                            <div className="grid grid-cols-1 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Users className="h-5 w-5" />
                                            Vendor Analytics
                                        </CardTitle>
                                        <CardDescription>Detailed breakdown of vendor performance</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {vendorLabels.slice(0, 5).map((vendor, index) => (
                                                <div key={vendor} className="flex items-center justify-between p-4 border rounded-lg">
                                                    <div className="flex items-center space-x-3">
                                                        <Avatar>
                                                            <AvatarFallback>{vendor.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-medium">{vendor}</p>
                                                            <p className="text-sm text-muted-foreground">{vendorValues[index]} products</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Progress
                                                            value={(vendorValues[index] / Math.max(...vendorValues)) * 100}
                                                            className="w-20 h-2"
                                                        />
                                                        <Badge variant="outline">
                                                            {Math.round((vendorValues[index] / totalProducts) * 100)}%
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="customers" className="space-y-6">
                            <div>
                                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <h3 className="text-lg font-semibold text-blue-900">✅ Customers Tab Active</h3>
                                    <p className="text-blue-700">Current tab: {activeTab} | Loading customers data...</p>
                                </div>
                                <CustomersList />
                            </div>
                        </TabsContent>

                        <TabsContent value="orders" className="space-y-6">
                            <div>
                                <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                    <h3 className="text-lg font-semibold text-purple-900">✅ Orders Tab Active</h3>
                                    <p className="text-purple-700">Current tab: {activeTab} | Loading orders data...</p>
                                </div>
                                <OrdersList />
                            </div>
                        </TabsContent>
                    </Tabs>
                </motion.div>
            </div>
        </div>
    );
}