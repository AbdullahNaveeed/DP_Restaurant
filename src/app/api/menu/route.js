import { NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/auth/jwt";
import { FALLBACK_MENU_IMAGE } from "@/features/menu/constants/images";
import cache from "@/lib/cache";
import { supabase } from "@/lib/db/supabase";
import {
  normalizeCategory,
  toPublicMenuPayload,
  buildMenuCacheKeys,
} from "@/services/menu/menu.service";

async function invalidateMenuCache() {
  const keys = buildMenuCacheKeys();
  await Promise.all(keys.map((key) => cache.del(key)));
}

// GET /api/menu - Public: list available menu items
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const category = normalizeCategory(searchParams.get("category"));
    const showAll = searchParams.get("all") === "true";
    const cacheKey = `menu:category=${category || "all"}:showAll=${showAll}`;

    // Try cache first
    const cached = await cache.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=120" },
      });
    }

    let query = supabase.from("menu_items").select("*");
    
    if (!showAll) {
      query = query.eq("is_available", true);
    }
    if (category) {
      query = query.eq("category", category);
    }

    const { data: items, error } = await query.order('category').order('name');
    
    if (error) {
      throw error;
    }

    // Map snake_case to camelCase
    const formattedItems = items.map(item => ({
      ...item,
      _id: item.id,
      imageURL: item.image_url,
      imageURLs: item.image_urls,
      isAvailable: item.is_available,
    }));

    const payload = toPublicMenuPayload(formattedItems);
    await cache.set(cacheKey, payload, 30_000);
    return NextResponse.json(payload, {
      headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" },
    });
  } catch (error) {
    console.error("Menu GET error:", error);
    return NextResponse.json({ error: "Failed to fetch menu items" }, { status: 500 });
  }
}

// POST /api/menu - Admin: create menu item
export async function POST(req) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    const insertPayload = {
      name,
      description,
      price: Number(price),
      category,
      image_url: normalizedImageURL,
      image_urls: normalizedImageURLs,
      is_available: isAvailable !== false,
      variants: Array.isArray(variants) ? variants : [],
      options: Array.isArray(options) ? options : [],
    };

    const { data: item, error } = await supabase
      .from("menu_items")
      .insert([insertPayload])
      .select()
      .single();

    if (error) {
      throw error;
    }

    await invalidateMenuCache();

    // Format for frontend
    const formattedItem = {
      ...item,
      _id: item.id,
      imageURL: item.image_url,
      imageURLs: item.image_urls,
      isAvailable: item.is_available,
    };

    return NextResponse.json(formattedItem, { status: 201 });
  } catch (error) {
    console.error("Menu POST error:", error);
    return NextResponse.json({ error: "Failed to create menu item" }, { status: 500 });
  }
}
