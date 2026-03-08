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

const redis = getRedisClient();

const cache = {
  async get(key) {
    if (redis) {
      try {
        const raw = await redis.get(key);
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
    if (redis) {
      try {
        const ttlSec = Math.max(1, Math.ceil(ttlMs / 1000));
        await redis.set(key, JSON.stringify(value), "EX", ttlSec);
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
    if (redis) {
      try {
        await redis.del(key);
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
    if (redis) {
      try {
        await redis.flushdb();
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


