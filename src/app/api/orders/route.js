import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db/mongoose";
import Order from "@/models/Order";
import { getAdminFromRequest } from "@/lib/auth/jwt";
import { checkRateLimit } from "@/lib/security/rate-limit";
import {
  appendFallbackOrder,
  listFallbackOrders,
} from "@/services/orders/order-fallback.service";

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

    let conn = null;
    try {
      conn = await dbConnect();
    } catch (dbError) {
      console.warn("Order POST DB connect failed, using fallback store:", dbError.message);
      conn = null;
    }

    const body = await req.json();
    const { customerName, phone, address, items, paymentMethod } = body;
    const totalAmount = body.totalAmount ?? body.totalPrice;

    if (!customerName || !phone || !address || !items?.length || totalAmount == null || !paymentMethod) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const normalizedItems = items.map((item) => {
      const menuItemId = String(item.menuItem || "").trim();
      return {
        ...item,
        menuItem: mongoose.Types.ObjectId.isValid(menuItemId) ? menuItemId : undefined,
      };
    });

    const orderPayload = {
      customerName,
      phone,
      address,
      items: normalizedItems,
      totalAmount,
      paymentMethod,
      status: "Pending",
      createdAt: new Date().toISOString(),
    };

    if (!conn) {
      const fallbackOrder = await appendFallbackOrder(orderPayload);
      return NextResponse.json(
        {
          success: true,
          orderId: String(fallbackOrder._id),
          ...fallbackOrder,
        },
        { status: 201 }
      );
    }

    const order = await Order.create(orderPayload);
    return NextResponse.json(
      {
        success: true,
        orderId: String(order._id),
        ...order.toObject(),
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

    let conn = null;
    try {
      conn = await dbConnect();
    } catch (dbError) {
      console.warn("Orders GET DB connect failed, using fallback store:", dbError.message);
      conn = null;
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const filter = {};
    if (status && status !== "All") {
      filter.status = status;
    }

    if (!conn) {
      const list = await listFallbackOrders(filter.status || null);
      return NextResponse.json(list);
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Orders GET error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

