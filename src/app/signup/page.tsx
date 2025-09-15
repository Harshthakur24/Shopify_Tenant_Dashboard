"use client";
import Link from "next/link";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function SignupPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [tenantName, setTenantName] = useState("");
    const [shopDomain, setShopDomain] = useState("");
    const [accessToken, setAccessToken] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isFormFocused, setIsFormFocused] = useState(false);
    const router = useRouter();

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        // Validate password confirmation
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, tenantName, shopDomain, accessToken: accessToken || undefined }),
        });
        setLoading(false);
        if (res.ok) {
            toast.success("You've been registered");
            setTimeout(() => {
                router.push("/dashboard");
            }, 2500);
        } else {
            const data = await res
                .json()
                .catch(() => ({ error: "Registration failed" } as { error: string }));
            const reason = data.error || "Registration failed";
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
            <div className="mx-auto flex min-h-dvh max-w-lg items-center justify-center px-4 py-10">
                <div className={`w-full rounded-3xl border-2 border-white/50 bg-white/90 backdrop-blur-xl p-8 shadow-2xl transition-all duration-700 ${isFormFocused ? 'scale-105 shadow-violet-500/25' : 'hover:shadow-xl'}`}>
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-lg transform transition-all duration-300 hover:scale-110 hover:rotate-3">
                            <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">Create your account</h1>
                        <p className="mt-2 text-base text-neutral-600">Set up your workspace to get started</p>
                    </div>

                    <form onSubmit={onSubmit} className="space-y-6" onFocus={() => setIsFormFocused(true)} onBlur={() => setIsFormFocused(false)}>
                        <div className="space-y-2">
                            <label htmlFor="tenantName" className="text-sm font-semibold text-neutral-800 flex items-center gap-2">
                                <svg className="h-4 w-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                Workspace Name
                            </label>
                            <div className="relative group">
                                <input
                                    id="tenantName"
                                    value={tenantName}
                                    onChange={(e) => setTenantName(e.target.value)}
                                    required
                                    placeholder="Acme Robotics"
                                    className="w-full rounded-xl border-2 border-neutral-200 bg-white px-4 py-3.5 text-sm placeholder:text-neutral-400 transition-all duration-300 focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-500/20 group-hover:border-violet-300"
                                />
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-600/5 to-purple-600/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="shopDomain" className="text-sm font-semibold text-neutral-800 flex items-center gap-2">
                                <svg className="h-4 w-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                                </svg>
                                Shop Domain
                            </label>
                            <div className="relative group">
                                <input
                                    id="shopDomain"
                                    value={shopDomain}
                                    onChange={(e) => setShopDomain(e.target.value)}
                                    required
                                    placeholder="store.myshopify.com"
                                    className="w-full rounded-xl border-2 border-neutral-200 bg-white px-4 py-3.5 text-sm placeholder:text-neutral-400 transition-all duration-300 focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-500/20 group-hover:border-violet-300"
                                />
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-600/5 to-purple-600/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label htmlFor="accessToken" className="text-sm font-semibold text-neutral-800 flex items-center gap-2">
                                    <svg className="h-4 w-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                    </svg>
                                    Shopify Access Token
                                </label>
                                <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-1 rounded-full">required</span>
                            </div>
                            <div className="relative group">
                                <input
                                    id="accessToken"
                                    value={accessToken}
                                    onChange={(e) => setAccessToken(e.target.value)}
                                    placeholder="shpat_... (Admin API access token)"
                                    required
                                    className="w-full rounded-xl border-2 border-neutral-200 bg-white px-4 py-3.5 text-sm placeholder:text-neutral-400 transition-all duration-300 focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-500/20 group-hover:border-violet-300"
                                />
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-600/5 to-purple-600/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
                            </div>
                            <p className="text-xs text-neutral-600 flex items-center gap-1">
                                <svg className="h-3 w-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Used to fetch your store&#39;s data via Shopify Admin API.
                            </p>
                        </div>

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
                            <label htmlFor="password" className="text-sm font-semibold text-neutral-800 flex items-center gap-2">
                                <svg className="h-4 w-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Password
                            </label>
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

                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="text-sm font-semibold text-neutral-800 flex items-center gap-2">
                                <svg className="h-4 w-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Confirm Password
                            </label>
                            <div className="relative group">
                                <input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className={`w-full rounded-xl border-2 bg-white px-4 py-3.5 pr-12 text-sm placeholder:text-neutral-400 transition-all duration-300 focus:outline-none focus:ring-4 group-hover:border-violet-300 ${confirmPassword && password !== confirmPassword
                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                                        : confirmPassword && password === confirmPassword
                                            ? 'border-green-300 focus:border-green-500 focus:ring-green-500/20'
                                            : 'border-neutral-200 focus:border-violet-500 focus:ring-violet-500/20'
                                        }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-neutral-400 transition-all duration-200 hover:bg-violet-100 hover:text-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                                >
                                    {showConfirmPassword ? (
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
                            {confirmPassword && password !== confirmPassword && (
                                <p className="text-xs text-red-600 flex items-center gap-1">
                                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Passwords do not match
                                </p>
                            )}
                            {confirmPassword && password === confirmPassword && (
                                <p className="text-xs text-green-600 flex items-center gap-1">
                                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Passwords match
                                </p>
                            )}
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

                        {success && (
                            <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700 animate-in slide-in-from-top-2 duration-300">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-emerald-500" viewBox="0 0 24 24" fill="none">
                                        <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <p className="font-medium">{success}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || (!!confirmPassword && password !== confirmPassword)}
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
                                        Creating Account...
                                    </>
                                ) : (
                                    <>
                                        <svg className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                        </svg>
                                        Create Account
                                    </>
                                )}
                            </span>
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-neutral-600">
                            Already have an account?{" "}
                            <Link
                                href="/login"
                                className="font-semibold text-violet-600 hover:text-violet-700 transition-all duration-200 hover:underline underline-offset-4 decoration-2 decoration-violet-600/30"
                            >
                                Sign in
                            </Link>
                        </p>
                        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-neutral-500">
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            Secure registration with encrypted data storage
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


