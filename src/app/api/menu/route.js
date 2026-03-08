import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongoose";
import MenuItem from "@/models/MenuItem";
import { getAdminFromRequest } from "@/lib/auth/jwt";
import { FALLBACK_MENU_IMAGE } from "@/features/menu/constants/images";
import cache from "@/lib/cache";
import {
  normalizeCategory,
  filterFallbackMenu,
  toPublicMenuPayload,
} from "@/services/menu/menu.service";

// GET /api/menu - Public: list available menu items
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const category = normalizeCategory(searchParams.get("category"));
    const showAll = searchParams.get("all") === "true";
    const cacheKey = `menu:category=${category || "all"}:showAll=${showAll}`;

    const conn = await dbConnect();

    if (!conn) {
      const payload = filterFallbackMenu(category, showAll);
      await cache.set(cacheKey, payload, 30_000);
      return NextResponse.json(payload, {
        headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=120" },
      });
    }

    const cached = await cache.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=120" },
      });
    }

    const filter = showAll ? {} : { isAvailable: true };
    if (category) filter.category = category;

    const items = await MenuItem.find(filter)
      .select("name description price category imageURL imageURLs isAvailable variants options")
      .sort({ category: 1, name: 1 })
      .lean();

    if (items.length === 0) {
      const payload = filterFallbackMenu(category, showAll);
      await cache.set(cacheKey, payload, 30_000);
      return NextResponse.json(payload, {
        headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" },
      });
    }

    const payload = toPublicMenuPayload(items);
    await cache.set(cacheKey, payload, 30_000);
    return NextResponse.json(payload, {
      headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" },
    });
  } catch (error) {
    console.error("Menu GET error:", error);
    const { searchParams } = new URL(req.url);
    const category = normalizeCategory(searchParams.get("category"));
    const showAll = searchParams.get("all") === "true";
    return NextResponse.json(filterFallbackMenu(category, showAll), {
      headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=120" },
    });
  }
}

// POST /api/menu - Admin: create menu item
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
    const {
      name,
      description,
      price,
      category,
      imageURL,
      imageURLs,
      isAvailable,
      variants,
      options,
    } = body;

    const normalizedImageURL = String(imageURL || "").trim() || FALLBACK_MENU_IMAGE;
    const normalizedImageURLs =
      Array.isArray(imageURLs) && imageURLs.length ? imageURLs : [normalizedImageURL];

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
    return NextResponse.json({ error: "Failed to create menu item" }, { status: 500 });
  }
}
