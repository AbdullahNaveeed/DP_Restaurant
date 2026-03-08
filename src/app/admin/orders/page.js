"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { apiRequest } from "@/lib/http/api-client";

const STATUS_OPTIONS = ["All", "Pending", "Preparing", "Delivered"];
const NEXT_STATUS_MAP = {
  Pending: ["Preparing"],
  Preparing: ["Delivered"],
  Delivered: [],
};

const getNextStatus = (status) => {
  switch (status) {
    case "Pending":
      return ["Preparing"];
    case "Preparing":
      return ["Delivered"];
    default:
      return [];
  }
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setLoading(true);

    try {
      const url = filter === "All" ? "/api/orders" : `/api/orders?status=${filter}`;
      const data = await apiRequest(url);
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateStatus = async (id, status) => {
    try {
      await apiRequest(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "same-origin",
      });

      toast.success("Order status updated successfully.");
      await fetchOrders();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="mb-5 flex flex-col justify-between gap-3 sm:mb-8 sm:flex-row sm:items-center">
        <h1 className="font-serif text-xl font-bold text-text-primary sm:text-2xl lg:text-3xl">
          Orders
        </h1>

        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilter(status)}
              className={`min-h-10 rounded-full px-3 py-1.5 text-xs font-medium transition-all sm:text-sm ${
                filter === status
                  ? "gold-gradient text-bg-primary"
                  : "border border-border-color bg-bg-card text-text-secondary hover:border-accent-gold/50"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent-gold border-t-transparent" />
        </div>
      ) : orders.length === 0 ? (
        <div className="py-20 text-center text-text-muted">
          <p>No orders found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => (
            <div
              key={order._id}
              className="rounded-xl border border-border-color bg-bg-card p-4 sm:p-5"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-text-primary sm:text-base">
                    {order.customerName}
                  </h3>
                  <p className="mt-0.5 text-xs text-text-muted">
                    {new Date(order.createdAt).toLocaleDateString()} - {order.items?.length || 0} items
                  </p>
                </div>
                <span className={`badge badge-${order.status.toLowerCase()} shrink-0`}>
                  {order.status}
                </span>
              </div>

              <div className="mb-3 space-y-1.5 text-xs sm:text-sm">
                {order.items?.slice(0, 3).map((item, i) => (
                  <div key={i} className="flex justify-between text-text-secondary">
                      <span className="truncate pr-2">
                        {item.name} x {item.quantity}
                      </span>
                      <span className="shrink-0 whitespace-nowrap text-text-primary">
                        {(() => {
                          try {
                            return new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 }).format(item.price * item.quantity);
                          } catch (e) {
                            return `PKR ${Number(item.price * item.quantity).toLocaleString()}`;
                          }
                        })()}
                      </span>
                    </div>
                ))}
                {order.items?.length > 3 && (
                  <p className="text-xs text-text-muted">
                    +{order.items.length - 3} more items
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-border-color pt-3">
                <span className="text-sm font-bold text-accent-gold sm:text-base">
                  {(() => {
                    try {
                      return new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 }).format(order.totalAmount);
                    } catch (e) {
                      return `PKR ${Number(order.totalAmount).toLocaleString()}`;
                    }
                  })()}
                </span>
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order._id, e.target.value)}
                  disabled={order.status === "Delivered"}
                  className="input-field min-h-9 w-auto px-2 py-1.5 text-xs sm:text-sm"
                >
                  <option value={order.status} disabled>
                    {order.status}
                  </option>
                  {getNextStatus(order.status).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
