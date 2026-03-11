"use client";

import { useEffect, useState } from "react";
import {
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineCurrencyDollar,
  HiOutlineShoppingCart,
} from "react-icons/hi";
import { formatPKR } from "@/utils/price";
import { supabase } from "@/lib/db/supabase";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) setStats(await res.json());
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  useEffect(() => {
    fetchStats().finally(() => setLoading(false));

    const channel = supabase
      .channel("admin-dashboard-stats")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          console.log("Real-time order change detected:", payload);
          fetchStats(); // Refresh dashboard on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent-gold border-t-transparent" />
      </div>
    );
  }

  const cards = [
    {
      title: "Total Orders",
      value: stats?.totalOrders || 0,
      icon: HiOutlineShoppingCart,
      color: "text-accent-gold",
      bg: "bg-accent-gold/10",
    },
    {
      title: "Revenue",
      value: `${formatPKR(stats?.totalRevenue || 0)}`,
      icon: HiOutlineCurrencyDollar,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      title: "Pending",
      value: stats?.statusCounts?.Pending || 0,
      icon: HiOutlineClock,
      color: "text-warning",
      bg: "bg-warning/10",
    },
    {
      title: "Delivered",
      value: stats?.statusCounts?.Delivered || 0,
      icon: HiOutlineCheckCircle,
      color: "text-success",
      bg: "bg-success/10",
    },
  ];

  return (
    <div>
      <h1 className="mb-5 font-serif text-xl font-bold text-text-primary sm:mb-8 sm:text-2xl lg:text-3xl">
        Dashboard
      </h1>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:mb-10 sm:gap-4 lg:grid-cols-4 lg:gap-6">
        {cards.map((card, i) => (
          <div key={i} className="card-hover rounded-xl border border-border-color bg-bg-card p-3 sm:p-5">
            <div className="mb-2 flex items-center justify-between sm:mb-3">
              <span className="truncate pr-2 text-xs font-medium text-text-muted sm:text-sm">
                {card.title}
              </span>
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:h-10 sm:w-10 ${card.bg}`}>
                <card.icon size={18} className={card.color} />
              </div>
            </div>
            <p className="truncate text-lg font-bold text-text-primary sm:text-2xl lg:text-3xl">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-border-color bg-bg-card">
        <div className="border-b border-border-color p-4 sm:p-5">
          <h2 className="text-base font-semibold text-text-primary sm:text-lg">
            Recent Orders
          </h2>
        </div>

        <div className="overflow-x-auto">
          {stats?.recentOrders?.length > 0 ? (
            <table className="w-full min-w-[32rem] text-sm">
              <thead>
                <tr className="border-b border-border-color">
                  <th className="px-3 py-3 text-left font-medium text-text-muted sm:px-4">Customer</th>
                  <th className="px-3 py-3 text-left font-medium text-text-muted sm:px-4">Address</th>
                  <th className="px-3 py-3 text-left font-medium text-text-muted sm:px-4">Items</th>
                  <th className="px-3 py-3 text-left font-medium text-text-muted sm:px-4">Total</th>
                  <th className="px-3 py-3 text-left font-medium text-text-muted sm:px-4">Status</th>
                  <th className="px-3 py-3 text-left font-medium text-text-muted sm:px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="border-b border-border-color transition-colors last:border-0 hover:bg-bg-elevated/50"
                  >
                    <td className="px-3 py-3 text-text-primary sm:px-4">{order.customerName}</td>
                    <td className="px-3 py-3 text-text-secondary sm:px-4 truncate max-w-[150px]">{order.address || "N/A"}</td>
                    <td className="px-3 py-3 text-text-secondary sm:px-4">{order.items?.length || 0}</td>
                    <td className="px-3 py-3 font-medium text-accent-gold sm:px-4">
                      {formatPKR(order.totalAmount)}
                    </td>
                    <td className="px-3 py-3 sm:px-4">
                      <span className={`badge badge-${order.status.toLowerCase()}`}>{order.status}</span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-text-muted sm:px-4">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-12 text-center text-text-muted">
              <p>No orders yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
