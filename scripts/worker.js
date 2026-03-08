/*
  Simple worker that processes orders from Redis list `queue:orders`.
  - Connects to Redis (REDIS_URL)
  - Blocks on BRPOP for queue entries
  - Tries to insert into MongoDB if MONGODB_URI is available
  - Falls back to writing to `temp_init/fallback-orders.json` if DB unavailable

  Run with: `node scripts/worker.js`
*/

const Redis = require("ioredis");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const MONGODB_URI = process.env.MONGODB_URI || null;

const redis = new Redis(REDIS_URL);

redis.on("error", (e) => console.error("Worker Redis error:", e && e.message ? e.message : e));

async function connectMongo() {
  if (!MONGODB_URI) return null;
  try {
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    });
    return mongoose.connection;
  } catch (e) {
    console.error("Worker failed to connect MongoDB:", e);
    return null;
  }
}

const OrderSchema = new mongoose.Schema(
  {
    customerName: String,
    phone: String,
    address: String,
    items: Array,
    totalAmount: Number,
    paymentMethod: String,
    status: String,
  },
  { timestamps: true }
);

async function processJob(job) {
  try {
    if (mongoose.connection.readyState === 1) {
      const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);
      await Order.create(job);
      console.log("Processed order into DB:", job.customerName || job._id || "(anonymous)");
      return;
    }

    // fallback: write to file
    const fallbackDir = path.resolve(process.cwd(), "temp_init");
    await fs.promises.mkdir(fallbackDir, { recursive: true });
    const file = path.join(fallbackDir, "fallback-orders.json");
    let list = [];
    try {
      const raw = await fs.promises.readFile(file, "utf8");
      list = JSON.parse(raw || "[]");
    } catch (e) {
      // ignore
    }
    const fallbackOrder = { _id: `fallback-${Date.now()}`, ...job };
    list.unshift(fallbackOrder);
    await fs.promises.writeFile(file, JSON.stringify(list, null, 2), "utf8");
    console.log("Wrote fallback order:", fallbackOrder._id);
  } catch (e) {
    console.error("Failed to process job:", e);
  }
}

async function run() {
  console.log("Worker starting — connecting to MongoDB (if configured) and Redis...");
  if (MONGODB_URI) {
    await connectMongo();
  }

  while (true) {
    try {
      // BRPOP returns [key, value]
      const res = await redis.brpop("queue:orders", 0);
      if (res && res[1]) {
        let job = null;
        try {
          job = JSON.parse(res[1]);
        } catch (e) {
          console.error("Worker: invalid job payload", e);
          continue;
        }
        await processJob(job);
      }
    } catch (err) {
      console.error("Worker loop error:", err);
      // backoff
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

run().catch((e) => {
  console.error("Worker fatal error:", e);
  process.exit(1);
});
