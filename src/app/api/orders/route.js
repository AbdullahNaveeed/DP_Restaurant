import { NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/auth/jwt";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { supabase } from "@/lib/db/supabase"; 

// POST /api/orders - Public: place a new order
export async function POST(req) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const rl = checkRateLimit(`orders_post:${ip}`, { limit: 30, windowMs: 60_000 });
    if (rl.limited) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await req.json();
    const { customerName, phone, address, items, paymentMethod, userId } = body;
    const totalAmount = body.totalAmount ?? body.totalPrice;

    if (!customerName || !phone || !address || !items?.length || totalAmount == null || !paymentMethod) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const orderPayload = {
      user_id: userId || null,
      customer_name: customerName,
      phone,
      address,
      items: items.map((item) => ({
        menuItem: item.menuItem,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      total_amount: Number(totalAmount),
      payment_method: paymentMethod,
      status: "Pending",
    };

    const { data: order, error: insertError } = await supabase
      .from("orders")
      .insert([orderPayload])
      .select()
      .single();

    if (insertError) {
       console.error("Supabase Insert Error:", insertError);
       throw new Error(insertError.message);
    }

    return NextResponse.json(
      {
        success: true,
        orderId: order.id,
        _id: order.id, // For backwards compatibility with frontend
        ...order,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Order POST error:", error);
    return NextResponse.json({ error: "Failed to place order" }, { status: 500 });
  }
}

// GET /api/orders - Admin: list all orders
export async function GET(req) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    let query = supabase.from("orders").select("*").order("created_at", { ascending: false });
    
    if (status && status !== "All") {
      query = query.eq("status", status);
    }

    const { data: orders, error } = await query;

    if (error) {
       throw error;
    }

    // Map Postgres columns to expected frontend properties for backwards compatibility
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
    console.error("Orders GET error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

