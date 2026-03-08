import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { hashPassword, signToken } from "@/lib/auth";

export async function POST(req) {
    try {
        const conn = await dbConnect();
        if (!conn) {
            return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
        }
        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json(
                { error: "Name, email, and password are required" },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: "Password must be at least 6 characters" },
                { status: 400 }
            );
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return NextResponse.json(
                { error: "Email already registered" },
                { status: 409 }
            );
        }

        const hashedPassword = await hashPassword(password);
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: "user",
        });

        const token = signToken({
            userId: user._id,
            email: user.email,
            role: user.role,
            name: user.name,
        });

        const response = NextResponse.json(
            {
                message: "Registration successful",
                user: { name: user.name, email: user.email, role: user.role },
            },
            { status: 201 }
        );

        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
        });

        return response;
    } catch (error) {
        console.error("Register error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
