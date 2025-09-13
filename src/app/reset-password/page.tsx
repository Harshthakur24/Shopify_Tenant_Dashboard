"use client";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";

function ResetPasswordForm() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [tokenValidation, setTokenValidation] = useState<{
        isValid: boolean;
        isLoading: boolean;
        email?: string;
        error?: string;
    }>({ isValid: false, isLoading: true });

    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    useEffect(() => {
        async function validateToken() {
            if (!token) {
                setTokenValidation({
                    isValid: false,
                    isLoading: false,
                    error: "No reset token provided"
                });
                return;
            }

            try {
                const res = await fetch(`/api/auth/reset-password?token=${token}`);
                const data = await res.json();

                if (res.ok && data.valid) {
                    setTokenValidation({
                        isValid: true,
                        isLoading: false,
                        email: data.email
                    });
                } else {
                    setTokenValidation({
                        isValid: false,
                        isLoading: false,
                        error: data.error || "Invalid reset token"
                    });
                }
            } catch (error) {
                console.error("Token validation error:", error);
                setTokenValidation({
                    isValid: false,
                    isLoading: false,
                    error: "Failed to validate reset token"
                });
            }
        }

        validateToken();
    }, [token]);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (password.length < 8) {
            toast.error("Password must be at least 8 characters long");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Password reset successfully!");
                router.push("/login");
            } else {
                toast.error(data.error || "Failed to reset password");
            }
        } catch (error) {
            console.error("Reset password error:", error);
            toast.error("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    }

    if (tokenValidation.isLoading) {
        return (
            <div className="relative isolate overflow-hidden min-h-dvh bg-gradient-to-br from-violet-50 via-blue-50 to-indigo-100 text-black">
                <div className="mx-auto flex min-h-dvh max-w-md items-center justify-center px-4 py-10">
                    <div className="w-full rounded-3xl border-2 border-white/50 bg-white/90 backdrop-blur-xl p-8 shadow-2xl text-center">
                        <div className="animate-spin mx-auto mb-4 h-8 w-8 border-4 border-violet-200 border-t-violet-600 rounded-full"></div>
                        <p className="text-neutral-600">Validating reset token...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!tokenValidation.isValid) {
        return (
            <div className="relative isolate overflow-hidden min-h-dvh bg-gradient-to-br from-violet-50 via-blue-50 to-indigo-100 text-black">
                <div className="mx-auto flex min-h-dvh max-w-md items-center justify-center px-4 py-10">
                    <div className="w-full rounded-3xl border-2 border-white/50 bg-white/90 backdrop-blur-xl p-8 shadow-2xl text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg">
                            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Reset Link</h1>
                        <p className="text-neutral-600 mb-6">{tokenValidation.error}</p>
                        <div className="space-y-4">
                            <Link
                                href="/forgot-password"
                                className="block w-full rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-3 text-center text-white font-medium shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
                            >
                                Request New Reset Link
                            </Link>
                            <Link
                                href="/login"
                                className="block w-full rounded-xl border-2 border-violet-200 bg-violet-50 px-4 py-3 text-center text-violet-700 font-medium transition-all duration-200 hover:bg-violet-100 hover:border-violet-300"
                            >
                                Back to Login
                            </Link>
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
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                            Reset Password
                        </h1>
                        <p className="mt-2 text-base text-neutral-600">
                            Enter your new password for {tokenValidation.email}
                        </p>
                    </div>

                    <form onSubmit={onSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-semibold text-neutral-800 flex items-center gap-2">
                                <svg className="h-4 w-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                New Password
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
                            {password && password.length < 8 && (
                                <p className="text-xs text-red-600 flex items-center gap-1">
                                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Password must be at least 8 characters long
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="text-sm font-semibold text-neutral-800 flex items-center gap-2">
                                <svg className="h-4 w-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Confirm New Password
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
                            {confirmPassword && password === confirmPassword && password.length >= 8 && (
                                <p className="text-xs text-green-600 flex items-center gap-1">
                                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Passwords match
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading || password !== confirmPassword || password.length < 8}
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
                                        Resetting Password...
                                    </>
                                ) : (
                                    <>
                                        <svg className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Reset Password
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
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-violet-50 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl border border-white/20 p-8">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto mb-4"></div>
                            <p className="text-neutral-600">Loading...</p>
                        </div>
                    </div>
                </div>
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    );
}
