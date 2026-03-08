import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongoose";
import Order from "@/models/Order";
import { getAdminFromRequest } from "@/lib/auth/jwt";
import { updateFallbackOrderStatus } from "@/services/orders/order-fallback.service";

// PATCH /api/orders/[id] - Admin: update order status
export async function PATCH(req, context) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let conn = null;
    try {
      conn = await dbConnect();
    } catch (dbError) {
      console.warn("Order PATCH DB connect failed, using fallback store:", dbError.message);
      conn = null;
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

    if (!conn) {
      const result = await updateFallbackOrderStatus(id, status);
      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: result.status });
      }
      return NextResponse.json({ success: true, order: result.value });
    }

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const current = order.status;

    if (current === "Delivered") {
      return NextResponse.json({ error: "Order already delivered" }, { status: 400 });
    }

    if (NEXT[current] !== status) {
      return NextResponse.json({ error: "Invalid status transition" }, { status: 400 });
    }

    order.status = status;
    await order.save();

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Order PATCH error:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}

