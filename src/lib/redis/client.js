import Redis from "ioredis";

let client = null;

export default function getRedisClient() {
  if (client) return client;
  const url = process.env.REDIS_URL;
  if (!url) return null;

  client = new Redis(url, {
    maxRetriesPerRequest: null,
    enableAutoPipelining: true,
  });

  client.on("error", (err) => {
    console.error("Redis error:", err && err.message ? err.message : err);
  });

  return client;
}
