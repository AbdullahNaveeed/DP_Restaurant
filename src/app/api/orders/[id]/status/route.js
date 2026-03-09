import { NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabase";

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

    // Fetch from Supabase
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("id, status, customer_name, created_at")
      .eq("id", id)
      .single();

    if (fetchError || !order) {
       return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      orderId: order.id,
      status: order.status,
      customerName: order.customer_name,
      createdAt: order.created_at,
    });
  } catch (error) {
    console.error("Order status GET error:", error);
    return NextResponse.json({ error: "Failed to get order status" }, { status: 500 });
  }
}
