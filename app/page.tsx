"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShoppingCartIcon,
  PackageIcon,
  BarChart3Icon,
  UsersIcon,
  Building2Icon,
  ReceiptIcon,
  RotateCcwIcon,
  ShieldCheckIcon,
  StoreIcon,
  ArrowRightIcon,
  CheckIcon,
  MenuIcon,
  XIcon,
  ZapIcon,
  CloudIcon,
  SmartphoneIcon,
  TrendingUpIcon,
} from "lucide-react";

const features = [
  {
    icon: ShoppingCartIcon,
    title: "Fast Checkout",
    description:
      "Ring up sales in seconds with a keyboard-friendly, touch-ready point-of-sale built for busy counters.",
  },
  {
    icon: PackageIcon,
    title: "Inventory & Stock",
    description:
      "Track stock levels in real time, receive deliveries from suppliers, and get a full history of every movement.",
  },
  {
    icon: BarChart3Icon,
    title: "Reports & Analytics",
    description:
      "Understand your business with clear sales, stock, and performance reports available at a glance.",
  },
  {
    icon: Building2Icon,
    title: "Multi-Branch",
    description:
      "Manage every location from one account with per-branch data, staff, and role-based permissions.",
  },
  {
    icon: UsersIcon,
    title: "Customers & Suppliers",
    description:
      "Keep organized records of your customers and suppliers, including balances and transaction history.",
  },
  {
    icon: ReceiptIcon,
    title: "Expenses & End of Day",
    description:
      "Record branch expenses and close the register with confidence using end-of-day reconciliation.",
  },
  {
    icon: RotateCcwIcon,
    title: "Returns & Refunds",
    description:
      "Edit or reverse past sales for partial or full refunds while keeping your books accurate.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Roles & Permissions",
    description:
      "Give each staff member exactly the access they need with granular, permission-based controls.",
  },
];

const highlights = [
  {
    icon: ZapIcon,
    title: "Built for speed",
    description:
      "A snappy interface that keeps queues moving, even during your busiest hours.",
  },
  {
    icon: SmartphoneIcon,
    title: "Works everywhere",
    description:
      "Responsive by design — use it on a desktop, tablet, or phone without missing a beat.",
  },
  {
    icon: CloudIcon,
    title: "Always in sync",
    description:
      "Your sales, stock, and reports stay consistent across every branch and device.",
  },
];

const stats = [
  { value: "8+", label: "Powerful modules" },
  { value: "Multi", label: "Branch ready" },
  { value: "Real-time", label: "Stock tracking" },
  { value: "24/7", label: "Always available" },
];

const steps = [
  {
    step: "01",
    title: "Set up your branches",
    description:
      "Create your company, add branches, and invite your team with the right permissions.",
  },
  {
    step: "02",
    title: "Add your products",
    description:
      "Build your catalog, set prices, and receive stock from your suppliers.",
  },
  {
    step: "03",
    title: "Start selling",
    description:
      "Ring up sales, track inventory, and watch your reports update in real time.",
  },
];

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Why Baiclass", href: "#why" },
  { label: "How it works", href: "#how" },
];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-black/5 bg-background/80 backdrop-blur-md dark:border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white shadow-sm">
              <StoreIcon className="h-5 w-5" />
            </span>
            <span className="text-lg font-bold tracking-tight">Baiclass POS</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-foreground/70 transition-colors hover:text-primary"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/login"
              className="text-sm font-semibold text-foreground/80 transition-colors hover:text-primary"
            >
              Login
            </Link>
            <Link
              href="/login"
              className="group inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:brightness-95 hover:shadow-md"
            >
              Get started
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((v) => !v)}
            className="inline-flex items-center justify-center rounded-lg p-2 text-foreground/80 transition-colors hover:bg-black/5 md:hidden dark:hover:bg-white/10"
          >
            {menuOpen ? (
              <XIcon className="h-6 w-6" />
            ) : (
              <MenuIcon className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="border-t border-black/5 bg-background px-4 py-4 md:hidden dark:border-white/10">
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-black/5 hover:text-primary dark:hover:bg-white/10"
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-2 flex flex-col gap-2 border-t border-black/5 pt-3 dark:border-white/10">
                <Link
                  href="/login"
                  className="rounded-lg px-3 py-2.5 text-sm font-semibold text-foreground/80 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                >
                  Login
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white"
                >
                  Get started
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(60% 60% at 50% 0%, color-mix(in srgb, var(--primary) 18%, transparent) 0%, transparent 70%)",
          }}
        />
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 sm:pt-24 lg:px-8 lg:pb-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
              <TrendingUpIcon className="h-3.5 w-3.5" />
              The all-in-one POS for growing businesses
            </span>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Run your shop,
              <br />
              <span className="text-primary">not your paperwork.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base text-foreground/70 sm:text-lg">
              Baiclass POS brings sales, inventory, customers, and reporting
              together in one fast, reliable system — across every branch you
              run.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/login"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-base font-semibold text-white shadow-sm transition-all hover:brightness-95 hover:shadow-md sm:w-auto"
              >
                Get started free
                <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#features"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-7 py-3.5 text-base font-semibold text-foreground transition-all hover:border-primary/40 hover:text-primary sm:w-auto dark:border-white/15 dark:bg-neutral-900"
              >
                Explore features
              </a>
            </div>
          </div>

          {/* Hero preview / stat panel */}
          <div className="mx-auto mt-14 max-w-5xl">
            <div className="rounded-2xl border border-black/5 bg-white p-1.5 shadow-2xl shadow-primary/5 dark:border-white/10 dark:bg-neutral-900">
              <div className="rounded-xl bg-gradient-to-br from-primary/5 to-transparent p-6 sm:p-10">
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                  {stats.map((stat) => (
                    <div key={stat.label} className="text-center">
                      <p className="text-2xl font-extrabold text-primary sm:text-4xl">
                        {stat.value}
                      </p>
                      <p className="mt-1 text-xs font-medium text-foreground/60 sm:text-sm">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-20 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Everything your business needs
            </h2>
            <p className="mt-4 text-base text-foreground/70 sm:text-lg">
              One connected system that replaces the spreadsheets, notebooks, and
              guesswork.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-black/5 bg-white p-6 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg dark:border-white/10 dark:bg-neutral-900"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <feature.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-lg font-bold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground/70">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Baiclass */}
      <section id="why" className="scroll-mt-20 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                Built for the way you actually work
              </h2>
              <p className="mt-4 text-base text-foreground/70 sm:text-lg">
                Baiclass POS is designed to be fast, reliable, and simple enough
                for anyone on your team to master in minutes.
              </p>

              <div className="mt-8 space-y-6">
                {highlights.map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <item.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="font-bold">{item.title}</h3>
                      <p className="mt-1 text-sm text-foreground/70">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-black/5 bg-white p-8 shadow-xl shadow-primary/5 dark:border-white/10 dark:bg-neutral-900">
              <h3 className="text-lg font-bold">What you get out of the box</h3>
              <ul className="mt-6 space-y-4">
                {[
                  "Real-time sales and stock tracking",
                  "Detailed sales and inventory reports",
                  "Customer and supplier management",
                  "Expense tracking and end-of-day closing",
                  "Returns, refunds, and sale corrections",
                  "Role-based access for every staff member",
                  "Centralized control across all branches",
                ].map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                      <CheckIcon className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-sm text-foreground/80">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="scroll-mt-20 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Up and running in three steps
            </h2>
            <p className="mt-4 text-base text-foreground/70 sm:text-lg">
              No lengthy setup. Get your business online and selling in no time.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.step}
                className="relative rounded-2xl border border-black/5 bg-white p-8 dark:border-white/10 dark:bg-neutral-900"
              >
                <span className="text-5xl font-extrabold text-primary/15">
                  {step.step}
                </span>
                <h3 className="mt-4 text-lg font-bold">{step.title}</h3>
                <p className="mt-2 text-sm text-foreground/70">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-14 text-center shadow-xl sm:px-12 sm:py-20">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(50% 80% at 100% 0%, rgba(255,255,255,0.18) 0%, transparent 60%)",
              }}
            />
            <h2 className="relative text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Ready to modernize your shop?
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-base text-white/90 sm:text-lg">
              Join businesses running smarter with Baiclass POS. Set up in
              minutes and start selling today.
            </p>
            <div className="relative mt-8 flex justify-center">
              <Link
                href="/login"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-semibold text-primary shadow-sm transition-all hover:shadow-md"
              >
                Get started now
                <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-black/5 py-10 dark:border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
              <StoreIcon className="h-4 w-4" />
            </span>
            <span className="font-bold tracking-tight">Baiclass POS</span>
          </Link>
          <p className="text-sm text-foreground/60">
            &copy; {new Date().getFullYear()} Baiclass POS. All rights reserved.
          </p>
          <Link
            href="/login"
            className="text-sm font-semibold text-primary transition-colors hover:brightness-90"
          >
            Login
          </Link>
        </div>
      </footer>
    </div>
  );
}
