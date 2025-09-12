"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        setLoading(false);
        if (res.ok) {
            toast.success("Signed in successfully");
            router.push("/dashboard");
        } else {
            const data = await res
                .json()
                .catch(() => ({ error: "An unexpected error occurred" } as { error: string }));
            const reason = data.error || "Login failed";
            setError(reason);
            toast.error(reason);
        }
    }

    return (
        <div className="relative isolate overflow-hidden min-h-dvh bg-[#fafafa] text-black">
            {/* Gradient accents */}
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute right-1/4 top-10 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />
                <div className="absolute left-1/4 bottom-10 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl" />
            </div>
            {/* Subtle grid overlay */}
            <div
                className="pointer-events-none absolute inset-0 -z-10 opacity-10"
                style={{
                    backgroundImage:
                        "linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                }}
            />
            <div className="mx-auto flex min-h-dvh max-w-md items-center justify-center px-4 py-10">
                <div className="w-full rounded-2xl border border-neutral-200 bg-white p-6 shadow-lg">
                    <div className="mb-6 text-center">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-violet-600 text-white">
                            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-violet-600">Welcome back</h1>
                        <p className="mt-1 text-sm text-neutral-800">Sign in to continue to your dashboard</p>
                    </div>

                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label htmlFor="email" className="text-sm font-medium text-neutral-900">Email</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="you@store.com"
                                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm placeholder:text-neutral-500 focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600"
                            />
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="password" className="text-sm font-medium text-neutral-900">Password</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm placeholder:text-neutral-500 focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600"
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

                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex w-full items-center justify-center rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-700 disabled:opacity-50"
                        >
                            {loading ? (
                                <span className="inline-flex items-center gap-2">
                                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Signing in...
                                </span>
                            ) : (
                                "Sign in"
                            )}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-neutral-600">
                        New here? <Link href="/signup" className="font-medium text-violet-600 hover:text-violet-700">Create an account</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}


