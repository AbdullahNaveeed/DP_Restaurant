"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  HiOutlineSparkles,
  HiOutlineClock,
  HiOutlineStar,
  HiOutlineTruck,
} from "react-icons/hi";

const FEATURES = [
  {
    icon: HiOutlineSparkles,
    title: "Authentic Shinwari Taste",
    desc: "Traditional recipes prepared with regional spices and classic techniques.",
  },
  {
    icon: HiOutlineClock,
    title: "Freshly Cooked Daily",
    desc: "Every karahi, rosh, and dum pukht dish is cooked to order.",
  },
  {
    icon: HiOutlineStar,
    title: "Meat Specialists",
    desc: "Known for rich mutton and chicken specialties inspired by Shinwari cuisine.",
  },
  {
    icon: HiOutlineTruck,
    title: "Simple Ordering",
    desc: "Browse the full menu and place your order in a few quick steps.",
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <Navbar />

      <section className="relative flex min-h-[78vh] items-center justify-center overflow-hidden pt-16 sm:pt-20">
        <div className="absolute inset-0 bg-gradient-to-b from-bg-primary/80 via-bg-primary/60 to-bg-primary" />
        <div className="absolute left-1/2 top-1/4 h-[18rem] w-[18rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-gold/5 blur-3xl sm:h-[24rem] sm:w-[24rem] lg:h-[30rem] lg:w-[30rem]" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-20 text-center min-[375px]:px-5 min-[480px]:px-6 md:px-8 lg:px-10 lg:py-28 min-[1440px]:px-12 sm:py-24">
          <span className="animate-fade-in mb-5 inline-block rounded-full border border-accent-gold/30 px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-accent-gold sm:mb-6 sm:text-xs">
            Traditional Shinwari Flavors
          </span>

          <h1 className="animate-fade-in-up mb-4 font-serif text-[clamp(1.9rem,8vw,4.75rem)] min-[375px]:text-[clamp(2.1rem,7.6vw,4.9rem)] min-[1440px]:text-[clamp(2.6rem,5.2vw,5.6rem)] font-bold leading-[1.08] text-text-primary sm:mb-6">
            Welcome To <br />
            <span className="gold-text">Ghani Shinwari</span>
          </h1>

          <p className="animate-fade-in mx-auto mb-8 max-w-[36ch] text-sm leading-relaxed text-text-secondary sm:mb-10 sm:text-base lg:text-lg">
            Enjoy authentic Pakistani meat dishes including karahi, dum pukht,
            rosh, kebabs, and other traditional favorites.
          </p>

          <div className="animate-fade-in-up mx-auto flex w-full max-w-sm flex-col items-center justify-center gap-3 sm:max-w-none sm:flex-row sm:gap-4">
            <Link href="/menu" className="btn-primary w-full rounded-full px-8 sm:w-auto">
              Explore Menu
            </Link>
            <Link href="/cart" className="btn-outline w-full rounded-full px-8 sm:w-auto">
              View Cart
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-bg-secondary py-16 sm:py-20 lg:py-28">
        <div className="mx-auto w-full max-w-7xl px-4 min-[375px]:px-5 min-[480px]:px-6 md:px-8 lg:px-10 min-[1440px]:px-12">
          <div className="mb-10 text-center sm:mb-14">
            <h2 className="mb-3 font-serif text-2xl font-bold text-text-primary sm:text-3xl lg:text-4xl">
              Why Choose <span className="gold-text">Ghani Shinwari</span>
            </h2>
            <p className="mx-auto max-w-[38ch] text-sm text-text-muted sm:text-base">
              We serve authentic Shinwari recipes that focus on quality meat,
              bold flavor, and traditional cooking.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {FEATURES.map((feat, i) => (
              <div
                key={i}
                className="card-hover rounded-xl border border-border-color bg-bg-card p-5 text-center sm:p-6"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent-gold/10">
                  <feat.icon size={24} className="text-accent-gold" />
                </div>
                <h3 className="mb-2 text-base font-semibold text-text-primary">
                  {feat.title}
                </h3>
                <p className="text-sm leading-relaxed text-text-muted">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto w-full max-w-7xl px-4 min-[375px]:px-5 min-[480px]:px-6 md:px-8 lg:px-10 min-[1440px]:px-12">
          <div className="relative overflow-hidden rounded-2xl border border-border-color bg-bg-card p-6 text-center sm:p-10 lg:p-16">
            <div className="absolute inset-0 bg-gradient-to-br from-accent-gold/5 via-transparent to-accent-warm/5" />
            <div className="relative z-10">
              <h2 className="mb-3 font-serif text-2xl font-bold text-text-primary sm:mb-4 sm:text-3xl lg:text-4xl">
                Ready to <span className="gold-text">Order</span>?
              </h2>
              <p className="mx-auto mb-6 max-w-[38ch] text-sm text-text-muted sm:mb-8 sm:text-base">
                Explore our starters, main course, desserts, drinks, and
                specials. Freshly cooked and delivered hot.
              </p>
              <Link
                href="/menu"
                className="btn-primary mx-auto w-full max-w-sm rounded-full px-8 sm:w-auto sm:max-w-none sm:px-10"
              >
                Order Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
