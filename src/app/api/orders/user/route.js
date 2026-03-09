import { NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabase";

// GET /api/orders/user?userId=[id] - Fetch orders for a specific authenticated user
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId query parameter is required" }, { status: 400 });
    }
    const { data: orders, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
       throw error;
    }

    // Map Postgres columns to expected frontend properties
    const formattedOrders = orders.map((o) => ({
       ...o,
       _id: o.id,
       userId: o.user_id,
       customerName: o.customer_name,
       totalAmount: o.total_amount,
       paymentMethod: o.payment_method,
       createdAt: o.created_at,
    }));

    return NextResponse.json(formattedOrders);
  } catch (error) {
    console.error("User Orders GET error:", error);
    return NextResponse.json({ error: "Failed to fetch user orders" }, { status: 500 });
  }
}
