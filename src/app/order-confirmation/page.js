"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { HiCheckCircle } from "react-icons/hi";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");

  return (
    <div className="mx-auto w-full max-w-lg px-4 text-center min-[375px]:px-5 min-[480px]:px-6 md:px-8">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full gold-gradient animate-fade-in-up sm:h-20 sm:w-20">
        <HiCheckCircle size={36} className="text-bg-primary" />
      </div>

      <h1 className="animate-fade-in-up mb-3 font-serif text-2xl font-bold text-text-primary min-[375px]:text-[1.9rem] min-[480px]:text-[2.05rem] md:text-4xl">
        Order <span className="gold-text">Confirmed!</span>
      </h1>

      <p className="animate-fade-in mb-6 text-sm text-text-muted sm:text-base">
        Thank you for your order. We are preparing your meal now.
      </p>

      {orderId && (
        <div className="animate-fade-in mb-8 rounded-xl border border-border-color bg-bg-card p-4 sm:p-5">
          <p className="mb-1 text-xs text-text-muted sm:text-sm">Order ID</p>
          <p className="break-all font-mono text-sm font-bold text-accent-gold sm:text-base">
            {orderId}
          </p>
        </div>
      )}

      <div className="animate-fade-in mb-8 text-left">
        <h3 className="mb-4 text-center text-sm font-semibold text-text-primary sm:text-base">
          What&apos;s Next?
        </h3>
        <div className="space-y-4">
          {[
            { step: "1", label: "Order Received", desc: "We received your order." },
            { step: "2", label: "Preparing", desc: "Our kitchen is cooking your meal." },
            { step: "3", label: "On the Way", desc: "Your order is out for delivery." },
            { step: "4", label: "Delivered", desc: "Enjoy your meal." },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-gold/10 text-xs font-bold text-accent-gold">
                {item.step}
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">{item.label}</p>
                <p className="text-xs text-text-muted">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="animate-fade-in-up flex flex-col items-center justify-center gap-3 sm:flex-row">
        {orderId && (
          <Link href={`/order-tracking?id=${orderId}`} className="btn-primary w-full rounded-full px-8 sm:w-auto">
            Track Your Order
          </Link>
        )}
        <Link href="/menu" className="btn-outline w-full rounded-full px-8 sm:w-auto">
          Order Again
        </Link>
        <Link href="/" className="btn-outline w-full rounded-full px-8 sm:w-auto">
          Back Home
        </Link>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <Navbar />
      <main className="flex flex-1 items-center justify-center pb-12 pt-20 sm:pb-20 sm:pt-24">
        <Suspense
          fallback={
            <div className="flex items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent-gold border-t-transparent" />
            </div>
          }
        >
          <ConfirmationContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}