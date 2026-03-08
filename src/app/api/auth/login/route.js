import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongoose";
import User from "@/models/User";
import { comparePassword, signToken } from "@/lib/auth/jwt";
import { checkRateLimit } from "@/lib/security/rate-limit";

export async function POST(req) {
    try {
        // Basic rate limiting by IP to prevent brute-force attempts
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
        const rl = checkRateLimit(`login:${ip}`, { limit: 10, windowMs: 60_000 });
        if (rl.limited) {
            return NextResponse.json({ error: "Too many requests" }, { status: 429 });
        }

        const conn = await dbConnect();
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }

        // If DB is unavailable, allow demo admin credentials as a fallback
        if (!conn) {
            const demoEmail = "admin@ghanishinwari.com";
            const demoPass = "admin123";
            if (email === demoEmail && password === demoPass) {
                const token = signToken({ userId: "fallback-admin", email, role: "admin", name: "Admin" });
                const response = NextResponse.json({ message: "Login successful", user: { name: "Admin", email, role: "admin" } });
                response.cookies.set("token", token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    maxAge: 60 * 60 * 24 * 7,
                    path: "/",
                });
                return response;
            }

            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            );
        }

        const isValid = await comparePassword(password, user.password);
        if (!isValid) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            );
        }

        const token = signToken({
            userId: user._id,
            email: user.email,
            role: user.role,
            name: user.name,
        });

        const response = NextResponse.json({
            message: "Login successful",
            user: { name: user.name, email: user.email, role: user.role },
        });

        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/",
        });

        return response;
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

