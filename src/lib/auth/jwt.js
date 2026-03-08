import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-change-me";

export function signToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch {
        return null;
    }
}

export async function hashPassword(password) {
    return bcrypt.hash(password, 12);
}

export async function comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
}

export function getTokenFromRequest(req) {
    // Check cookie first
    const cookieHeader = req.headers.get("cookie") || "";
    const tokenCookie = cookieHeader
        .split(";")
        .find((c) => c.trim().startsWith("token="));
    if (tokenCookie) {
        return tokenCookie.split("=")[1];
    }

    // Check Authorization header
    const authHeader = req.headers.get("authorization") || "";
    if (authHeader.startsWith("Bearer ")) {
        return authHeader.substring(7);
    }

    return null;
}

export async function getAdminFromRequest(req) {
    const token = getTokenFromRequest(req);
    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "admin") return null;

    return decoded;
}
