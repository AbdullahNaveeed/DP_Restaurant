import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongoose";
import Order from "@/models/Order";
import { getAdminFromRequest } from "@/lib/auth/jwt";
import cache from "@/lib/cache";
import { readFallbackOrders } from "@/services/orders/order-fallback.service";
import { computeStatsFromOrders } from "@/services/admin/stats.service";

// GET /api/admin/stats - Admin: get dashboard analytics
export async function GET(req) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conn = await dbConnect();
    const cacheKey = "admin:stats:v1";
    const cached = await cache.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    if (!conn) {
      const list = await readFallbackOrders();
      const result = computeStatsFromOrders(list);
      await cache.set(cacheKey, result, 15_000);
      return NextResponse.json(result);
    }

    const [totalOrders, totalRevenue, statusBreakdown, recentOrders] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([{ $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
      Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Order.find().sort({ createdAt: -1 }).limit(5),
    ]);

    const statusCounts = { Pending: 0, Preparing: 0, Delivered: 0 };
    statusBreakdown.forEach((item) => {
      if (Object.prototype.hasOwnProperty.call(statusCounts, item._id)) {
        statusCounts[item._id] = item.count;
      }
    });

    const result = {
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      statusCounts,
      recentOrders,
    };

    await cache.set(cacheKey, result, 15_000);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Stats GET error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
