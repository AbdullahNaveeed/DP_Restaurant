import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongoose";
import MenuItem from "@/models/MenuItem";
import { getAdminFromRequest } from "@/lib/auth/jwt";
import { FALLBACK_MENU_IMAGE } from "@/features/menu/constants/images";
import {
  getFallbackMenuItemById,
  toPublicMenuPayload,
} from "@/services/menu/menu.service";

// GET /api/menu/[id] - Public: fetch one item from DB or fallback menu
export async function GET(req, context) {
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
      const fallback = getFallbackMenuItemById(id);
      if (!fallback) {
        return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
      }
      return NextResponse.json(fallback, { status: 200 });
    }

    const item = await MenuItem.findById(id).lean();
    if (!item) {
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

    const item = await MenuItem.findByIdAndUpdate(
      id,
      {
        ...body,
        imageURL: normalizedImageURL,
        imageURLs: normalizedImageURLs,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!item) {
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error("Menu PUT error:", error);
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

    return NextResponse.json({ message: "Menu item deleted successfully" });
  } catch (error) {
    console.error("Menu DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete menu item" }, { status: 500 });
  }
}
