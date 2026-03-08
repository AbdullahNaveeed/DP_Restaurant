import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import fs from "fs";
import path from "path";
import { getAdminFromRequest } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rateLimit";
import getRedisClient from "@/lib/redisClient";

// POST /api/orders — Public: place a new order
export async function POST(req) {
    try {
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
        const rl = checkRateLimit(`orders_post:${ip}`, { limit: 30, windowMs: 60_000 });
        if (rl.limited) {
            return NextResponse.json({ error: "Too many requests" }, { status: 429 });
        }

        const conn = await dbConnect();
        const body = await req.json();
        const { customerName, phone, address, items, totalAmount, paymentMethod } = body;

        if (!customerName || !phone || !address || !items?.length || !totalAmount || !paymentMethod) {
            return NextResponse.json(
                { error: "All fields are required" },
                { status: 400 }
            );
        }

        // Build a job payload
        const jobPayload = {
            customerName,
            phone,
            address,
            items,
            totalAmount,
            paymentMethod,
            status: "Pending",
            createdAt: new Date().toISOString(),
        };

        // Prefer enqueuing to Redis queue if available (decouples writes)
        const redis = getRedisClient();
        if (redis) {
            try {
                await redis.lpush("queue:orders", JSON.stringify(jobPayload));
                return NextResponse.json({ message: "Order queued" }, { status: 202 });
            } catch (e) {
                console.error("Failed to enqueue order:", e);
                // fall through to DB or fallback
            }
        }

        // If Redis unavailable, write to DB if connected
        if (conn) {
            const order = await Order.create(jobPayload);
            return NextResponse.json(order, { status: 201 });
        }

        // Last-resort: persist to fallback file in background and return quickly
        (async () => {
            try {
                const fallbackDir = path.resolve(process.cwd(), "temp_init");
                await fs.promises.mkdir(fallbackDir, { recursive: true });
                const file = path.join(fallbackDir, "fallback-orders.json");
                let list = [];
                try {
                    const raw = await fs.promises.readFile(file, "utf8");
                    list = JSON.parse(raw || "[]");
                } catch (e) {
                    // ignore read errors — we'll create a new file
                }

                const fallbackOrder = { _id: `fallback-${Date.now()}`, ...jobPayload };
                list.unshift(fallbackOrder);
                await fs.promises.writeFile(file, JSON.stringify(list, null, 2), "utf8");
            } catch (fsErr) {
                console.error("Failed to write fallback order (background):", fsErr);
            }
        })();

        return NextResponse.json({ message: "Order accepted (offline)" }, { status: 201 });
    } catch (error) {
        console.error("Order POST error:", error);
        return NextResponse.json(
            { error: "Failed to place order" },
            { status: 500 }
        );
    }
}

// GET /api/orders — Admin: list all orders
export async function GET(req) {
    try {
        const admin = await getAdminFromRequest(req);
        if (!admin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

            const conn = await dbConnect();
            const { searchParams } = new URL(req.url);
            const status = searchParams.get("status");

            const filter = {};
            if (status && status !== "All") {
                filter.status = status;
            }

            // If DB is down, return orders from fallback file
            if (!conn) {
                try {
                    const file = path.resolve(process.cwd(), "temp_init", "fallback-orders.json");
                    const raw = await fs.promises.readFile(file, "utf8");
                    let list = JSON.parse(raw || "[]");
                    if (filter.status) {
                        list = list.filter((o) => o.status === filter.status);
                    }
                    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    return NextResponse.json(list);
                } catch (e) {
                    return NextResponse.json([], { status: 200 });
                }
            }

            const orders = await Order.find(filter).sort({ createdAt: -1 });
            return NextResponse.json(orders);
    } catch (error) {
        console.error("Orders GET error:", error);
        return NextResponse.json(
            { error: "Failed to fetch orders" },
            { status: 500 }
        );
    }
}
