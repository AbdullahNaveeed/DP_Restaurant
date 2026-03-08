import mongoose from "mongoose";

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  const MONGODB_URI = process.env.MONGODB_URI?.trim();
  const isProduction = process.env.NODE_ENV === "production";

  if (!MONGODB_URI) {
    if (isProduction) {
      throw new Error("MONGODB_URI is not configured in production.");
    }
    console.warn("MONGODB_URI not set - running in degraded mode without DB.");
    return null;
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const minPoolSize = Number(process.env.MONGODB_MIN_POOL_SIZE || 1);
    const maxPoolSize = Number(process.env.MONGODB_MAX_POOL_SIZE || 10);

    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 8000,
        minPoolSize,
        maxPoolSize,
        maxIdleTimeMS: 30_000,
      })
      .then((mongooseInstance) => mongooseInstance)
      .catch((error) => {
        cached.promise = null;
        throw error;
      });
  }

  const mongooseInstance = await cached.promise;
  cached.conn = mongooseInstance;
  return mongooseInstance;
}

export default dbConnect;
