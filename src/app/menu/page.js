import { supabase } from "@/lib/db/supabase";
import MenuClient from "@/features/menu/components/MenuClient";
import ErrorBoundary from "@/components/ErrorBoundary";

export default async function Page({ searchParams }) {
  let items = [];
  try {
    const { data: dbItems, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("is_available", true)
      .order("category")
      .order("name");

    if (error) {
      console.error("Menu list Supabase failed:", error);
    } else if (dbItems) {
      items = dbItems.map((it) => ({
        ...it,
        _id: String(it.id),
        imageURL: it.image_url,
        imageURLs: it.image_urls,
        isAvailable: it.is_available,
      }));
    }
  } catch (e) {
    console.error("Menu list Supabase exception:", e);
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

