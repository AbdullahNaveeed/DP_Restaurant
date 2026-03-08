import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import MenuItem from "@/models/MenuItem";
import { getAdminFromRequest } from "@/lib/auth";
import { FALLBACK_MENU_IMAGE } from "@/lib/menuImage";
import defaultMenu from "@/lib/defaultMenu";

// GET /api/menu/[id] — Public: fetch a single menu item (DB or bundled fallback)
export async function GET(req, context) {
    try {
        const { params } = await context;
        const idFromContext = params?.id;
        // Fallback: parse id from the request URL path (robust for varying runtimes)
        const url = new URL(req.url);
        const idFromPath = String(url.pathname).split("/").filter(Boolean).pop();
        const id = idFromContext || idFromPath;

        if (!id) {
            return NextResponse.json({ error: "Missing id" }, { status: 400 });
        }

        const conn = await dbConnect();

        // If DB unavailable, return the bundled fallback item if present
        if (!conn) {
            const found = defaultMenu.find((m) => String(m._id) === String(id));
            if (!found) {
                return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
            }

            const payload = {
                _id: String(found._id),
                name: found.name,
                description: found.description,
                price: found.price,
                category: found.category,
                imageURL: found.imageURL || FALLBACK_MENU_IMAGE,
                imageURLs: Array.isArray(found.imageURLs) && found.imageURLs.length ? found.imageURLs : [found.imageURL || FALLBACK_MENU_IMAGE],
                variants: Array.isArray(found.variants) ? found.variants : [],
                options: Array.isArray(found.options) ? found.options : [],
                isAvailable: Boolean(found.isAvailable),
            };

            return NextResponse.json(payload, { status: 200 });
        }

        const item = await MenuItem.findById(id).lean();
        if (!item) {
            const found = defaultMenu.find((m) => String(m._id) === String(id));
            if (!found) {
                return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
            }

            const payload = {
                _id: String(found._id),
                name: found.name,
                description: found.description,
                price: found.price,
                category: found.category,
                imageURL: found.imageURL || FALLBACK_MENU_IMAGE,
                imageURLs: Array.isArray(found.imageURLs) && found.imageURLs.length ? found.imageURLs : [found.imageURL || FALLBACK_MENU_IMAGE],
                variants: Array.isArray(found.variants) ? found.variants : [],
                options: Array.isArray(found.options) ? found.options : [],
                isAvailable: Boolean(found.isAvailable),
            };

            return NextResponse.json(payload, { status: 200 });
        }

        const payload = {
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
        };

        return NextResponse.json(payload, { status: 200 });
    } catch (error) {
        console.error("Menu [id] GET error:", error);
        return NextResponse.json({ error: "Failed to load menu item" }, { status: 500 });
    }
}

// PUT /api/menu/[id] — Admin: update menu item
export async function PUT(req, context) {
    try {
        const admin = await getAdminFromRequest(req);
        if (!admin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const conn = await dbConnect();
        if (!conn) {
            return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
        }
        const { params } = await context;
        const { id } = params;
        const body = await req.json();
        const normalizedImageURL = String(body.imageURL || "").trim() || FALLBACK_MENU_IMAGE;
        const normalizedImageURLs = Array.isArray(body.imageURLs) && body.imageURLs.length ? body.imageURLs : [normalizedImageURL];

        const updatePayload = {
            ...body,
            imageURL: normalizedImageURL,
            imageURLs: normalizedImageURLs,
        };

        const item = await MenuItem.findByIdAndUpdate(id, updatePayload, {
            new: true,
            runValidators: true,
        });

        if (!item) {
            return NextResponse.json(
                { error: "Menu item not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(item);
    } catch (error) {
        console.error("Menu PUT error:", error);
        return NextResponse.json(
            { error: "Failed to update menu item" },
            { status: 500 }
        );
    }
}

// DELETE /api/menu/[id] — Admin: delete menu item
export async function DELETE(req, context) {
    try {
        const admin = await getAdminFromRequest(req);
        if (!admin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const conn = await dbConnect();
        if (!conn) {
            return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
        }
        const { params } = await context;
        const { id } = params;

        const item = await MenuItem.findByIdAndDelete(id);
        if (!item) {
            return NextResponse.json(
                { error: "Menu item not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: "Menu item deleted successfully" });
    } catch (error) {
        console.error("Menu DELETE error:", error);
        return NextResponse.json(
            { error: "Failed to delete menu item" },
            { status: 500 }
        );
    }
}
