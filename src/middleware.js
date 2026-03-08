import { NextResponse } from "next/server";

export function middleware(request) {
    const { pathname } = request.nextUrl;

    // Protect all /admin routes except /admin/login
    if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
        const token = request.cookies.get("token")?.value;

        if (!token) {
            const loginUrl = new URL("/admin/login", request.url);
            return NextResponse.redirect(loginUrl);
        }

        // Basic JWT structure validation (full verification happens in API routes)
        try {
            const parts = token.split(".");
            if (parts.length !== 3) {
                throw new Error("Invalid token");
            }
            const payload = JSON.parse(atob(parts[1]));
            if (payload.role !== "admin") {
                throw new Error("Not admin");
            }
            // Check expiry
            if (payload.exp && payload.exp * 1000 < Date.now()) {
                throw new Error("Token expired");
            }
        } catch {
            const loginUrl = new URL("/admin/login", request.url);
            const response = NextResponse.redirect(loginUrl);
            response.cookies.delete("token");
            return response;
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*"],
};
