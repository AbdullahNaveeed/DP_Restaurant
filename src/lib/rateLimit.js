// Very small in-memory rate limiter. Keeps counts per key for a sliding window.
const DEFAULT_WINDOW_MS = 60_000;
const DEFAULT_LIMIT = 60;

class SimpleRateLimiter {
  constructor() {
    this.map = new Map();
  }

  check(key, limit = DEFAULT_LIMIT, windowMs = DEFAULT_WINDOW_MS) {
    const now = Date.now();
    const record = this.map.get(key) || { count: 0, start: now };
    if (now - record.start > windowMs) {
      record.count = 1;
      record.start = now;
      this.map.set(key, record);
      return { limited: false, remaining: limit - 1 };
    }
    record.count += 1;
    this.map.set(key, record);
    const limited = record.count > limit;
    return { limited, remaining: Math.max(0, limit - record.count) };
  }
}

const rateLimiter = global.__APP_RATE_LIMITER || (global.__APP_RATE_LIMITER = new SimpleRateLimiter());

export function checkRateLimit(key, opts = {}) {
  const limit = opts.limit || DEFAULT_LIMIT;
  const windowMs = opts.windowMs || DEFAULT_WINDOW_MS;
  return rateLimiter.check(key, limit, windowMs);
}
