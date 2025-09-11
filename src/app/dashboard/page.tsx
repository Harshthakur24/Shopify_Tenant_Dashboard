'use client'
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2, Package } from "lucide-react";

type ShopifyVariant = {
    id: number | string;
    title: string;
    price: string;
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

    useEffect(() => {
        const fetchProducts = async (): Promise<void> => {
            try {
                const res = await fetch('/api/shopify/products');
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json = await res.json();
                setProducts(Array.isArray(json?.products) ? json.products : []);
            } catch (e) {
                setError(`Failed to load products: ${String((e as Error).message ?? e)}`);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

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
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search products..."
                                    className="w-full rounded-xl border border-blue-100/50 bg-white/80 px-4 py-2.5 text-sm shadow-sm backdrop-blur-lg transition placeholder:text-neutral-400 hover:border-blue-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 sm:w-64"
                                />
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="rounded-xl border border-blue-100/50 bg-white/80 px-4 py-2.5 text-sm shadow-sm backdrop-blur-lg transition hover:border-blue-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                >
                                    <option value="all">All categories</option>
                                    {categories.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                                <select
                                    value={sort}
                                    onChange={(e) => setSort(e.target.value)}
                                    className="rounded-xl border border-blue-100/50 bg-white/80 px-4 py-2.5 text-sm shadow-sm backdrop-blur-lg transition hover:border-blue-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                >
                                    <option value="recent">Sort: Recent</option>
                                    <option value="price-asc">Price: Low → High</option>
                                    <option value="price-desc">Price: High → Low</option>
                                </select>
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
                                    className="prose prose-sm mt-2 max-w-none text-neutral-600 line-clamp-3"
                                    dangerouslySetInnerHTML={{ __html: product.body_html || '' }}
                                />

                                {product.options && product.options.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {product.options.flatMap((opt) =>
                                            (opt.values || []).map((val, idx) => (
                                                <span key={`${String(opt.id)}-${idx}`} className="inline-flex items-center rounded-md bg-blue-100/50 px-2 py-1 text-xs font-medium text-blue-700 backdrop-blur-lg">
                                                    {val}
                                                </span>
                                            ))
                                        )}
                                    </div>
                                )}

                                <div className="mt-4 rounded-lg border border-neutral-200/50 bg-white/50">
                                    {(product.variants || []).map((variant) => (
                                        <div key={variant.id} className="flex items-center justify-between px-3 py-2 first:rounded-t-lg last:rounded-b-lg last:border-0 border-b border-neutral-200">
                                            <span className="text-sm text-neutral-700">{variant.title}</span>
                                            <span className="text-sm font-semibold text-blue-600">₹{Number(variant.price).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>

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
            </div>
        </div>
    );
}