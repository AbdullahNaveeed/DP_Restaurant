import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import { getAdminFromRequest } from "@/lib/auth";
import fs from "fs";
import path from "path";
import cache from "@/lib/cache";

// GET /api/admin/stats — Admin: get dashboard analytics
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

        // If DB is unavailable, compute stats from fallback orders file
        if (!conn) {
            try {
                const file = path.resolve(process.cwd(), "temp_init", "fallback-orders.json");
                const raw = await fs.promises.readFile(file, "utf8");
                const list = JSON.parse(raw || "[]");

                const totalOrders = list.length;
                const totalRevenue = list.reduce((s, o) => s + (Number(o.totalAmount) || 0), 0);
                const statusCounts = { Pending: 0, Preparing: 0, Delivered: 0 };
                list.forEach((o) => {
                    if (statusCounts.hasOwnProperty(o.status)) statusCounts[o.status]++;
                });
                const recentOrders = list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

                const result = { totalOrders, totalRevenue, statusCounts, recentOrders };
                await cache.set(cacheKey, result, 15_000);
                return NextResponse.json(result);
            } catch (e) {
                console.error("Failed to read fallback orders for stats:", e);
                return NextResponse.json({ totalOrders: 0, totalRevenue: 0, statusCounts: { Pending: 0, Preparing: 0, Delivered: 0 }, recentOrders: [] });
            }
        }
        const [totalOrders, totalRevenue, statusBreakdown, recentOrders] = await Promise.all([
            Order.countDocuments(),
            Order.aggregate([{ $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
            Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
            Order.find().sort({ createdAt: -1 }).limit(5),
        ]);

        const statusCounts = { Pending: 0, Preparing: 0, Delivered: 0 };
        statusBreakdown.forEach((s) => {
            if (statusCounts.hasOwnProperty(s._id)) {
                statusCounts[s._id] = s.count;
            }
        });

        const result = { totalOrders, totalRevenue: totalRevenue[0]?.total || 0, statusCounts, recentOrders };
        await cache.set(cacheKey, result, 15_000);
        return NextResponse.json(result);
    } catch (error) {
        console.error("Stats GET error:", error);
        return NextResponse.json(
            { error: "Failed to fetch stats" },
            { status: 500 }
        );
    }
}
