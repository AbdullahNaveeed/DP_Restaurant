import { NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/auth/jwt";
import { FALLBACK_MENU_IMAGE } from "@/features/menu/constants/images";
import cache from "@/lib/cache";
import { supabase } from "@/lib/db/supabase";
import {
  toPublicMenuPayload,
  buildMenuCacheKeys,
} from "@/services/menu/menu.service";

async function invalidateMenuCache() {
  const keys = buildMenuCacheKeys();
  await Promise.all(keys.map((key) => cache.del(key)));
}

// GET /api/menu/[id] - Public: fetch one item from DB
export async function GET(req, context) {
  try {
    const resolvedParams =
      context?.params && typeof context.params.then === "function"
        ? await context.params
        : context?.params || {};
    let id = resolvedParams?.id;

    if (!id) {
      const url = new URL(req.url);
      id = String(url.pathname).split("/").filter(Boolean).pop();
    }

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const { data: item, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !item) {
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
    }

    const formattedItem = {
      ...item,
      _id: item.id,
      imageURL: item.image_url,
      imageURLs: item.image_urls,
      isAvailable: item.is_available,
    };

    return NextResponse.json(toPublicMenuPayload([formattedItem])[0], { status: 200 });
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

    const resolvedParams =
      context?.params && typeof context.params.then === "function"
        ? await context.params
        : context?.params || {};
    let id = resolvedParams?.id;

    if (!id) {
      const url = new URL(req.url);
      const parts = String(url.pathname).split("/").filter(Boolean);
      id = parts[parts.length - 1]; // e.g. /api/menu/123 -> 123
    }
    const body = await req.json();
    const normalizedImageURL = String(body.imageURL || "").trim() || FALLBACK_MENU_IMAGE;
    const normalizedImageURLs =
      Array.isArray(body.imageURLs) && body.imageURLs.length
        ? body.imageURLs
        : [normalizedImageURL];

    const updateData = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.price !== undefined) updateData.price = Number(body.price);
    if (body.category !== undefined) updateData.category = body.category;
    if (body.isAvailable !== undefined) updateData.is_available = body.isAvailable;
    if (body.variants !== undefined) updateData.variants = body.variants;
    if (body.options !== undefined) updateData.options = body.options;
    updateData.image_url = normalizedImageURL;
    updateData.image_urls = normalizedImageURLs;

    const { data: item, error } = await supabase
      .from("menu_items")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error || !item) {
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
    }

    await invalidateMenuCache();

    const formattedItem = {
      ...item,
      _id: item.id,
      imageURL: item.image_url,
      imageURLs: item.image_urls,
      isAvailable: item.is_available,
    };

    return NextResponse.json(formattedItem);
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

    const resolvedParams =
      context?.params && typeof context.params.then === "function"
        ? await context.params
        : context?.params || {};
    let id = resolvedParams?.id;

    if (!id) {
      const url = new URL(req.url);
      const parts = String(url.pathname).split("/").filter(Boolean);
      id = parts[parts.length - 1]; // e.g. /api/menu/123 -> 123
    }

    const { error } = await supabase
      .from("menu_items")
      .delete()
      .eq("id", id);

    if (error) {
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
