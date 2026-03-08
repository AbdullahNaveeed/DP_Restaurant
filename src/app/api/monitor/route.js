import { NextResponse } from "next/server";
import getRedisClient from "@/lib/redisClient";

// GET /api/monitor — exposes lightweight runtime metrics (JSON)
export async function GET() {
  try {
    const metrics = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      env: process.env.NODE_ENV || "development",
      timestamp: Date.now(),
    };

    const redis = getRedisClient();
    if (redis) {
      try {
        const qlen = await redis.llen("queue:orders");
        metrics.redis = { queueLength: Number(qlen) };
      } catch (e) {
        metrics.redis = { error: e && e.message ? e.message : String(e) };
      }
    }

    return NextResponse.json(metrics, { status: 200 });
  } catch (e) {
    console.error("Monitor endpoint error:", e);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
