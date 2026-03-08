import defaultMenu from "@/features/menu/data/default-menu";
import { FALLBACK_MENU_IMAGE } from "@/features/menu/constants/images";
import { VALID_MENU_CATEGORIES } from "@/config/menu/categories";

export function normalizeCategory(rawCategory) {
  if (!rawCategory) return null;
  const category = String(rawCategory).trim();
  if (!category || category === "All") return null;

  for (const valid of VALID_MENU_CATEGORIES) {
    if (valid.toLowerCase() === category.toLowerCase()) return valid;
  }

  return category;
}

export function filterFallbackMenu(category, showAll) {
  let items = defaultMenu;
  if (!showAll) items = items.filter((item) => item.isAvailable);
  if (category && category !== "All") {
    items = items.filter((item) => item.category === category);
  }
  return items;
}

export function toPublicMenuPayload(items) {
  return items.map((item) => ({
    _id: String(item._id),
    name: item.name,
    description: item.description,
    price: item.price,
    category: item.category,
    imageURL: item.imageURL || FALLBACK_MENU_IMAGE,
    imageURLs:
      Array.isArray(item.imageURLs) && item.imageURLs.length
        ? item.imageURLs
        : [item.imageURL || FALLBACK_MENU_IMAGE],
    variants: Array.isArray(item.variants) ? item.variants : [],
    options: Array.isArray(item.options) ? item.options : [],
    isAvailable: Boolean(item.isAvailable),
  }));
}

export function getFallbackMenuItemById(id) {
  const found = defaultMenu.find((m) => String(m._id) === String(id));
  if (!found) return null;
  return toPublicMenuPayload([found])[0];
}

export function buildMenuCacheKeys() {
  const keys = new Set();
  const categories = [null, ...VALID_MENU_CATEGORIES];
  const showAllOptions = [false, true];

  for (const category of categories) {
    for (const showAll of showAllOptions) {
      const categoryKey = category || "all";
      keys.add(`menu:category=${categoryKey}:showAll=${showAll}`);
    }
  }

  return [...keys];
}
