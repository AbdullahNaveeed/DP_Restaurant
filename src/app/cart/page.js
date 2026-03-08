"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { formatPKR } from "@/lib/price";
import { useCart } from "@/context/CartContext";
import { HiMinus, HiPlus, HiTrash } from "react-icons/hi";

export default function CartPage() {
  const { items, totalAmount, updateQuantity, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col overflow-x-hidden">
        <Navbar />
        <main className="flex flex-1 items-center justify-center pb-12 pt-20">
          <div className="px-4 text-center">
            <h1 className="mb-3 font-serif text-2xl font-bold text-text-primary sm:text-3xl">
              Your Cart is Empty
            </h1>
            <p className="mb-8 text-sm text-text-muted sm:text-base">
              Explore our menu and add some delicious items.
            </p>
            <Link href="/menu" className="btn-primary mx-auto w-full max-w-xs rounded-full px-8 sm:w-auto">
              Browse Menu
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <Navbar />

      <main className="flex-1 pb-12 pt-20 sm:pb-20 sm:pt-24">
        <div className="mx-auto w-full max-w-5xl px-4 min-[375px]:px-5 min-[480px]:px-6 md:px-8 lg:px-10 min-[1440px]:px-12">
          <h1 className="mb-6 font-serif text-2xl font-bold text-text-primary sm:mb-8 min-[375px]:text-[1.9rem] min-[480px]:text-[2.05rem] md:text-4xl">
            Your <span className="gold-text">Cart</span>
          </h1>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
            <div className="space-y-3 sm:space-y-4 lg:col-span-2">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="rounded-xl border border-border-color bg-bg-card p-4 sm:p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-semibold text-text-primary sm:text-base">
                        {item.name}
                      </h3>
                      <p className="mt-0.5 text-sm font-medium text-accent-gold">
                        {formatPKR(item.price)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-3 sm:justify-end sm:gap-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="flex h-10 w-10 items-center justify-center rounded-lg bg-bg-elevated text-text-secondary transition-colors hover:text-accent-gold"
                          aria-label="Decrease quantity"
                        >
                          <HiMinus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold text-text-primary">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="flex h-10 w-10 items-center justify-center rounded-lg bg-bg-elevated text-text-secondary transition-colors hover:text-accent-gold"
                          aria-label="Increase quantity"
                        >
                          <HiPlus size={14} />
                        </button>
                      </div>

                      <p className="min-w-16 text-right text-sm font-bold text-text-primary">
                        {formatPKR(item.price * item.quantity)}
                      </p>

                      <button
                        type="button"
                        onClick={() => removeItem(item._id)}
                        className="flex h-11 w-11 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-danger/10 hover:text-danger"
                        aria-label="Remove item"
                      >
                        <HiTrash size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="rounded-xl border border-border-color bg-bg-card p-5 sm:p-6 lg:sticky lg:top-24">
                <h3 className="mb-4 text-lg font-semibold text-text-primary">
                  Order Summary
                </h3>
                <div className="mb-6 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Subtotal</span>
                    <span className="text-text-secondary">{formatPKR(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Delivery</span>
                    <span className="text-success">Free</span>
                  </div>
                  <div className="flex justify-between border-t border-border-color pt-3">
                    <span className="font-semibold text-text-primary">Total</span>
                    <span className="text-lg font-bold text-accent-gold">
                      {formatPKR(totalAmount)}
                    </span>
                  </div>
                </div>
                <Link
                  href="/checkout"
                  className="btn-primary w-full rounded-lg text-center"
                >
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}