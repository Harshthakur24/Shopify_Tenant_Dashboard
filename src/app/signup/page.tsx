"use client";
import Link from "next/link";
import { useState } from "react";

export default function SignupPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [tenantName, setTenantName] = useState("");
    const [shopDomain, setShopDomain] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);
        const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, tenantName, shopDomain }),
        });
        setLoading(false);
        if (res.ok) {
            setSuccess("Account created! You can now sign in.");
        } else {
            const data = await res
                .json()
                .catch(() => ({ error: "Registration failed" } as { error: string }));
            setError(data.error || "Registration failed");
        }
    }

    return (
        <div className="min-h-dvh bg-[#fafafa]">
            <div className="mx-auto flex min-h-dvh max-w-md items-center justify-center px-4 py-10">
                <div className="w-full rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <div className="mb-6 text-center">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-violet-600 text-white">
                            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <h1 className="text-xl font-semibold">Create your account</h1>
                        <p className="mt-1 text-sm text-neutral-500">Set up your workspace to get started</p>
                    </div>

                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label htmlFor="tenantName" className="text-sm font-medium text-neutral-700">Workspace name</label>
                            <input
                                id="tenantName"
                                value={tenantName}
                                onChange={(e) => setTenantName(e.target.value)}
                                required
                                placeholder="Acme Robotics"
                                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm placeholder:text-neutral-400 focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600"
                            />
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="shopDomain" className="text-sm font-medium text-neutral-700">Shop domain</label>
                            <input
                                id="shopDomain"
                                value={shopDomain}
                                onChange={(e) => setShopDomain(e.target.value)}
                                required
                                placeholder="store.myshopify.com"
                                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm placeholder:text-neutral-400 focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600"
                            />
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="email" className="text-sm font-medium text-neutral-700">Email</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="you@store.com"
                                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm placeholder:text-neutral-400 focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600"
                            />
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="password" className="text-sm font-medium text-neutral-700">Password</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm placeholder:text-neutral-400 focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600"
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <p>{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                                    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <p>{success}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex w-full items-center justify-center rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-700 disabled:opacity-50"
                        >
                            {loading ? "Creating..." : "Create account"}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-neutral-600">
                        Already have an account? <Link href="/login" className="font-medium text-violet-600 hover:text-violet-700">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}


