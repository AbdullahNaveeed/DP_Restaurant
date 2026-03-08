"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { apiRequest } from "@/lib/api";

const MenuCard = dynamic(() => import("@/components/MenuCard"));

const DEFAULT_CATEGORIES = [
  "All",
  "Starters",
  "Main Course",
  "Desserts",
  "Drinks",
  "Specials",
];

const MENU_CACHE_KEY = "menu_cache_v1";
const MENU_CACHE_TTL_MS = 60_000;

export default function MenuClient({ initialItems = [], initialAllItems = null, initialSelectedCategory = "All" }) {
  const [allItems, setAllItems] = useState((initialAllItems && initialAllItems.length ? initialAllItems : initialItems) || []);
  const [selectedCategory, setSelectedCategory] = useState(initialSelectedCategory || "All");
  const [loading, setLoading] = useState(!initialItems || initialItems.length === 0);
  const [error, setError] = useState(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Try cached client data first
      if (typeof window !== "undefined") {
        const cachedRaw = window.sessionStorage.getItem(MENU_CACHE_KEY);
        if (cachedRaw) {
          try {
            const cached = JSON.parse(cachedRaw);
            const isFresh =
              Array.isArray(cached?.items) &&
              typeof cached?.timestamp === "number" &&
              Date.now() - cached.timestamp < MENU_CACHE_TTL_MS;
            if (isFresh) {
              setAllItems(cached.items);
              setLoading(false);
              return;
            }
          } catch {
            window.sessionStorage.removeItem(MENU_CACHE_KEY);
          }
        }
      }

      const data = await apiRequest("/api/menu");
      const normalized = Array.isArray(data) ? data : [];
      setAllItems(normalized);

      if (typeof window !== "undefined") {
        try {
          window.sessionStorage.setItem(
            MENU_CACHE_KEY,
            JSON.stringify({ items: normalized, timestamp: Date.now() })
          );
        } catch {
          // ignore storage errors
        }
      }
    } catch (err) {
      console.error("Menu fetch error:", err);
      setError(err.message || "Failed to load menu items. Please try again.");
      setAllItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Revalidate in background on mount to keep data fresh
    fetchItems();
  }, [fetchItems]);

  const categories = useMemo(() => {
    // Use the fixed category list. (Keeps UI predictable; add discovered categories if desired.)
    return DEFAULT_CATEGORIES;
  }, []);

  const filteredItems = useMemo(() => {
    if (!Array.isArray(allItems)) return [];
    if (selectedCategory === "All") return allItems;
    return allItems.filter(
      (item) => String(item.category || "").trim().toLowerCase() === String(selectedCategory).toLowerCase()
    );
  }, [allItems, selectedCategory]);

  const categoryCounts = useMemo(() => {
    const counts = allItems.reduce((acc, item) => {
      const key = String(item.category || "").trim().toLowerCase();
      if (key) acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    counts.all = allItems.length;
    return counts;
  }, [allItems]);

  useEffect(() => {
    if (!categories.includes(selectedCategory)) {
      setSelectedCategory("All");
    }
  }, [categories, selectedCategory]);

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <Navbar />

      <main className="flex-1 pb-12 pt-20 sm:pb-20 sm:pt-24">
        <div className="mx-auto w-full max-w-7xl px-4 min-[375px]:px-5 min-[480px]:px-6 md:px-8 lg:px-10 min-[1440px]:px-12">
          <div className="mb-8 text-center sm:mb-12">
            <h1 className="mb-3 font-serif text-2xl font-bold text-text-primary min-[375px]:text-[1.9rem] min-[480px]:text-[2.05rem] md:text-4xl lg:text-5xl min-[1440px]:text-6xl">
              Ghani Shinwari <span className="gold-text">Menu</span>
            </h1>
            <p className="mx-auto max-w-[36ch] text-sm text-text-muted sm:text-base">
              Authentic Pakistani starters, meat mains, desserts, drinks, and specials.
            </p>
          </div>

          {/* DEV DEBUG: show current selected category and filtered count */}
          <div className="mb-4 text-center text-sm text-text-muted">
            <span className="inline-block rounded-md border px-3 py-1 text-xs">Selected: {selectedCategory}</span>
            <span className="ml-3 inline-block rounded-md border px-3 py-1 text-xs">Filtered: {filteredItems.length}</span>
          </div>

          <div className="-mx-4 mb-8 flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-hide sm:mx-0 sm:mb-12 sm:flex-wrap sm:justify-center sm:gap-3 sm:px-0">
            {categories.map((cat) => (
              <a
                key={cat}
                href={`/menu?category=${encodeURIComponent(cat)}`}
                onClick={() => setSelectedCategory(cat)}
                aria-pressed={selectedCategory === cat}
                className={`shrink-0 inline-flex items-center rounded-full px-4 py-2 text-xs font-medium transition-all min-h-11 sm:text-sm ${
                  selectedCategory === cat
                    ? "gold-gradient text-bg-primary shadow-lg"
                    : "border border-border-color bg-bg-card text-text-secondary hover:border-accent-gold/50 hover:text-text-primary"
                }`}
              >
                <span>{cat}</span>
                <span className="ml-1 opacity-80">({categoryCounts[cat.toLowerCase()] || 0})</span>
              </a>
            ))}
          </div>

          {loading ? (
            <div className="py-6">
              <MenuSkeleton count={6} />
            </div>
          ) : error ? (
            <div className="py-20 text-center">
              <p className="mb-2 text-text-muted">{error}</p>
              <button type="button" onClick={fetchItems} className="btn-primary mx-auto mt-4 w-full max-w-xs rounded-full px-6 sm:w-auto">
                Retry
              </button>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-text-muted">No items found in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              {filteredItems.map((item) => (
                <MenuCard key={item._id} item={item} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
