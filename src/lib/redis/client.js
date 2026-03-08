let client = null;

export default function getRedisClient() {
  if (client) return client;
  const url = process.env.REDIS_URL;
  if (!url) return null;

  try {
    // Dynamic import avoids crashing the module if ioredis is unavailable or
    // fails to initialise (e.g. on Vercel serverless cold-starts).
    const Redis = require("ioredis");

    client = new Redis(url, {
      maxRetriesPerRequest: null,
      enableAutoPipelining: true,
      lazyConnect: true,           // don't open TCP until first command
      connectTimeout: 5000,
      retryStrategy(times) {
        if (times > 3) return null; // stop retrying after 3 attempts
        return Math.min(times * 200, 2000);
      },
    });

    client.on("error", (err) => {
      console.error("Redis error:", err && err.message ? err.message : err);
    });

    return client;
  } catch (err) {
    console.warn("Redis client init failed, running without Redis:", err.message);
    client = null;
    return null;
  }
}
