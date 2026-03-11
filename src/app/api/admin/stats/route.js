import { NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/auth/jwt";
import { supabase } from "@/lib/db/supabase";

// GET /api/admin/stats - Admin: get dashboard analytics
export async function GET(req) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: allOrders, error } = await supabase
      .from("orders")
      .select("id, status, total_amount, customer_name, created_at, payment_method, user_id, items, address")
      .order("created_at", { ascending: false });

    if (error) {
       throw error;
    }

    const totalOrders = allOrders.length;
    let totalRevenue = 0;
    const statusCounts = { Pending: 0, Preparing: 0, Delivered: 0 };
    
    allOrders.forEach((o) => {
      totalRevenue += Number(o.total_amount) || 0;
      if (statusCounts[o.status] !== undefined) {
        statusCounts[o.status]++;
      }
    });

    const recentOrdersRaw = allOrders.slice(0, 5);
    const recentOrders = recentOrdersRaw.map((o) => ({
       ...o,
       _id: o.id,
       userId: o.user_id,
       customerName: o.customer_name,
       totalAmount: o.total_amount,
       paymentMethod: o.payment_method,
       createdAt: o.created_at,
       address: o.address,
    }));

    const result = {
      totalOrders,
      totalRevenue,
      statusCounts,
      recentOrders,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Stats GET error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
