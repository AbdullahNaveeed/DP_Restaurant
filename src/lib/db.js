import mongoose from "mongoose";

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI) {
        console.warn("MONGODB_URI not set — running in degraded mode without DB.");
        return null;
    }

    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const minPoolSize = Number(process.env.MONGODB_MIN_POOL_SIZE || 2);
        const maxPoolSize = Number(process.env.MONGODB_MAX_POOL_SIZE || 10);
        const opts = {
            bufferCommands: false,
            serverSelectionTimeoutMS: 3000,
            minPoolSize,
            maxPoolSize,
        };

        // Start connection attempt in background and do not block the request flow.
        // The application routes already handle a null return value and fall back
        // to bundled data or error responses when the DB is not available.
        cached.promise = mongoose
            .connect(MONGODB_URI, opts)
            .then((mongooseInstance) => {
                cached.conn = mongooseInstance;
                return mongooseInstance;
            })
            .catch((e) => {
                cached.promise = null;
                console.error("Background MongoDB connection failed:", e);
                return null;
            });

        // Do not await the connection on the first call — return quickly and let
        // caller proceed in degraded mode. Subsequent calls will return the
        // established connection if available.
        return null;
    }

    // If a connection promise is already in-flight but not yet established,
    // do not block; return null so the request can proceed in degraded mode.
    // Once the background connection completes, `cached.conn` will be set and
    // future calls will immediately receive the connection.
    if (cached.conn) return cached.conn;

    return null;
}

export default dbConnect;
