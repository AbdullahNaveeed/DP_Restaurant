import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongoose";
import Order from "@/models/Order";
import {
  readFallbackOrders,
} from "@/services/orders/order-fallback.service";

// GET /api/orders/[id]/status — Public: check order status (no admin auth)
export async function GET(req, context) {
  try {
    // Resolve params (Next.js 15+ may make params a Promise)
    const resolvedContext =
      context?.params?.then ? { params: await context.params } : context;
    let id = resolvedContext?.params?.id;

    if (!id) {
      try {
        const url = new URL(req.url);
        const parts = url.pathname.split("/").filter(Boolean);
        // URL shape: /api/orders/<id>/status → parts[2] is the id
        id = parts.length >= 3 ? parts[2] : undefined;
      } catch {
        id = undefined;
      }
    }

    if (Array.isArray(id)) id = id[0];
    id = decodeURIComponent(String(id || "")).trim();

    if (!id) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    // Try database first
    let conn = null;
    try {
      conn = await dbConnect();
    } catch {
      conn = null;
    }

    if (conn) {
      try {
        const order = await Order.findById(id)
          .select("status customerName createdAt")
          .lean();

        if (order) {
          return NextResponse.json({
            orderId: String(order._id),
            status: order.status,
            customerName: order.customerName,
            createdAt: order.createdAt,
          });
        }
      } catch {
        // ID may not be a valid ObjectId — fall through to fallback
      }
    }

    // Try fallback store
    try {
      const fallbackOrders = await readFallbackOrders();
      const found = fallbackOrders.find(
        (o) => String(o._id).trim() === id || String(o._id).includes(id)
      );

      if (found) {
        return NextResponse.json({
          orderId: String(found._id),
          status: found.status,
          customerName: found.customerName,
          createdAt: found.createdAt,
        });
      }
    } catch {
      // ignore fallback errors
    }

    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  } catch (error) {
    console.error("Order status GET error:", error);
    return NextResponse.json({ error: "Failed to get order status" }, { status: 500 });
  }
}
