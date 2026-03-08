"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { formatPKR } from "@/utils/price";
import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";
import { HiCash, HiCreditCard } from "react-icons/hi";

const PAYMENT_METHODS = [
  {
    key: "COD",
    icon: HiCash,
    label: "Cash on Delivery",
    sub: "Pay when delivered",
  },
  {
    key: "MockOnline",
    icon: HiCreditCard,
    label: "Online Payment",
    sub: "Simulated payment",
  },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalAmount, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    address: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (items.length === 0) return toast.error("Your cart is empty");
    if (!form.customerName || !form.phone || !form.address) {
      return toast.error("Please fill in all fields");
    }

    setLoading(true);

    if (paymentMethod === "MockOnline") {
      toast.loading("Processing payment...", { duration: 2000 });
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.customerName,
          phone: form.phone,
          address: form.address,
          items: items.map((item) => ({
            menuItem: item._id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          totalAmount,
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to place order");
      const orderId = data.orderId || data._id;
      if (!orderId) throw new Error("Order created but no order ID was returned");

      toast.success("Order placed successfully");
      clearCart();
      router.push(`/order-confirmation?id=${orderId}`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col overflow-x-hidden">
        <Navbar />
        <main className="flex flex-1 items-center justify-center pb-12 pt-20">
          <div className="px-4 text-center">
            <h1 className="mb-3 font-serif text-2xl font-bold text-text-primary sm:text-3xl">
              Nothing to Checkout
            </h1>
            <p className="mb-8 text-sm text-text-muted sm:text-base">
              Add items to your cart first.
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
            <span className="gold-text">Checkout</span>
          </h1>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
              <div className="space-y-5 sm:space-y-6 lg:col-span-2">
                <div className="rounded-xl border border-border-color bg-bg-card p-4 sm:p-6">
                  <h2 className="mb-4 text-base font-semibold text-text-primary sm:mb-5 sm:text-lg">
                    Delivery Details
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-sm text-text-secondary">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="customerName"
                        value={form.customerName}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm text-text-secondary">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="+1 (555) 123-4567"
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm text-text-secondary">
                        Delivery Address
                      </label>
                      <textarea
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        placeholder="Enter your full delivery address"
                        rows={3}
                        className="input-field resize-none"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border-color bg-bg-card p-4 sm:p-6">
                  <h2 className="mb-4 text-base font-semibold text-text-primary sm:mb-5 sm:text-lg">
                    Payment Method
                  </h2>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                    {PAYMENT_METHODS.map((method) => (
                      <button
                        key={method.key}
                        type="button"
                        onClick={() => setPaymentMethod(method.key)}
                        className={`flex min-h-14 items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                          paymentMethod === method.key
                            ? "border-accent-gold bg-accent-gold/5"
                            : "border-border-color hover:border-border-light"
                        }`}
                      >
                        <method.icon
                          size={26}
                          className={
                            paymentMethod === method.key
                              ? "text-accent-gold"
                              : "text-text-muted"
                          }
                        />
                        <div>
                          <p
                            className={`text-sm font-semibold ${
                              paymentMethod === method.key
                                ? "text-accent-gold"
                                : "text-text-primary"
                            }`}
                          >
                            {method.label}
                          </p>
                          <p className="text-xs text-text-muted">{method.sub}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full rounded-lg lg:hidden"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-bg-primary border-t-transparent" />
                      Processing...
                    </>
                  ) : (
                    `Place Order - ${formatPKR(totalAmount)}`
                  )}
                </button>
              </div>

              <div className="lg:col-span-1">
                <div className="rounded-xl border border-border-color bg-bg-card p-5 sm:p-6 lg:sticky lg:top-24">
                  <h3 className="mb-4 text-lg font-semibold text-text-primary">
                    Order Summary
                  </h3>

                  <div className="scrollbar-hide mb-4 max-h-60 space-y-3 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item._id} className="flex justify-between gap-2 text-sm">
                        <span className="truncate text-text-secondary">
                          {item.name} x {item.quantity}
                        </span>
                        <span className="shrink-0 whitespace-nowrap text-text-primary">
                          {formatPKR(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mb-5 flex justify-between border-t border-border-color pt-3">
                    <span className="font-semibold text-text-primary">Total</span>
                    <span className="text-lg font-bold text-accent-gold">
                      {formatPKR(totalAmount)}
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary hidden w-full rounded-lg lg:flex"
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-bg-primary border-t-transparent" />
                        Processing...
                      </>
                    ) : (
                      "Place Order"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
