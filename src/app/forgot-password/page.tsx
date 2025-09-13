"use client";
import Link from "next/link";
import { useState } from "react";
import { toast } from "react-hot-toast";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok) {
                setSubmitted(true);
                toast.success("Password reset instructions sent!");
            } else {
                toast.error(data.error || "Failed to send reset email");
            }
        } catch (error) {
            console.error("Forgot password error:", error);
            toast.error("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    }

    if (submitted) {
        return (
            <div className="relative isolate overflow-hidden min-h-dvh bg-gradient-to-br from-violet-50 via-blue-50 to-indigo-100 text-black">
                {/* Enhanced gradient accents */}
                <div className="pointer-events-none absolute inset-0 -z-10">
                    <div className="absolute right-1/4 top-10 h-72 w-72 rounded-full bg-gradient-to-r from-blue-400/20 to-violet-400/20 blur-3xl animate-pulse" />
                    <div className="absolute left-1/4 bottom-10 h-72 w-72 rounded-full bg-gradient-to-r from-violet-400/20 to-purple-400/20 blur-3xl animate-pulse delay-1000" />
                    <div className="absolute right-1/2 top-1/2 h-96 w-96 rounded-full bg-gradient-to-r from-indigo-300/10 to-blue-300/10 blur-3xl animate-pulse delay-500" />
                </div>

                <div className="mx-auto flex min-h-dvh max-w-md items-center justify-center px-4 py-10">
                    <div className="w-full rounded-3xl border-2 border-white/50 bg-white/90 backdrop-blur-xl p-8 shadow-2xl">
                        <div className="text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg">
                                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
                                Check Your Email
                            </h1>
                            <p className="text-neutral-600 mb-6 leading-relaxed">
                                We've sent password reset instructions to <strong>{email}</strong>
                            </p>

                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-left">
                                <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Next Steps:
                                </h3>
                                <ul className="text-sm text-blue-800 space-y-1">
                                    <li>• Check your email inbox (including spam folder)</li>
                                    <li>• Click the reset link in the email</li>
                                    <li>• The link expires in 1 hour for security</li>
                                </ul>
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={() => {
                                        setSubmitted(false);
                                        setEmail("");
                                    }}
                                    className="w-full rounded-xl border-2 border-violet-200 bg-violet-50 px-4 py-3 text-violet-700 font-medium transition-all duration-200 hover:bg-violet-100 hover:border-violet-300"
                                >
                                    Send to Different Email
                                </button>

                                <Link
                                    href="/login"
                                    className="block w-full rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-3 text-center text-white font-medium shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
                                >
                                    Back to Login
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative isolate overflow-hidden min-h-dvh bg-gradient-to-br from-violet-50 via-blue-50 to-indigo-100 text-black">
            {/* Enhanced gradient accents */}
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute right-1/4 top-10 h-72 w-72 rounded-full bg-gradient-to-r from-blue-400/20 to-violet-400/20 blur-3xl animate-pulse" />
                <div className="absolute left-1/4 bottom-10 h-72 w-72 rounded-full bg-gradient-to-r from-violet-400/20 to-purple-400/20 blur-3xl animate-pulse delay-1000" />
                <div className="absolute right-1/2 top-1/2 h-96 w-96 rounded-full bg-gradient-to-r from-indigo-300/10 to-blue-300/10 blur-3xl animate-pulse delay-500" />
            </div>

            <div className="mx-auto flex min-h-dvh max-w-md items-center justify-center px-4 py-10">
                <div className="w-full rounded-3xl border-2 border-white/50 bg-white/90 backdrop-blur-xl p-8 shadow-2xl transition-all duration-700 hover:shadow-xl">
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-lg transform transition-all duration-300 hover:scale-110 hover:rotate-3">
                            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                            Forgot Password?
                        </h1>
                        <p className="mt-2 text-base text-neutral-600">
                            No worries! Enter your email and we'll send you reset instructions.
                        </p>
                    </div>

                    <form onSubmit={onSubmit} className="space-y-6">
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

                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-4 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-violet-500/30 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-700 to-purple-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-disabled:opacity-0" />
                            <span className="relative z-10 flex items-center gap-2">
                                {loading ? (
                                    <>
                                        <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Sending Instructions...
                                    </>
                                ) : (
                                    <>
                                        <svg className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        Send Reset Instructions
                                    </>
                                )}
                            </span>
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-neutral-600">
                            Remember your password?{" "}
                            <Link
                                href="/login"
                                className="font-semibold text-violet-600 hover:text-violet-700 transition-all duration-200 hover:underline underline-offset-4 decoration-2 decoration-violet-600/30"
                            >
                                Back to Login
                            </Link>
                        </p>
                        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-neutral-500">
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Reset link expires in 1 hour for security
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
