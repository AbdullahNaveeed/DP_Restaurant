import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import { getAdminFromRequest } from "@/lib/auth";
import fs from "fs";
import path from "path";

// PATCH /api/orders/[id] — Admin: update order status
export async function PATCH(req, context) {
    try {
        const admin = await getAdminFromRequest(req);
        if (!admin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const conn = await dbConnect();
        const params = context?.params ?? (await context)?.params ?? {};
        let id = params.id;
        // Fallback: extract id from request URL if context params are missing
        if (!id) {
            try {
                const url = new URL(req.url);
                const parts = url.pathname.split('/').filter(Boolean);
                id = parts[parts.length - 1];
            } catch (e) {
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

        // If DB isn't available, update the fallback orders file
        if (!conn) {
            try {
                const file = path.resolve(process.cwd(), "temp_init", "fallback-orders.json");
                const raw = await fs.promises.readFile(file, "utf8");
                const list = JSON.parse(raw || "[]");
                const matchId = (a, b) => {
                    try {
                        const A = String(a).trim();
                        const B = String(b).trim();
                        if (A === B) return true;
                        if (A.includes(B) || B.includes(A)) return true;
                        return false;
                    } catch {
                        return false;
                    }
                };

                const idx = list.findIndex((o) => matchId(o._id, id));
                // debug log for id matching
                try {
                    const dbg = { id, listIds: list.map((o) => o._id), idx };
                    await fs.promises.writeFile(path.resolve(process.cwd(), 'temp_init', 'patch-debug.json'), JSON.stringify(dbg, null, 2), 'utf8');
                } catch (e) {
                    // ignore logging errors
                }
                if (idx === -1) {
                    return NextResponse.json({ error: "Order not found" }, { status: 404 });
                }

                const current = list[idx].status;

                if (current === "Delivered") {
                    return NextResponse.json({ error: "Order already delivered" }, { status: 400 });
                }

                if (NEXT[current] !== status) {
                    return NextResponse.json({ error: "Invalid status transition" }, { status: 400 });
                }

                list[idx].status = status;
                await fs.promises.writeFile(file, JSON.stringify(list, null, 2), "utf8");
                return NextResponse.json(list[idx]);
            } catch (e) {
                console.error("Fallback order update error:", e);
                return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
            }
        }

        const order = await Order.findById(id);

        if (!order) {
            // If order wasn't found in DB, attempt to update fallback file as a last resort
            try {
                const file = path.resolve(process.cwd(), "temp_init", "fallback-orders.json");
                const raw = await fs.promises.readFile(file, "utf8");
                const list = JSON.parse(raw || "[]");

                const matchId = (a, b) => {
                    try {
                        const A = String(a).trim();
                        const B = String(b).trim();
                        if (A === B) return true;
                        if (A.includes(B) || B.includes(A)) return true;
                        return false;
                    } catch {
                        return false;
                    }
                };

                const idx = list.findIndex((o) => matchId(o._id, id));
                if (idx === -1) {
                    return NextResponse.json({ error: "Order not found" }, { status: 404 });
                }

                const current = list[idx].status;

                if (current === "Delivered") {
                    return NextResponse.json({ error: "Order already delivered" }, { status: 400 });
                }

                if (NEXT[current] !== status) {
                    return NextResponse.json({ error: "Invalid status transition" }, { status: 400 });
                }

                list[idx].status = status;
                await fs.promises.writeFile(file, JSON.stringify(list, null, 2), "utf8");
                return NextResponse.json(list[idx]);
            } catch (e) {
                console.error("Fallback order update error (db branch):", e);
                return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
            }
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

        return NextResponse.json(order);
    } catch (error) {
        console.error("Order PATCH error:", error);
        return NextResponse.json(
            { error: "Failed to update order" },
            { status: 500 }
        );
    }
}
