"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/db/supabase";
import { useAuth } from "@/app/auth/auth-context";
import toast from "react-hot-toast";

export default function OrderNotifier() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Listen to broadcasts from the 'order-updates' channel
    const channel = supabase.channel("order-updates")
      .on(
        "broadcast",
        { event: "order-status-changed" },
        (payload) => {
          // Only show the notification if this order belongs to the logged-in user
          if (payload.payload.userId === user.id) {
            
            const newStatus = payload.payload.status;
            let message = "Your order status has been updated!";
            let icon = "📦";

            if (newStatus === "Preparing") {
              message = "Great news! Your order is now being Prepared by our chefs.";
              icon = "👨‍🍳";
            } else if (newStatus === "Delivered") {
              message = "Your order has been Delivered! Enjoy your meal.";
              icon = "🎉";
            }

            toast(message, {
              icon: icon,
              duration: 8000,
              style: {
                background: "#1a1a1a",
                color: "#d4a853",
                border: "1px solid #d4a853",
              },
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return null; // This component is strictly for logic and toast notifications
}
