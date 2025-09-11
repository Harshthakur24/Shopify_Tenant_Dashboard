"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";


function useTypewriter(words: string[], speed = 60, pause = 1000) {
  const [index, setIndex] = useState(0);
  const [sub, setSub] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  useEffect(() => {
    const word = words[index % words.length];
    const done = dir === 1 ? sub >= word.length : sub <= 0;
    const timeout = setTimeout(() => {
      if (done) {
        if (dir === 1) {
          setDir(-1);
          setTimeout(() => setSub((s) => s - 1), pause);
        } else {
          setDir(1);
          setIndex((i) => i + 1);
          setSub(0);
        }
      } else {
        setSub((s) => s + dir);
      }
    }, dir === 1 ? speed : speed / 2);
    return () => clearTimeout(timeout);
  }, [words, index, sub, dir, speed, pause]);
  return words[index % words.length].slice(0, sub);
}

export default function Home() {
  const typed = useTypewriter([
    "Multi-tenant",
    "Real-time",
    "Production-ready",
    "Insightful",
  ]);



  return (
    <div className="min-h-dvh bg-white text-neutral-900">
      {/* Hero */}
      <section className="relative isolate overflow-hidden px-4 py-24 sm:py-28">
        {/* Subtle blue background accents */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute right-1/4 top-10 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute left-1/4 bottom-10 h-40 w-40 rounded-full bg-blue-400/10 blur-3xl" />
        </div>
        {/* Black grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="mx-auto max-w-7xl">
          <div className="relative mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
              </span>
              Shopify Data Ingestion & Insights
            </span>
            <h1 className="mt-6 text-5xl font-bold tracking-tight sm:text-6xl [text-wrap:balance]">
              Build <span className="text-blue-600">better</span> decisions with
              <span className="ml-2 inline-block bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 bg-clip-text text-transparent animate-gradient">{typed}</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-neutral-600 [text-wrap:balance]">
              Ingest customers, orders, and products from Shopify. Visualize KPIs, trends, and top customers with a beautiful, mobile-first dashboard.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/dashboard"
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-blue-600 px-6 py-3.5 font-semibold text-white shadow-md transition-all hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-neutral-900"
              >
                <span className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700" />
                <span className="relative flex items-center gap-2">
                  Go to Dashboard
                  <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
              <Link
                href="/login"
                className="group inline-flex items-center justify-center rounded-lg border border-neutral-200 bg-white px-6 py-3.5 font-semibold text-neutral-900 transition-all hover:bg-neutral-50 hover:shadow-lg"
              >
                <span className="relative flex items-center gap-2">
                  Login
                  <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            </div>
          </div>

          {/* Inline quick login */}
          <div className="mt-8 flex justify-center">
            <InlineLogin />
          </div>
        </div>
      </section>

      {/* Preview analytics */}
      <section className="px-4 pb-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard title="Customers" value="1,248" />
            <KpiCard title="Products" value="432" />
            <KpiCard title="Orders" value="2,945" />
            <KpiCard title="Revenue" value="₹12.4L" highlight />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="relative overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 p-6 text-white lg:col-span-2">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">Orders & Revenue</h2>
                <span className="rounded-full bg-blue-600/20 px-2.5 py-0.5 text-xs font-medium text-blue-300">Feature Preview</span>
              </div>
              <div className="mt-2 flex h-[300px] items-center justify-center rounded-lg bg-black/60 text-sm text-neutral-300">
                Charts will render here
              </div>
            </div>

            <div className="relative overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 p-6 text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">Top Customers</h2>
                <span className="rounded-full bg-blue-600/20 px-2.5 py-0.5 text-xs font-medium text-blue-300">Feature Preview</span>
              </div>
              <div className="mt-2 flex h-[300px] items-center justify-center rounded-lg bg-black/60 text-sm text-neutral-300">
                Bar charts will render here
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="px-4 pb-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard title="Multi-tenant" desc="Strict tenant isolation with scoped IDs and JWT auth." />
            <FeatureCard title="Prisma + Postgres" desc="Typed models and safe multi-tenant queries." />
            <FeatureCard title="Shopify APIs" desc="Sync products, orders, customers; webhook-ready." />
            <FeatureCard title="Charts" desc="Trends & KPIs with beautiful, responsive charts." />
          </div>
        </div>
      </section>
    </div>
  );
}

function KpiCard({ title, value, highlight = false }: { title: string; value: string; highlight?: boolean }) {
  return (
    <div
      className={`group relative overflow-hidden rounded-xl border p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg
        ${highlight
          ? "border-emerald-200/50 bg-emerald-50/30 dark:border-emerald-800/30 dark:bg-emerald-900/20"
          : "border-neutral-200/50 bg-white/30 dark:border-neutral-800/30 dark:bg-neutral-900/30"
        } backdrop-blur-md`}
    >
      {/* Gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-white/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:from-transparent dark:via-white/5 dark:to-white/10" />

      {/* Glow effect */}
      <div className={`absolute -inset-px rounded-xl bg-gradient-to-br opacity-0 blur-sm transition-all duration-500 group-hover:opacity-100
        ${highlight ? "from-emerald-400/20 via-emerald-500/10 to-blue-500/20" : "from-blue-400/10 via-purple-500/10 to-emerald-500/10"}`}
      />

      {/* Content */}
      <div className="relative">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium uppercase tracking-wider text-neutral-600 dark:text-neutral-400">{title}</p>
          <div className="h-px flex-1 bg-neutral-200/50 dark:bg-neutral-700/50" />
        </div>
        <p className="mt-3 text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

function FeatureCard({ title, desc }: { title: string; desc: string }) {
  // Get icon based on title
  const getIcon = (title: string) => {
    switch (title) {
      case "Multi-tenant":
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case "Prisma + Postgres":
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
          </svg>
        );
      case "Shopify APIs":
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case "Charts":
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-xl border border-neutral-200/50 bg-white/30 p-6 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg dark:border-neutral-800/30 dark:bg-neutral-900/30">
      {/* Gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-white/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:from-transparent dark:via-white/5 dark:to-white/10" />

      {/* Glow effect */}
      <div className="absolute -inset-px rounded-xl bg-gradient-to-br from-blue-400/10 via-purple-500/10 to-emerald-500/10 opacity-0 blur-sm transition-all duration-500 group-hover:opacity-100" />

      {/* Content */}
      <div className="relative">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100/50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            {getIcon(title)}
          </div>
          <p className="font-semibold text-neutral-900 dark:text-white">{title}</p>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">{desc}</p>
      </div>
    </div>
  );
}

function InlineLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    setLoading(false);
    if (res.ok) {
      window.location.href = "/dashboard";
    } else {
      const data = await res.json().catch(() => ({ error: "An unexpected error occurred" } as { error: string }));
      setError(data.error || "Login failed");
    }
  }

  return (
    <div className="mt-12 max-w-md rounded-xl border border-neutral-200/50 bg-white/30 p-6 backdrop-blur-md transition-all duration-300 hover:shadow-lg dark:border-neutral-800/30 dark:bg-neutral-900/30">
      {/* Gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-white/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:from-transparent dark:via-white/5 dark:to-white/10" />

      <div className="relative">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100/50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Quick Login</h3>
        </div>

        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Email
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@store.com"
                required
                className="w-full rounded-lg border border-neutral-200 bg-white pl-10 pr-4 py-2.5 text-sm transition-colors placeholder:text-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:placeholder:text-neutral-600"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-lg border border-neutral-200 bg-white pl-10 pr-4 py-2.5 text-sm transition-colors placeholder:text-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:placeholder:text-neutral-600"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group relative mt-2 inline-flex items-center justify-center overflow-hidden rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-neutral-900"
          >
            <span className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700" />
            <span className="relative flex items-center gap-2">
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </span>
          </button>

          <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
            New here?{" "}
            <Link href="/login" className="font-medium text-blue-600 transition-colors hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
              Register on the dashboard
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
