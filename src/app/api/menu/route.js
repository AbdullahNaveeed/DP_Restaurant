import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import MenuItem from "@/models/MenuItem";
import { getAdminFromRequest } from "@/lib/auth";
import defaultMenu from "@/lib/defaultMenu";
import { FALLBACK_MENU_IMAGE } from "@/lib/menuImage";
import cache from "@/lib/cache";

const VALID_CATEGORIES = new Set([
    "Starters",
    "Main Course",
    "Desserts",
    "Drinks",
    "Specials",
]);

function normalizeCategory(rawCategory) {
    if (!rawCategory) {
        return null;
    }

    const category = String(rawCategory).trim();
    if (!category || category === "All") {
        return null;
    }

    for (const valid of VALID_CATEGORIES) {
        if (valid.toLowerCase() === category.toLowerCase()) {
            return valid;
        }
    }

    return category;
}

function filterFallbackMenu(category, showAll) {
    let items = defaultMenu;

    if (!showAll) {
        items = items.filter((item) => item.isAvailable);
    }
    if (category && category !== "All") {
        items = items.filter((item) => item.category === category);
    }

    return items;
}

function toPublicMenuPayload(items) {
    return items.map((item) => ({
        _id: String(item._id),
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        imageURL: item.imageURL || FALLBACK_MENU_IMAGE,
        imageURLs: Array.isArray(item.imageURLs) && item.imageURLs.length ? item.imageURLs : [item.imageURL || FALLBACK_MENU_IMAGE],
        variants: Array.isArray(item.variants) ? item.variants : [],
        options: Array.isArray(item.options) ? item.options : [],
        isAvailable: Boolean(item.isAvailable),
    }));
}

// GET /api/menu — Public: list available menu items
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const category = normalizeCategory(searchParams.get("category"));
        const showAll = searchParams.get("all") === "true";
        const cacheKey = `menu:category=${category || "all"}:showAll=${showAll}`;

        const conn = await dbConnect();

        // If DB isn't available, return the bundled fallback quickly
        if (!conn) {
            const payload = filterFallbackMenu(category, showAll);
            await cache.set(cacheKey, payload, 30_000);
            return NextResponse.json(payload, {
                headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=120" },
            });
        }

        // Try cache first (Redis or in-memory fallback)
        const cached = await cache.get(cacheKey);
        if (cached) {
            return NextResponse.json(cached, {
                headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=120" },
            });
        }

        const filter = showAll ? {} : { isAvailable: true };
        if (category) {
            filter.category = category;
        }

        const items = await MenuItem.find(filter)
            .select("name description price category imageURL imageURLs isAvailable variants options")
            .sort({ category: 1, name: 1 })
            .lean();
        if (items.length === 0) {
            const payload = filterFallbackMenu(category, showAll);
            await cache.set(cacheKey, payload, 30_000);
            return NextResponse.json(payload, {
                headers: {
                    "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
                },
            });
        }
        const payload = toPublicMenuPayload(items);
        await cache.set(cacheKey, payload, 30_000);
        return NextResponse.json(payload, {
            headers: {
                "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
            },
        });
    } catch (error) {
        console.error("Menu GET error:", error);
        const { searchParams } = new URL(req.url);
        const category = normalizeCategory(searchParams.get("category"));
        const showAll = searchParams.get("all") === "true";
        return NextResponse.json(filterFallbackMenu(category, showAll), {
            headers: {
                "Cache-Control": "public, max-age=30, stale-while-revalidate=120",
            },
        });
    }
}

// POST /api/menu — Admin: create menu item
export async function POST(req) {
    try {
        const admin = await getAdminFromRequest(req);
        if (!admin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const conn = await dbConnect();
        if (!conn) {
            return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
        }
        const body = await req.json();
        const { name, description, price, category, imageURL, imageURLs, isAvailable, variants, options } = body;
        const normalizedImageURL = String(imageURL || "").trim() || FALLBACK_MENU_IMAGE;
        const normalizedImageURLs = Array.isArray(imageURLs) && imageURLs.length ? imageURLs : [normalizedImageURL];

        if (!name || !description || price == null || !category || !normalizedImageURL) {
            return NextResponse.json(
                { error: "Name, description, price, category, and imageURL are required" },
                { status: 400 }
            );
        }

        const item = await MenuItem.create({
            name,
            description,
            price,
            category,
            imageURL: normalizedImageURL,
            imageURLs: normalizedImageURLs,
            isAvailable: isAvailable !== false,
            variants: Array.isArray(variants) ? variants : [],
            options: Array.isArray(options) ? options : [],
        });

        return NextResponse.json(item, { status: 201 });
    } catch (error) {
        console.error("Menu POST error:", error);
        return NextResponse.json(
            { error: "Failed to create menu item" },
            { status: 500 }
        );
    }
}
