import mongoose from "mongoose";

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  const MONGODB_URI = process.env.MONGODB_URI?.trim();

  if (!MONGODB_URI) {
    console.warn("MONGODB_URI not set — running in degraded mode without DB.");
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
        console.error("MongoDB connection failed:", error.message);
        throw error;
      });
  }

  try {
    const mongooseInstance = await cached.promise;
    if (!mongooseInstance) {
      cached.promise = null;
      return null;
    }
    cached.conn = mongooseInstance;
    return mongooseInstance;
  } catch (error) {
    cached.promise = null;
    console.error("MongoDB connection error:", error.message);
    return null;
  }
}

export default dbConnect;

