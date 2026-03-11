"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/auth/auth-context";

export default function OrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    // If auth finishes loading and there's no user, redirect to login
    if (!authLoading && !user) {
      router.push("/auth/login");
    }

    if (user) {
      // Fetch order history
      fetch(`/api/orders/user?userId=${user.id}`)
        .then((res) => res.json())
        .then((data) => {
           if (Array.isArray(data)) {
             setOrders(data);
           }
           setLoadingOrders(false);
        })
        .catch((err) => {
           console.error("Failed to fetch orders:", err);
           setLoadingOrders(false);
        });
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent-gold border-t-transparent pt-20" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] flex-col items-center px-4 py-24 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl space-y-6 rounded-2xl border border-border-color bg-bg-card p-6 sm:p-10 shadow-xl">
        <div className="mb-8">
          <h2 className="font-serif text-3xl font-bold tracking-tight text-accent-gold">
            Your Orders
          </h2>
          <p className="mt-2 text-sm text-text-muted">
            Track your active orders and review your past purchases
          </p>
        </div>
        
        {loadingOrders ? (
          <div className="flex items-center justify-center py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-gold border-t-transparent" />
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border-color bg-bg-elevated/30 py-16 text-center text-text-muted">
             <p className="mb-4">You haven't placed any orders yet.</p>
             <button onClick={() => router.push('/menu')} className="btn-primary rounded-lg px-6">
                Browse Menu
             </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
             {orders.map((order) => (
                <div key={order._id} className="rounded-xl border border-border-color bg-bg-elevated p-6 shadow-sm transition-shadow hover:shadow-md">
                   <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border-color pb-4">
                     <div>
                       <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Order ID</p>
                       <p className="font-mono text-xs sm:text-sm text-text-primary bg-bg-primary px-2 py-1 rounded inline-block">
                         {order._id ? `#${order._id.substring(0, 8).toUpperCase()}` : 'N/A'}
                       </p>
                     </div>
                     <span className={`badge badge-${order.status?.toLowerCase() || 'pending'} shrink-0 text-xs sm:text-sm px-3 py-1`}>
                       {order.status || "Pending"}
                     </span>
                   </div>
                   
                   <div className="mb-5 space-y-2">
                     <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">Items</p>
                     {order.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between py-1 text-sm">
                           <span className="text-text-secondary">{item.name} <span className="text-text-muted ml-1">x{item.quantity}</span></span>
                           <span className="text-text-primary font-medium">
                             {new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 }).format(item.price * item.quantity)}
                           </span>
                        </div>
                     ))}
                   </div>
                   
                   <div className="flex items-center justify-between pt-4 border-t border-border-color">
                     <span className="text-xs font-medium text-text-muted">
                       {new Date(order.createdAt).toLocaleString(undefined, { 
                         year: 'numeric', 
                         month: 'short', 
                         day: 'numeric',
                         hour: 'numeric',
                         minute: '2-digit',
                         hour12: true
                       })}
                     </span>
                     <div className="text-right">
                       <p className="text-xs text-text-muted mb-0.5">Total</p>
                       <span className="font-bold text-accent-gold text-lg">
                         {new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 }).format(order.totalAmount)}
                       </span>
                     </div>
                   </div>
                </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
}
