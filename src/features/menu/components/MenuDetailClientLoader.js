"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import MenuDetail from "./MenuDetail";

export default function MenuDetailClientLoader({ initialItem = null }) {
  const [item, setItem] = useState(initialItem || null);
  const [loading, setLoading] = useState(!initialItem);
  const [error, setError] = useState(null);

  const params = useParams();
  const id = params?.id;

  useEffect(() => {
    // If server provided the item, skip client fetch
    if (initialItem) {
      setLoading(false);
      return;
    }

    if (!id) {
      setError("Invalid item id");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/menu/${encodeURIComponent(id)}`);
        if (!res.ok) {
          const payload = await res.json().catch(() => null);
          const msg = payload && typeof payload.error === "string" ? payload.error : `Failed to load item (${res.status})`;
          if (!cancelled) setError(msg);
          return;
        }

        const data = await res.json();
        if (!cancelled) setItem(data || null);
      } catch (e) {
        console.error("Failed to load menu item on client:", e);
        if (!cancelled) setError("Failed to load item");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [id, initialItem]);

  if (loading) return <div className="py-20 text-center">Loading item…</div>;
  if (error) return <div className="py-20 text-center text-danger">{error}</div>;
  if (!item) return <div className="py-20 text-center">Item not found.</div>;

  return <MenuDetail item={item} />;
}
