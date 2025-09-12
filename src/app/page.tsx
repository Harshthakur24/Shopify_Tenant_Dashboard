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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const heroImage = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80";
  const dashboardImage = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80";
  const analyticsImage = "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=1200&q=80";
  const teamImage = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80";
  return (
    <div className="min-h-dvh bg-white text-neutral-900 relative">
      {/* Global Grid Background */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(0,0,0,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.15) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          backgroundPosition: "0 0, 0 0",
        }}
      />
      {/* Top navbar with auto-hide */}
      <AutoHideNavbar />
      {/* Hero */}
      <section className="relative isolate overflow-hidden px-4 py-24 sm:py-32 z-10">
        {/* Hero Background Image */}
        <div className="absolute inset-0 -z-20">
          <Image
            src={heroImage}
            alt="Analytics Dashboard Background"
            fill
            className="object-cover opacity-[0.05]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-white via-white/95 to-blue-50/80" />
        </div>

        {/* Floating Elements */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <motion.div
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, 0]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute right-1/4 top-20 h-32 w-32 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 blur-xl"
          />
          <motion.div
            animate={{
              y: [0, 15, 0],
              rotate: [0, -3, 0]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
            className="absolute left-1/4 bottom-20 h-40 w-40 rounded-full bg-gradient-to-br from-purple-500/15 to-pink-500/15 blur-2xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
            className="absolute top-1/4 right-1/3 h-24 w-24 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 blur-lg"
          />
        </div>

        <div className="mx-auto max-w-7xl">
          <div className="relative mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
              </span>
              Shopify Data Ingestion & Insights
            </span>
            <h1 className="mt-6 text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1] [text-wrap:balance]">
              <span className="block">Transform Your <span className="text-blue-600">Shopify</span></span>
              <span className="block">Store with <span className="text-blue-600 bg-clip-text [animation:gradient_123_infinite_4s_ease-in-out_infinite]">
                <TypeAnimation
                  sequence={[
                    "Smart Analytics",
                    2000,
                    "Real-time Data",
                    2000,
                    "Smart Metrics",
                    2000,
                    "Stasistics",
                    2000,
                  ]}
                  speed={40}
                  repeat={Infinity}
                />
              </span></span>
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
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-blue-600 px-6 py-5 font-semibold text-white shadow-md transition-all hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-neutral-900"
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
                className="group inline-flex items-center justify-center rounded-full border border-neutral-200 bg-white px-6 py-5 font-semibold text-neutral-900 transition-all hover:bg-neutral-50 hover:shadow-lg hover:cursor-pointer"
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

      <section className="py-20 bg-gradient-to-b from-white to-gray-50 relative z-10" id="features">
        <div>
          {[
            {
              title: "One‑click Shopify onboarding",
              description:
                "Connect your store with an Admin API token. We immediately fetch products, orders and customers so you can start analyzing within minutes.",
              image: dashboardImage,
              reverse: false,
            },
            {
              title: "Reliable data sync",
              description:
                "Background jobs and webhook hooks keep your catalog and order data up‑to‑date while respecting Shopify rate limits.",
              image: analyticsImage,
              reverse: true,
            },
            {
              title: "Beautiful, actionable analytics",
              description:
                "Understand revenue, AOV, top products and repeat customers with a responsive, mobile‑first dashboard.",
              image: heroImage,
              reverse: false,
            },
            {
              title: "Multi‑tenant and production‑ready",
              description:
                "Tenant isolation, JWT auth and Prisma/Postgres built‑in, so you can safely host multiple stores from a single instance.",
              image: teamImage,
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
      <section className="bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white py-24 relative overflow-hidden z-10">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='53' cy='7' r='1'/%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3Ccircle cx='7' cy='53' r='1'/%3E%3Ccircle cx='53' cy='53' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Trusted by Growing Businesses
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Join thousands of merchants who use our platform to make data-driven decisions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { number: 2500, label: "Active Stores", suffix: "+" },
              { number: 1200000, label: "Products Synced", suffix: "+" },
              { number: 850000, label: "Orders Tracked", suffix: "+" },
              { number: 99.9, label: "Uptime", suffix: "%" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-all duration-300"
              >
                <div className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-br from-white to-gray-300 bg-clip-text text-transparent">
                  {isMounted ? (
                    <CountUp
                      start={0}
                      end={stat.number}
                      duration={2.5}
                      suffix={stat.suffix}
                      enableScrollSpy
                      separator=","
                    />
                  ) : (
                    <span>{stat.number.toLocaleString()}{stat.suffix}</span>
                  )}
                </div>
                <div className="text-gray-300 font-medium text-lg">{stat.label}</div>
                <div className="mt-4 h-1 w-16 mx-auto bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              What Our Customers Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Don&apos;t just take our word for it - see what store owners have to say about our platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Chen",
                role: "Founder, TechStyle Co.",
                avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&crop=faces&w=100&h=100&q=80",
                content: "This platform transformed how we understand our customers. The insights helped us increase revenue by 40% in just 3 months.",
                rating: 5
              },
              {
                name: "Marcus Johnson",
                role: "E-commerce Manager, Urban Threads",
                avatar: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&crop=faces&w=100&h=100&q=80",
                content: "The real-time sync and beautiful analytics dashboard made data-driven decisions effortless. Best investment we've made.",
                rating: 5
              },
              {
                name: "Emily Rodriguez",
                role: "CEO, Artisan Crafts",
                avatar: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&crop=faces&w=100&h=100&q=80",
                content: "Setup was incredibly simple, and within minutes we had all our Shopify data beautifully visualized. The team loves it!",
                rating: 5
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed italic">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
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

      {/* Final CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 relative overflow-hidden z-10">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Ready to Transform Your
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Shopify Analytics?
              </span>
            </h2>
            <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join over 2,500+ successful store owners who are making smarter decisions with our powerful analytics platform.
              Start your free trial today and see the difference in minutes.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                href="/signup"
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-blue-700 bg-white rounded-2xl shadow-xl transition-all hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-white/50"
              >
                <span className="flex items-center gap-3">
                  Start Free Trial
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                </span>
              </Link>

              <Link
                href="/dashboard"
                className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white/30 rounded-2xl backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/50"
              >
                <span className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View Live Demo
                </span>
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-blue-200">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">Setup in under 5 minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">24/7 premium support</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

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
          <div className="mt-4 rounded-2xl bg-white/80 px-5 py-4 shadow-xl ring-1 ring-white/20 backdrop-blur-2xl border border-white/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  aria-label="Open menu"
                  onClick={() => setDrawer(true)}
                  className="group rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 text-white shadow-lg transition-all hover:shadow-xl hover:scale-105 sm:hidden"
                >
                  <svg className="h-5 w-5 transition-transform group-hover:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M3 12h18M3 18h18" />
                  </svg>
                </button>
                <button
                  aria-label="Open menu"
                  onClick={() => setDrawer(true)}
                  className="hidden sm:flex items-center gap-2 rounded-xl border border-blue-200/60 bg-white/70 px-3 py-2 text-blue-700 shadow-sm transition-all hover:border-blue-300 hover:bg-white hover:shadow-md"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M3 12h18M3 18h18" />
                  </svg>
                </button>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg">
                    <span className="text-sm font-bold">S</span>
                  </div>
                  <div>
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-xl font-bold tracking-tight text-transparent">Shopify Tenant Sore</span>
                    <div className="text-xs text-gray-500 -mt-0.5">Analytics Platform</div>
                  </div>
                </div>
              </div>

              <nav className="hidden items-center gap-2 lg:flex">
                <a href="#features" className="group rounded-xl px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-white/80 hover:text-blue-600 hover:shadow-md">
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Features
                  </span>
                </a>
                <a href="#pricing" className="group rounded-xl px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-white/80 hover:text-blue-600 hover:shadow-md">
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    Pricing
                  </span>
                </a>
                <a href="/dashboard" className="group rounded-xl px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-white/80 hover:text-blue-600 hover:shadow-md">
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Dashboard
                  </span>
                </a>
              </nav>

              <div className="flex items-center gap-3">
                <a href="/login" className="hidden sm:flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-blue-700 transition-all hover:bg-blue-50 hover:shadow-md">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Login
                </a>
                <a href="/signup" className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 transition-opacity group-hover:opacity-100"></div>
                  <span className="relative flex items-center gap-2">
                    Get Started
                    <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={`fixed inset-0 z-50 ${drawer ? "" : "pointer-events-none"}`}>
        <div className={`absolute inset-0 bg-black/40 backdrop-blur-[4px] transition-all duration-300 ${drawer ? "opacity-100" : "opacity-0"}`} onClick={() => setDrawer(false)} />
        <div className={`absolute left-0 top-0 h-full w-80 transform bg-gradient-to-br from-white via-gray-50 to-blue-50 shadow-2xl transition-transform duration-300 ease-out ${drawer ? "translate-x-0" : "-translate-x-full"}`}>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200/60 bg-white/90 backdrop-blur-xl px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg">
                <span className="text-lg font-bold">P</span>
              </div>
              <div>
                <h2 className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-lg font-bold tracking-tight text-transparent">Producti</h2>
                <p className="text-xs text-gray-500">Analytics Dashboard</p>
              </div>
            </div>
            <button
              onClick={() => setDrawer(false)}
              aria-label="Close"
              className="rounded-xl bg-gray-100 p-2.5 text-gray-500 transition-all hover:bg-gray-200 hover:text-gray-700 hover:scale-105"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex h-full flex-col overflow-y-auto px-6 py-6">
            <div className="space-y-2">
              <div className="mb-4">
                <p className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Navigation</p>
              </div>

              {/* Dashboard Link */}
              <a
                href="/dashboard"
                className="group flex items-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02]"
              >
                <div className="rounded-lg bg-white/20 p-2">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <span className="font-semibold">Dashboard</span>
                  <p className="text-xs text-blue-100">Analytics & Insights</p>
                </div>
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>

              {/* Features */}
              <a
                href="#features"
                className="group flex items-center gap-3 rounded-xl px-4 py-3 text-gray-700 transition-all hover:bg-white/80 hover:shadow-md"
              >
                <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <span className="font-medium">Features</span>
                  <p className="text-xs text-gray-500">What we offer</p>
                </div>
              </a>

              {/* Pricing */}
              <a
                href="#pricing"
                className="group flex items-center gap-3 rounded-xl px-4 py-3 text-gray-700 transition-all hover:bg-white/80 hover:shadow-md"
              >
                <div className="rounded-lg bg-amber-100 p-2 text-amber-600">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="flex-1">
                  <span className="font-medium">Pricing</span>
                  <p className="text-xs text-gray-500">Plans & Options</p>
                </div>
              </a>

              {/* Divider */}
              <div className="my-6 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>

              <div className="mb-4">
                <p className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Account</p>
              </div>

              {/* Login */}
              <a
                href="/login"
                className="group flex items-center gap-3 rounded-xl px-4 py-3 text-gray-700 transition-all hover:bg-white/80 hover:shadow-md"
              >
                <div className="rounded-lg bg-purple-100 p-2 text-purple-600">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                </div>
                <div className="flex-1">
                  <span className="font-medium">Sign In</span>
                  <p className="text-xs text-gray-500">Access your account</p>
                </div>
              </a>

              {/* Sign Up */}
              <a
                href="/signup"
                className="group flex items-center gap-3 rounded-xl border-2 border-dashed border-gray-300 px-4 py-3 text-gray-700 transition-all hover:border-blue-400 hover:bg-blue-50"
              >
                <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <span className="font-medium">Get Started</span>
                  <p className="text-xs text-gray-500">Create new account</p>
                </div>
                <div className="rounded-full bg-green-500 px-2 py-0.5 text-xs font-medium text-white">Free</div>
              </a>
            </div>

            {/* Bottom Section */}
            <div className="mt-auto space-y-4">
              {/* Stats Card */}
              <div className="rounded-xl bg-gradient-to-br from-white to-gray-50 p-4 shadow-sm border border-gray-200/60">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">Live Stats</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div>
                    <p className="text-xs text-gray-500">Active Users</p>
                    <p className="text-lg font-bold text-gray-900">1.2k+</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Stores</p>
                    <p className="text-lg font-bold text-gray-900">450+</p>
                  </div>
                </div>
              </div>

              {/* Help Section */}
              <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-4 border border-blue-200/40">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium text-blue-900">Need Help?</span>
                </div>
                <p className="text-xs text-blue-700 mb-3">Get started with our comprehensive guides and documentation.</p>
                <button className="w-full rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-blue-700">
                  View Docs
                </button>
              </div>
            </div>
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
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-lg font-bold tracking-tight text-transparent">Shopify Tenant Store</span>
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
            <h4 className="mb-3 text-sm font-semibold tracking-wide text-white">Shopify Tenant Store</h4>
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
          <p>© {new Date().getFullYear()} Shopify Tenant Store. All rights reserved. Made with ❤️ by <a href="https://github.com/Harshthakur24" target="_blank" rel="noopener noreferrer" className="text-white">Harsh Thakur</a></p>
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


