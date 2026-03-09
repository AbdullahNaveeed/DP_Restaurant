"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { HiCheckCircle, HiClock, HiRefresh } from "react-icons/hi";

const STEPS = [
  { key: "Pending", label: "Order Received", icon: HiClock, desc: "Your order has been received." },
  { key: "Preparing", label: "Preparing", icon: HiRefresh, desc: "Our kitchen is cooking your meal." },
  { key: "Delivered", label: "Delivered", icon: HiCheckCircle, desc: "Your order has been delivered!" },
];

const POLL_INTERVAL_MS = 15_000;

function TrackingContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");

  const [status, setStatus] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    if (!orderId) return;
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/status`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order not found");
      setStatus(data.status);
      setCustomerName(data.customerName || "");
      setCreatedAt(data.createdAt || "");
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  if (!orderId) {
    return (
      <div className="px-4 text-center">
        <h1 className="mb-3 font-serif text-2xl font-bold text-text-primary sm:text-3xl">
          No Order ID Provided
        </h1>
        <p className="mb-8 text-sm text-text-muted sm:text-base">
          Please use the link from your order confirmation email.
        </p>
        <Link href="/menu" className="btn-primary mx-auto w-full max-w-xs rounded-full px-8 sm:w-auto">
          Browse Menu
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent-gold border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 text-center">
        <h1 className="mb-3 font-serif text-2xl font-bold text-text-primary sm:text-3xl">
          Order <span className="gold-text">Not Found</span>
        </h1>
        <p className="mb-8 text-sm text-text-muted sm:text-base">{error}</p>
        <Link href="/menu" className="btn-primary mx-auto w-full max-w-xs rounded-full px-8 sm:w-auto">
          Browse Menu
        </Link>
      </div>
    );
  }

  const currentStepIndex = STEPS.findIndex((s) => s.key === status);

  return (
    <div className="mx-auto w-full max-w-lg px-4 min-[375px]:px-5 min-[480px]:px-6 md:px-8">
      <div className="mb-8 text-center">
        <h1 className="mb-3 font-serif text-2xl font-bold text-text-primary min-[375px]:text-[1.9rem] min-[480px]:text-[2.05rem] md:text-4xl">
          Track Your <span className="gold-text">Order</span>
        </h1>
        {customerName && (
          <p className="text-sm text-text-muted sm:text-base">Hi {customerName}!</p>
        )}
      </div>

      <div className="mb-6 rounded-xl border border-border-color bg-bg-card p-4 sm:p-5">
        <div className="mb-1 flex justify-between">
          <span className="text-xs text-text-muted sm:text-sm">Order ID</span>
          {createdAt && (
            <span className="text-xs text-text-muted">
              {new Date(createdAt).toLocaleDateString()}
            </span>
          )}
        </div>
        <p className="break-all font-mono text-sm font-bold text-accent-gold sm:text-base">
          {orderId}
        </p>
      </div>

      <div className="mb-8 space-y-0">
        {STEPS.map((step, i) => {
          const isCompleted = i < currentStepIndex;
          const isCurrent = i === currentStepIndex;
          const isPending = i > currentStepIndex;

          return (
            <div key={step.key} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${
                    isCompleted || isCurrent
                      ? "gold-gradient text-bg-primary"
                      : "bg-bg-elevated text-text-muted"
                  }`}
                >
                  <step.icon size={20} />
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`my-1 h-10 w-0.5 ${
                      isCompleted ? "bg-accent-gold" : "bg-border-color"
                    }`}
                  />
                )}
              </div>
              <div className="pb-6">
                <p
                  className={`text-sm font-semibold sm:text-base ${
                    isCompleted || isCurrent ? "text-text-primary" : "text-text-muted"
                  }`}
                >
                  {step.label}
                  {isCurrent && (
                    <span className="ml-2 inline-block animate-pulse rounded-full bg-accent-gold/20 px-2 py-0.5 text-xs font-medium text-accent-gold">
                      Current
                    </span>
                  )}
                </p>
                <p className="text-xs text-text-muted sm:text-sm">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mb-8 text-center text-xs text-text-muted">
        This page updates automatically every 15 seconds.
      </p>

      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link href="/menu" className="btn-primary w-full rounded-full px-8 sm:w-auto">
          Order Again
        </Link>
        <Link href="/" className="btn-outline w-full rounded-full px-8 sm:w-auto">
          Back Home
        </Link>
      </div>
    </div>
  );
}

export default function OrderTrackingPage() {
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
          <TrackingContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
