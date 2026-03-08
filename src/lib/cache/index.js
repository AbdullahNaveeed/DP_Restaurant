import getRedisClient from "@/lib/redis/client";

// Simple in-memory TTL cache used as a fallback when Redis isn't configured.
class TTLCache {
  constructor() {
    this.store = new Map();
  }

  set(key, value, ttlMs = 30_000) {
    const expires = Date.now() + ttlMs;
    this.store.set(key, { value, expires });
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expires) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  del(key) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }
}

const fallback = global.__APP_TTL_CACHE || (global.__APP_TTL_CACHE = new TTLCache());

// Lazy-load Redis: do NOT call getRedisClient() at module scope.
// Eager initialization was crashing Vercel serverless functions and causing
// all API routes to return 404.
function redis() {
  try {
    return getRedisClient();
  } catch {
    return null;
  }
}

const cache = {
  async get(key) {
    const r = redis();
    if (r) {
      try {
        const raw = await r.get(key);
        if (raw == null) return null;
        return JSON.parse(raw);
      } catch (e) {
        console.error("cache: redis GET error:", e && e.message ? e.message : e);
        return fallback.get(key);
      }
    }
    return fallback.get(key);
  },

  async set(key, value, ttlMs = 30_000) {
    const r = redis();
    if (r) {
      try {
        const ttlSec = Math.max(1, Math.ceil(ttlMs / 1000));
        await r.set(key, JSON.stringify(value), "EX", ttlSec);
        return true;
      } catch (e) {
        console.error("cache: redis SET error:", e && e.message ? e.message : e);
        fallback.set(key, value, ttlMs);
        return false;
      }
    }
    fallback.set(key, value, ttlMs);
    return true;
  },

  async del(key) {
    const r = redis();
    if (r) {
      try {
        await r.del(key);
        return true;
      } catch (e) {
        console.error("cache: redis DEL error:", e && e.message ? e.message : e);
        fallback.del(key);
        return false;
      }
    }
    fallback.del(key);
    return true;
  },

  async clear() {
    const r = redis();
    if (r) {
      try {
        await r.flushdb();
        return true;
      } catch (e) {
        console.error("cache: redis FLUSH error:", e && e.message ? e.message : e);
        fallback.clear();
        return false;
      }
    }
    fallback.clear();
    return true;
  },
};

export default cache;
