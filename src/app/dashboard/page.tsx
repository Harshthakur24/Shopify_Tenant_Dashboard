'use client'
import React, { useEffect, useState } from "react";
import Image from "next/image";
// import Link from "next/link";
import { CheckCircle2, Loader2, Package, Search, ChevronDown } from "lucide-react";
import { Bar, Pie, Line, Doughnut } from "react-chartjs-2";
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
    Title
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend, Title);

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
    const [category, setCategory] = useState<string>("all");
    const [sort, setSort] = useState<string>("recent");
    const [fallbackToast, setFallbackToast] = useState<string | null>(null);
    const [descExpanded, setDescExpanded] = useState<Record<string, boolean>>({});
    const [colorsVisible, setColorsVisible] = useState<Record<string, boolean>>({});
    const [variantsExpanded, setVariantsExpanded] = useState<Record<string, boolean>>({});
    // Navbar removed per request

    useEffect(() => {
        const fetchProducts = async (): Promise<void> => {
            try {
                const res = await fetch('/api/shopify/products');
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
        fetchProducts();
    }, []);

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

    const colorPie = {
        labels: colorLabels,
        datasets: [
            {
                data: colorValues,
                backgroundColor: colorLabels.map((_, i) => [chartColors.blue, chartColors.violet, chartColors.emerald, chartColors.amber, chartColors.rose, chartColors.blueLight][i % 6]),
            },
        ],
    };

    const createdLine = {
        labels: dayLabels,
        datasets: [
            {
                label: "Products Created",
                data: dayValues,
                borderColor: chartColors.violet,
                backgroundColor: chartColors.violet,
                tension: 0.3,
                fill: false,
            },
        ],
    };

    const vendorDoughnut = {
        labels: vendorLabels,
        datasets: [
            {
                data: vendorValues,
                backgroundColor: vendorLabels.map((_, i) => [chartColors.emerald, chartColors.blue, chartColors.violet, chartColors.amber, chartColors.rose, chartColors.blueLight][i % 6]),
            },
        ],
    };

    const topVariantsBar = {
        labels: topVariantLabels,
        datasets: [
            {
                label: 'Variants',
                data: topVariantValues,
                backgroundColor: chartColors.emerald,
                borderRadius: 8,
            }
        ]
    };

    const filtered = products
        .filter(p => p.title.toLowerCase().includes(search.toLowerCase()))
        .filter(p => category === "all" ? true : (p.product_type || "Uncategorized") === category)
        .sort((a, b) => {
            if (sort === "price-asc") return Number(a.variants?.[0]?.price || 0) - Number(b.variants?.[0]?.price || 0);
            if (sort === "price-desc") return Number(b.variants?.[0]?.price || 0) - Number(a.variants?.[0]?.price || 0);
            return 0;
        });

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-6 sm:p-8">
            {/* Navbar removed for dashboard */}
            {fallbackToast && (
                <div className="fixed left-1/2 top-10 z-50 w-[600px] max-w-[95vw] -translate-x-1/2 animate-[fadeIn_.2s_ease-out]">
                    <div className="flex items-start gap-4 rounded-2xl border border-emerald-300 bg-emerald-50/95 p-5 text-emerald-900 shadow-2xl backdrop-blur-sm">
                        <CheckCircle2 className="mt-0.5 h-6 w-6 text-emerald-600" />
                        <div className="text-base leading-6 font-medium">{fallbackToast}</div>
                    </div>
                    <style jsx>{`
                        @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
                    `}</style>
                </div>
            )}
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute right-1/3 top-10 h-72 w-72 rounded-full bg-blue-500/10 blur-[100px]" />
                <div className="absolute left-1/4 bottom-10 h-72 w-72 rounded-full bg-blue-400/10 blur-[100px]" />
                <div className="absolute right-1/4 bottom-1/3 h-60 w-60 rounded-full bg-indigo-500/10 blur-[80px]" />
            </div>
            <div className="mx-auto max-w-7xl">
                <header className="mb-6">
                    <div className="rounded-2xl border border-blue-100/50 bg-white/80 p-6 shadow-lg backdrop-blur-xl">
                        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                            <div>
                                <h1 className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
                                    Shopify Store Dashboard
                                </h1>
                                <div className="mt-3 flex flex-wrap gap-3">
                                    <div className="rounded-lg bg-blue-50 px-3 py-1">
                                        <span className="text-xs font-medium text-blue-600">Total Products</span>
                                        <p className="text-lg font-semibold text-blue-700">{totalProducts}</p>
                                    </div>
                                    <div className="rounded-lg bg-green-50 px-3 py-1">
                                        <span className="text-xs font-medium text-green-600">Active Products</span>
                                        <p className="text-lg font-semibold text-green-700">{activeProducts}</p>
                                    </div>
                                    <div className="rounded-lg bg-purple-50 px-3 py-1">
                                        <span className="text-xs font-medium text-purple-600">Vendors</span>
                                        <p className="text-lg font-semibold text-purple-700">{uniqueVendors}</p>
                                    </div>
                                    <div className="rounded-lg bg-indigo-50 px-3 py-1">
                                        <span className="text-xs font-medium text-indigo-600">Average Price</span>
                                        <p className="text-lg font-semibold text-indigo-700">₹{Math.round(avgPrice).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                                {/* Search */}
                                <div className="relative sm:w-64">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                    <input
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search products..."
                                        className="w-full rounded-xl border border-neutral-200 bg-white pl-9 pr-4 py-2.5 text-sm text-neutral-900 shadow-sm transition placeholder:text-neutral-500 hover:border-neutral-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                    />
                                </div>
                                {/* Category */}
                                <div className="relative">
                                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="appearance-none rounded-xl border border-neutral-200 bg-white px-4 pr-9 py-2.5 text-sm text-neutral-900 shadow-sm transition hover:border-neutral-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                    >
                                        <option value="all">All categories</option>
                                        {categories.map((c) => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                                {/* Sort */}
                                <div className="relative">
                                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                    <select
                                        value={sort}
                                        onChange={(e) => setSort(e.target.value)}
                                        className="appearance-none rounded-xl border border-neutral-200 bg-white px-4 pr-9 py-2.5 text-sm text-neutral-900 shadow-sm transition hover:border-neutral-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                    >
                                        <option value="recent">Sort: Recent</option>
                                        <option value="price-asc">Price: Low → High</option>
                                        <option value="price-desc">Price: High → Low</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((product) => (
                        <article key={product.id} className="group overflow-hidden rounded-2xl border border-blue-100/50 bg-white/80 shadow-lg transition duration-300 hover:scale-[1.02] hover:shadow-xl hover:bg-white/90">
                            <div className="relative h-64 w-full bg-neutral-100">
                                {product.image?.src ? (
                                    <Image
                                        src={product.image.src}
                                        alt={product.image.alt || product.title}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        className="object-cover transition duration-300 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-neutral-400">
                                        <Package className="h-8 w-8" />
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
                                        <div key={variant.id} className={`flex items-center justify-between px-3 py-2 ${idx === 0 ? 'first:rounded-t-lg' : ''} ${idx === arr.length - 1 && (!variantsExpanded[String(product.id)] || (product.variants || []).length === arr.length) ? 'last:rounded-b-lg last:border-0' : ''} border-b border-neutral-200`}>
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
                                        <button
                                            className="rounded-xl border border-blue-200 bg-white/80 px-4 py-2 text-sm font-medium text-blue-600 shadow-sm backdrop-blur-lg transition hover:border-blue-300 hover:bg-white hover:translate-y-[-1px] hover:shadow-md active:translate-y-[1px]"
                                        >
                                            Manage Stock
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                </section>
                {filtered.length === 0 && (
                    <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-blue-100/50 bg-white/80 p-8 text-center backdrop-blur-xl">
                        <Package className="h-12 w-12 text-blue-200" />
                        <h3 className="mt-4 text-lg font-semibold text-neutral-900">No products found</h3>
                        <p className="mt-1 text-sm text-neutral-600">Try adjusting your search or filters</p>
                    </div>
                )}

                {/* Analytics Section */}
                <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="rounded-2xl border border-blue-100/50 bg-white/80 p-6 shadow-lg backdrop-blur-xl">
                        <h3 className="mb-4 text-base font-semibold text-neutral-900">Price distribution</h3>
                        <Bar data={priceBar} options={{ responsive: true, scales: { y: { ticks: { precision: 0 } } }, plugins: { legend: { display: false } }, ...baseAnim }} />
                    </div>
                    <div className="rounded-2xl border border-blue-100/50 bg-white/80 p-6 shadow-lg backdrop-blur-xl">
                        <h3 className="mb-4 text-base font-semibold text-neutral-900">Variant colors (top 12)</h3>
                        <Pie data={colorPie} options={{ responsive: true, plugins: { legend: { position: 'bottom' } }, ...baseAnim }} />
                    </div>
                    <div className="rounded-2xl border border-blue-100/50 bg-white/80 p-6 shadow-lg backdrop-blur-xl">
                        <h3 className="mb-4 text-base font-semibold text-neutral-900">Products created by day</h3>
                        <Line data={createdLine} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { ticks: { precision: 0 } } }, ...baseAnim }} />
                    </div>
                </div>

                {/* KPIs */}
                <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-5">
                    <div className="rounded-xl border border-blue-100/50 bg-white/80 p-4 text-center">
                        <div className="text-xs font-medium text-neutral-500">Products</div>
                        <div className="text-2xl font-bold text-blue-600">{totalProducts}</div>
                    </div>
                    <div className="rounded-xl border border-green-100/50 bg-white/80 p-4 text-center">
                        <div className="text-xs font-medium text-neutral-500">Active</div>
                        <div className="text-2xl font-bold text-green-600">{activeProducts}</div>
                    </div>
                    <div className="rounded-xl border border-purple-100/50 bg-white/80 p-4 text-center">
                        <div className="text-xs font-medium text-neutral-500">Vendors</div>
                        <div className="text-2xl font-bold text-purple-600">{uniqueVendors}</div>
                    </div>
                    <div className="rounded-xl border border-indigo-100/50 bg-white/80 p-4 text-center">
                        <div className="text-xs font-medium text-neutral-500">Avg price</div>
                        <div className="text-2xl font-bold text-indigo-600">₹{Math.round(avgPrice).toLocaleString()}</div>
                    </div>
                    <div className="rounded-xl border border-amber-100/50 bg-white/80 p-4 text-center">
                        <div className="text-xs font-medium text-neutral-500">Total variants</div>
                        <div className="text-2xl font-bold text-amber-600">{totalVariants}</div>
                    </div>
                    <div className="rounded-xl border border-rose-100/50 bg-white/80 p-4 text-center">
                        <div className="text-xs font-medium text-neutral-500">Out of stock</div>
                        <div className="text-2xl font-bold text-rose-600">{outOfStock}</div>
                    </div>
                    <div className="rounded-xl border border-neutral-100/50 bg-white/80 p-4 text-center">
                        <div className="text-xs font-medium text-neutral-500">Min price</div>
                        <div className="text-2xl font-bold text-neutral-700">₹{Math.round(minPrice).toLocaleString()}</div>
                    </div>
                    <div className="rounded-xl border border-neutral-100/50 bg-white/80 p-4 text-center">
                        <div className="text-xs font-medium text-neutral-500">Max price</div>
                        <div className="text-2xl font-bold text-neutral-700">₹{Math.round(maxPrice).toLocaleString()}</div>
                    </div>
                </div>

                {/* Vendor share and Top products */}
                <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="rounded-2xl border border-blue-100/50 bg-white/80 p-6 shadow-lg backdrop-blur-xl">
                        <h3 className="mb-4 text-base font-semibold text-neutral-900">Vendor share</h3>
                        <Doughnut data={vendorDoughnut} options={{ responsive: true, plugins: { legend: { position: 'bottom' } }, cutout: '60%', ...baseAnim }} />
                    </div>
                    <div className="rounded-2xl border border-blue-100/50 bg-white/80 p-6 shadow-lg backdrop-blur-xl">
                        <h3 className="mb-4 text-base font-semibold text-neutral-900">Top products by variants</h3>
                        <Bar data={topVariantsBar} options={{ responsive: true, indexAxis: 'y' as const, plugins: { legend: { display: false } }, scales: { x: { ticks: { precision: 0 } } }, ...baseAnim }} />
                    </div>
                </div>
            </div>
        </div>
    );
}