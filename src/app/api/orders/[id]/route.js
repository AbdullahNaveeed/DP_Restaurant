import { NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/auth/jwt";
import { updateFallbackOrderStatus } from "@/services/orders/order-fallback.service";
import { supabase } from "@/lib/db/supabase";

// PATCH /api/orders/[id] - Admin: update order status
export async function PATCH(req, context) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Next.js 15+: params may be a Promise
    const resolvedContext = context?.params?.then ? { params: await context.params } : context;
    let id = resolvedContext?.params?.id;

    if (!id) {
      try {
        const url = new URL(req.url);
        const parts = url.pathname.split("/").filter(Boolean);
        id = parts[parts.length - 1];
      } catch {
        id = undefined;
      }
    }

    if (Array.isArray(id)) id = id.join("/");
    id = decodeURIComponent(String(id)).trim();
    
    const { status } = await req.json();

    if (!["Pending", "Preparing", "Delivered"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be Pending, Preparing, or Delivered" },
        { status: 400 }
      );
    }
    
    const NEXT = {
      Pending: "Preparing",
      Preparing: "Delivered",
    };

    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const current = order.status;

    if (current === "Delivered") {
      return NextResponse.json({ error: "Order already delivered" }, { status: 400 });
    }

    if (NEXT[current] !== status) {
      return NextResponse.json({ error: "Invalid status transition" }, { status: 400 });
    }

    const { data: updatedOrder, error: updateError } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
       throw updateError;
    }

    // Broadcast Realtime update to the specific user if they are registered
    if (updatedOrder.user_id) {
       await supabase.channel("order-updates").send({
         type: "broadcast",
         event: "order-status-changed",
         payload: {
           userId: updatedOrder.user_id,
           orderId: updatedOrder.id,
           status: updatedOrder.status,
         },
       });
    }

    // Map column names back to expected frontend keys for backwards compatibility
    const formattedOrder = {
       ...updatedOrder,
       _id: updatedOrder.id,
       userId: updatedOrder.user_id,
       customerName: updatedOrder.customer_name,
       totalAmount: updatedOrder.total_amount,
       paymentMethod: updatedOrder.payment_method,
       createdAt: updatedOrder.created_at,
    };

    return NextResponse.json({ success: true, order: formattedOrder });
  } catch (error) {
    console.error("Order PATCH error:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}

