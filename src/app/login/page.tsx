"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
// Using inline SVG icons instead of heroicons

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isFormFocused, setIsFormFocused] = useState(false);
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
            toast.success("Logged in successfully");
            router.push("/dashboard");
            window.location.href = "https://xeno-assignment-by-harsh.vercel.app/dashboard";


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
        <div className="relative isolate overflow-hidden min-h-dvh bg-gradient-to-br from-violet-50 via-blue-50 to-indigo-100 text-black">
            {/* Enhanced gradient accents */}
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute right-1/4 top-10 h-72 w-72 rounded-full bg-gradient-to-r from-blue-400/20 to-violet-400/20 blur-3xl animate-pulse" />
                <div className="absolute left-1/4 bottom-10 h-72 w-72 rounded-full bg-gradient-to-r from-violet-400/20 to-purple-400/20 blur-3xl animate-pulse delay-1000" />
                <div className="absolute right-1/2 top-1/2 h-96 w-96 rounded-full bg-gradient-to-r from-indigo-300/10 to-blue-300/10 blur-3xl animate-pulse delay-500" />
            </div>
            {/* Animated grid overlay */}
            <div
                className="pointer-events-none absolute inset-0 -z-10 opacity-[0.02] animate-pulse"
                style={{
                    backgroundImage:
                        "linear-gradient(to right, #4f46e5 1px, transparent 1px), linear-gradient(to bottom, #4f46e5 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                }}
            />
            <div className="mx-auto flex min-h-dvh max-w-md items-center justify-center px-4 py-10">
                <div className={`w-full rounded-3xl border-2 border-white/50 bg-white/90 backdrop-blur-xl p-8 shadow-2xl transition-all duration-700 ${isFormFocused ? 'scale-105 shadow-violet-500/25' : 'hover:shadow-xl'}`}>
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-lg transform transition-all duration-300 hover:scale-110 hover:rotate-3">
                            <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">Welcome back</h1>
                        <p className="mt-2 text-base text-neutral-600">Log in to continue to your dashboard</p>
                    </div>

                    <form onSubmit={onSubmit} className="space-y-6" onFocus={() => setIsFormFocused(true)} onBlur={() => setIsFormFocused(false)}>
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-semibold text-neutral-800 flex items-center gap-2">
                                <svg className="h-4 w-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                </svg>
                                Email Address
                            </label>
                            <div className="relative group">
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="you@store.com"
                                    className="w-full rounded-xl border-2 border-neutral-200 bg-white px-4 py-3.5 text-sm placeholder:text-neutral-400 transition-all duration-300 focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-500/20 group-hover:border-violet-300"
                                />
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-600/5 to-purple-600/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="text-sm font-semibold text-neutral-800 flex items-center gap-2">
                                    <svg className="h-4 w-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    Password
                                </label>
                                <Link
                                    href="/forgot-password"
                                    className="text-xs font-medium text-violet-600 hover:text-violet-700 transition-all duration-200 hover:underline underline-offset-2"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative group">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className="w-full rounded-xl border-2 border-neutral-200 bg-white px-4 py-3.5 pr-12 text-sm placeholder:text-neutral-400 transition-all duration-300 focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-500/20 group-hover:border-violet-300"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-neutral-400 transition-all duration-200 hover:bg-violet-100 hover:text-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                                >
                                    {showPassword ? (
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-600/5 to-purple-600/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 animate-in slide-in-from-top-2 duration-300">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-500" viewBox="0 0 24 24" fill="none">
                                        <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <p className="font-medium">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-4 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:cursor-pointer focus:outline-none focus:ring-4 focus:ring-violet-500/30 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-700 to-purple-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-disabled:opacity-0" />
                            <span className="relative z-10 flex items-center gap-2">
                                {loading ? (
                                    <>
                                        <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Logging in...
                                    </>
                                ) : (
                                    <>
                                        <svg className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                        </svg>
                                        Log in to Dashboard
                                    </>
                                )}
                            </span>
                        </button>
                    </form>



                    <div className="mt-8 text-center">
                        <p className="text-sm text-neutral-600">
                            New here?{" "}
                            <Link
                                href="/signup"
                                className="font-semibold text-violet-600 hover:text-violet-700 transition-all duration-200 hover:underline underline-offset-4 decoration-2 decoration-violet-600/30"
                            >
                                Create an account
                            </Link>
                        </p>
                        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-neutral-500">
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Secure login with end-to-end encryption
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


