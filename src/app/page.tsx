"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { TypeAnimation } from "react-type-animation";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import { ArrowRight } from "lucide-react";



export default function Home() {
  const featuresRef = useRef<HTMLDivElement | null>(null);
  const heroImage = "/globe.svg";
  const dessertImage = "/window.svg";
  const healthyImage = "/vercel.svg";
  return (
    <div className="min-h-dvh bg-white text-neutral-900">
      {/* Top navbar with auto-hide */}
      <AutoHideNavbar />
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
            <h1 className="mt-6 text-7xl font-bold tracking-tight sm:text-7xl [text-wrap:balance]">
              <span className="block">Build <span className="text-blue-600">better</span></span>
              <span className="block">decisions with</span>
              <span className="block">
                <span className="ml-2 inline-block bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 bg-clip-text text-transparent [animation:gradient_123_infinite_4s_ease-in-out_infinite]">
                  <TypeAnimation
                    sequence={[
                      "Smart Store",
                      2000,
                      "Dashboard",
                      2000,
                      "Analytics",
                      2000,
                      "Metrics",
                      2000,
                    ]}
                    speed={40}
                    repeat={Infinity}
                  />
                </span>
              </span>
            </h1>

            <style jsx>{`
              @keyframes gradient_123_infinite {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
              }
            `}</style>
            <p className="mt-6 text-lg leading-relaxed text-neutral-600 [text-wrap:balance]">
              Ingest customers, orders, and products from Shopify. Visualize KPIs, trends, and top customers with a beautiful, mobile-first dashboard.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/dashboard"
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-blue-600 px-6 py-3.5 font-semibold text-white shadow-md transition-all hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-neutral-900"
              >
                <button className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-full hover:scale-105 hover:shadow-lg duration-300 hover:pointer-cursor" />
                <span className="relative flex items-center gap-2 rounded-full">
                  Go to Dashboard
                  <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
              <Link
                href="/login"
                className="group inline-flex items-center justify-center rounded-full border border-neutral-200 bg-white px-6 py-3.5 font-semibold text-neutral-900 transition-all hover:bg-neutral-50 hover:shadow-lg hover:cursor-pointer"
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


        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-white to-gray-50" id="features">
        <div>
          {[
            {
              title: "One‑click Shopify onboarding",
              description:
                "Connect your store with an Admin API token. We immediately fetch products, orders and customers so you can start analyzing within minutes.",
              image: heroImage,
              reverse: false,
            },
            {
              title: "Reliable data sync",
              description:
                "Background jobs and webhook hooks keep your catalog and order data up‑to‑date while respecting Shopify rate limits.",
              image: dessertImage,
              reverse: true,
            },
            {
              title: "Beautiful, actionable analytics",
              description:
                "Understand revenue, AOV, top products and repeat customers with a responsive, mobile‑first dashboard.",
              image: healthyImage,
              reverse: false,
            },
            {
              title: "Multi‑tenant and production‑ready",
              description:
                "Tenant isolation, JWT auth and Prisma/Postgres built‑in, so you can safely host multiple stores from a single instance.",
              image: healthyImage,
              reverse: true,
            },
          ].map((section, index) => (
            <motion.section
              key={index}
              ref={featuresRef}
              className={`py-24 px-6 lg:px-12 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className={`max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center ${section.reverse ? "md:flex-row-reverse" : ""
                  }`}
              >
                <div className={section.reverse ? "md:order-2" : ""}>
                  <motion.h2
                    className="text-4xl md:text-5xl font-bold mb-6 leading-tight tracking-tight"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {section.title}
                  </motion.h2>
                  <motion.p
                    className="text-neutral-600 mb-8 text-lg leading-relaxed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {section.description}
                  </motion.p>
                  <motion.button
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="group inline-flex items-center space-x-3 bg-blue-600 px-6 py-5 rounded-full text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 hover:shadow-lg hover:scale-105 duration-300 hover:pointer-cursor"
                  >
                    <span>Connect your store</span>
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </motion.button>
                </div>
                <motion.div
                  className={`relative ${section.reverse ? "md:order-1" : ""}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="relative h-[600px] overflow-hidden rounded-2xl shadow-2xl">
                    <Image
                      src={section.image}
                      alt={section.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                      className="object-cover transform transition-transform duration-700 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  </div>
                </motion.div>
              </div>
            </motion.section>
          ))}
        </div>
      </section>

      {/* Statistics Section */}
      <section className="bg-black text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { number: 1000, label: "Active Users", suffix: "+" },
              { number: 5000, label: "Recipes", suffix: "+" },
              { number: 100, label: "Expert Chefs", suffix: "+" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-5xl font-bold mb-2">
                  <CountUp
                    start={0}
                    end={stat.number}
                    duration={2}
                    suffix={stat.suffix}
                    enableScrollSpy
                  />
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Preview analytics */}
      {/* <section className="px-4 pb-16">
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
      </section> */}

      {/* Feature grid */}
      {/* <section className="px-4 pb-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard title="Multi-tenant" desc="Strict tenant isolation with scoped IDs and JWT auth." />
            <FeatureCard title="Prisma + Postgres" desc="Typed models and safe multi-tenant queries." />
            <FeatureCard title="Shopify APIs" desc="Sync products, orders, customers; webhook-ready." />
            <FeatureCard title="Charts" desc="Trends & KPIs with beautiful, responsive charts." />
          </div>
        </div>
      </section> */}
      <Footer />
    </div>
  );
}

function AutoHideNavbar() {
  const [hidden, setHidden] = useState(false);
  const [drawer, setDrawer] = useState(false);
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (y > last && y > 80) setHidden(true);
      else setHidden(false);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <>
      <div className={`fixed inset-x-0 top-0 z-40 transition-transform duration-300 ${hidden ? "-translate-y-full" : "translate-y-0"}`}>
        <div className="mx-auto max-w-7xl px-4">
          <div className="mt-4 rounded-2xl bg-white/70 px-4 py-3 shadow-lg ring-1 ring-blue-100/60 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button aria-label="Open menu" onClick={() => setDrawer(true)} className="rounded-xl border border-blue-200/60 bg-white/70 p-2 text-blue-700 shadow-sm transition hover:border-blue-300 hover:bg-white">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
                </button>
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-blue-600 to-indigo-600 text-white">P</span>
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-lg font-bold tracking-tight text-transparent">Producti</span>
                </div>
              </div>
              <nav className="hidden items-center gap-1 sm:flex">
                <a href="#features" className="rounded-full px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100">Features</a>
                <a href="#pricing" className="rounded-full px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100">Pricing</a>
                <a href="/dashboard" className="rounded-full px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100">Dashboard</a>
              </nav>
              <div className="hidden items-center gap-2 sm:flex">
                <a href="/login" className="rounded-full px-3 py-1.5 text-sm font-semibold text-blue-700 hover:bg-blue-50">Login</a>
                <a href="/signup" className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md">Get started</a>
              </div>
            </div>
            <div className="mt-2 h-px w-full bg-gradient-to-r from-transparent via-blue-200/60 to-transparent" />
          </div>
        </div>
      </div>
      <div className={`fixed inset-0 z-50 ${drawer ? "" : "pointer-events-none"}`}>
        <div className={`absolute inset-0 bg-black/30 backdrop-blur-[2px] transition-opacity ${drawer ? "opacity-100" : "opacity-0"}`} onClick={() => setDrawer(false)} />
        <div className={`absolute left-0 top-0 h-full w-72 transform bg-white shadow-2xl transition-transform duration-300 ${drawer ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex items-center justify-between border-b px-4 py-4">
            <span className="text-sm font-semibold">Menu</span>
            <button onClick={() => setDrawer(false)} aria-label="Close" className="rounded-md p-1 hover:bg-neutral-100">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <nav className="p-4">
            <a href="#features" className="block rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">Features</a>
            <a href="#pricing" className="mt-1 block rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">Pricing</a>
            <a href="/login" className="mt-1 block rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700">Login</a>
          </nav>
        </div>
      </div>
    </>
  );
}


function Footer() {
  return (
    <footer className="bg-neutral-950 text-neutral-300">
      <div className="border-y border-neutral-800 bg-gradient-to-r from-blue-600/10 via-transparent to-indigo-600/10">
        <div className="mx-auto max-w-7xl px-6 py-10 flex flex-col items-center justify-between gap-4 md:flex-row">
          <h3 className="text-center text-2xl font-semibold tracking-tight text-white md:text-left">
            Ready to build smarter decisions?
          </h3>
          <div className="flex items-center gap-3">
            <Link
              href="/signup"
              className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
            >
              Get started
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full border border-neutral-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-900"
            >
              View demo
            </Link>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-5">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-blue-600 to-indigo-600 text-white">P</span>
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-lg font-bold tracking-tight text-transparent">Producti</span>
            </div>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-neutral-400">
              Ingest Shopify data and turn it into actionable insights with a modern, mobile‑first dashboard.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-neutral-800 p-2 text-neutral-400 transition hover:border-neutral-700 hover:bg-neutral-900 hover:text-white"
                aria-label="Twitter"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M22 5.8c-.7.3-1.4.5-2.2.6.8-.5 1.3-1.1 1.6-2-.8.5-1.6.8-2.6 1-1.5-1.6-4-1.1-5.1.9-.5 1-.4 2.1 0 3.1-3.2-.2-6-1.7-7.9-4.1-1.1 2 .1 4.3 2.1 5-.6 0-1.2-.2-1.7-.5 0 2.1 1.5 3.8 3.5 4.2-.4.1-.8.1-1.2 0 .3 1.8 2 3.1 3.9 3.1-1.6 1.3-3.6 1.9-5.6 1.7 2 1.3 4.3 2 6.7 2 8 0 12.5-6.8 12.2-12.9.8-.6 1.4-1.2 1.9-2z" />
                </svg>
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-neutral-800 p-2 text-neutral-400 transition hover:border-neutral-700 hover:bg-neutral-900 hover:text-white"
                aria-label="GitHub"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.5 2 2 6.6 2 12.3c0 4.5 2.9 8.3 6.9 9.6.5.1.7-.2.7-.5v-1.9c-2.8.6-3.4-1.2-3.4-1.2-.5-1.2-1.2-1.5-1.2-1.5-1-.7.1-.7.1-.7 1.1.1 1.7 1.2 1.7 1.2 1 .1.7 1.9 2.6 1.4.1-.8.4-1.3.8-1.6-2.3-.3-4.7-1.2-4.7-5.2 0-1.1.4-2 1.1-2.8-.1-.3-.5-1.4.1-2.9 0 0 .9-.3 2.9 1.1.9-.3 1.8-.4 2.8-.4s1.9.1 2.8.4c2-1.4 2.9-1.1 2.9-1.1.6 1.5.2 2.6.1 2.9.7.8 1.1 1.7 1.1 2.8 0 4-2.4 4.9-4.7 5.2.4.3.8 1 .8 2.1v3.1c0 .3.2.6.7.5 4-1.3 6.9-5.2 6.9-9.6C22 6.6 17.5 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
              <a
                href="mailto:hello@example.com"
                className="rounded-full border border-neutral-800 p-2 text-neutral-400 transition hover:border-neutral-700 hover:bg-neutral-900 hover:text-white"
                aria-label="Email"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M2 6.5A2.5 2.5 0 0 1 4.5 4h15A2.5 2.5 0 0 1 22 6.5v11A2.5 2.5 0 0 1 19.5 20h-15A2.5 2.5 0 0 1 2 17.5v-11Zm2.1-.5a.4.4 0 0 0-.1.3v.2l7.5 5.2 7.5-5.2v-.2a.4.4 0 0 0-.1-.3.5.5 0 0 0-.3-.1h-14a.5.5 0 0 0-.3.1ZM20 8.9l-6.9 4.8a1.5 1.5 0 0 1-1.7 0L4.5 8.9V17c0 .3.2.5.5.5h14c.3 0 .5-.2.5-.5V8.9Z" />
                </svg>
              </a>
            </div>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold tracking-wide text-white">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#features" className="text-neutral-400 transition hover:text-white">Features</a></li>
              <li><a href="/dashboard" className="text-neutral-400 transition hover:text-white">Dashboard</a></li>
              <li><a href="#pricing" className="text-neutral-400 transition hover:text-white">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold tracking-wide text-white">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-neutral-400 transition hover:text-white">Documentation</a></li>
              <li><a href="#" className="text-neutral-400 transition hover:text-white">Support</a></li>
              <li><a href="#" className="text-neutral-400 transition hover:text-white">Status</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold tracking-wide text-white">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-neutral-400 transition hover:text-white">About</a></li>
              <li><a href="#" className="text-neutral-400 transition hover:text-white">Careers</a></li>
              <li><a href="#" className="text-neutral-400 transition hover:text-white">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-neutral-800 pt-6 text-sm text-neutral-500 sm:flex-row">
          <p>© {new Date().getFullYear()} Producti. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="transition hover:text-white">Privacy</a>
            <a href="#" className="transition hover:text-white">Terms</a>
            <a href="#" className="transition hover:text-white">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
}


