import dbConnect from "@/lib/db/mongoose";
import MenuItem from "@/models/MenuItem";
import DEFAULT_MENU from "@/features/menu/data/default-menu";
import MenuClient from "@/features/menu/components/MenuClient";
import ErrorBoundary from "@/components/ErrorBoundary";

export default async function Page({ searchParams }) {
  // Attempt a background DB connect; only query if a working connection
  const conn = await dbConnect();

  let items = [];
  try {
    if (conn) {
      const dbItems = await MenuItem.find({ isAvailable: true })
        .select("name description price category imageURL imageURLs isAvailable variants options _id")
        .sort({ category: 1, name: 1 })
        .lean();

      items = dbItems.map((it) => ({ ...it, _id: String(it._id) }));
    }
  } catch (e) {
    console.error("Menu list DB failed:", e);
    items = [];
  }

  if (!items || items.length === 0) {
    items = DEFAULT_MENU.filter((m) => m.isAvailable).map((m) => ({ ...m }));
  }

  // Server-side category filter fallback: if ?category=... is provided, filter items
  // `searchParams` may be a Promise in some Next.js dev/runtime modes â€” resolve safely.
  const resolvedSearchParams =
    searchParams && typeof searchParams.then === "function" ? await searchParams : searchParams || {};
  const requestedCategory = String(resolvedSearchParams.category || "").trim();

  // Keep a copy of the full set for UI counts etc, then apply filtering to the displayed items.
  const fullItems = Array.isArray(items) ? items.map((m) => ({ ...m })) : [];

  if (requestedCategory) {
    const rc = requestedCategory.toLowerCase();
    items = items.filter((it) => String(it.category || "").trim().toLowerCase() === rc);
  }

  return (
    <ErrorBoundary>
      <MenuClient
        initialItems={items}
        initialAllItems={fullItems}
        initialSelectedCategory={requestedCategory || "All"}
      />
    </ErrorBoundary>
  );
}

