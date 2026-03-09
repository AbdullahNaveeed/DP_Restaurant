import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongoose";
import MenuItem from "@/models/MenuItem";
import { getAdminFromRequest } from "@/lib/auth/jwt";
import { FALLBACK_MENU_IMAGE } from "@/features/menu/constants/images";
import cache from "@/lib/cache";
import {
  getFallbackMenuItemById,
  toPublicMenuPayload,
  buildMenuCacheKeys,
} from "@/services/menu/menu.service";

async function invalidateMenuCache() {
  const keys = buildMenuCacheKeys();
  await Promise.all(keys.map((key) => cache.del(key)));
}

// GET /api/menu/[id] - Public: fetch one item from DB or fallback menu
export async function GET(req, context) {
  const isProduction = process.env.NODE_ENV === "production";

  try {
    const { params } = await context;
    const idFromContext = params?.id;
    const url = new URL(req.url);
    const idFromPath = String(url.pathname).split("/").filter(Boolean).pop();
    const id = idFromContext || idFromPath;

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const conn = await dbConnect();

    if (!conn) {
      if (isProduction) {
        return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
      }

      const fallback = getFallbackMenuItemById(id);
      if (!fallback) {
        return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
      }
      return NextResponse.json(fallback, { status: 200 });
    }

    const item = await MenuItem.findById(id).lean();
    if (!item) {
      if (isProduction) {
        return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
      }

      const fallback = getFallbackMenuItemById(id);
      if (!fallback) {
        return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
      }
      return NextResponse.json(fallback, { status: 200 });
    }

    return NextResponse.json(toPublicMenuPayload([item])[0], { status: 200 });
  } catch (error) {
    console.error("Menu [id] GET error:", error);
    return NextResponse.json({ error: "Failed to load menu item" }, { status: 500 });
  }
}

// PUT /api/menu/[id] - Admin: update menu item
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
    const normalizedImageURLs =
      Array.isArray(body.imageURLs) && body.imageURLs.length
        ? body.imageURLs
        : [normalizedImageURL];

    // Extract only editable fields — spreading raw body passes _id, __v,
    // createdAt etc. which causes Mongoose CastError / immutable-field errors.
    const updateData = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.price !== undefined) updateData.price = body.price;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.isAvailable !== undefined) updateData.isAvailable = body.isAvailable;
    if (body.variants !== undefined) updateData.variants = body.variants;
    if (body.options !== undefined) updateData.options = body.options;
    updateData.imageURL = normalizedImageURL;
    updateData.imageURLs = normalizedImageURLs;

    const item = await MenuItem.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!item) {
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
    }

    await invalidateMenuCache();

    return NextResponse.json(item);
  } catch (error) {
    console.error("Menu PUT error:", error);
    if (error.name === "ValidationError") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update menu item" }, { status: 500 });
  }
}

// DELETE /api/menu/[id] - Admin: delete menu item
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
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
    }

    await invalidateMenuCache();

    return NextResponse.json({ message: "Menu item deleted successfully" });
  } catch (error) {
    console.error("Menu DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete menu item" }, { status: 500 });
  }
}

// PATCH /api/menu/[id] - Admin: update menu item (alias for PUT)
export async function PATCH(req, context) {
  return PUT(req, context);
}
