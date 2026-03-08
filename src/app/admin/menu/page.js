"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { HiPencil, HiPlus, HiTrash, HiX } from "react-icons/hi";
import { apiRequest } from "@/lib/api";
import { FALLBACK_MENU_IMAGE } from "@/lib/menuImage";
import MenuItemImage from "@/components/MenuItemImage";

const CATEGORIES = ["Starters", "Main Course", "Desserts", "Drinks", "Specials"];

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  category: "Starters",
  imageURL: FALLBACK_MENU_IMAGE,
  isAvailable: true,
};

export default function AdminMenuPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchItems = useCallback(async () => {
    try {
      const data = await apiRequest("/api/menu?all=true");
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.message || "Failed to load menu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const openAddModal = useCallback(() => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }, []);

  const openEditModal = useCallback((item) => {
    setEditingId(item._id);
    setForm({
      name: item.name,
      description: item.description,
      price: String(item.price),
      category: item.category,
      imageURL: item.imageURL || FALLBACK_MENU_IMAGE,
      isAvailable: item.isAvailable,
    });
    setModalOpen(true);
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setSaving(true);
      try {
        const url = editingId ? `/api/menu/${editingId}` : "/api/menu";
        const method = editingId ? "PUT" : "POST";

        await apiRequest(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            price: parseFloat(form.price),
            imageURL: String(form.imageURL || "").trim() || FALLBACK_MENU_IMAGE,
          }),
        });

        toast.success(editingId ? "Item updated!" : "Item added!");
        setModalOpen(false);
        await fetchItems();
      } catch (error) {
        toast.error(error.message || "Failed to save menu item");
      } finally {
        setSaving(false);
      }
    },
    [editingId, fetchItems, form]
  );

  const handleDelete = useCallback(
    async (id) => {
      if (!confirm("Delete this item?")) {
        return;
      }

      try {
        await apiRequest(`/api/menu/${id}`, { method: "DELETE" });
        toast.success("Item deleted");
        await fetchItems();
      } catch (error) {
        toast.error(error.message || "Failed to delete");
      }
    },
    [fetchItems]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent-gold border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex flex-col justify-between gap-3 sm:mb-8 sm:flex-row sm:items-center">
        <h1 className="font-serif text-xl font-bold text-text-primary sm:text-2xl lg:text-3xl">
          Menu Items
        </h1>
        <button onClick={openAddModal} className="btn-primary rounded-lg text-sm">
          <HiPlus size={18} />
          Add Item
        </button>
      </div>

      {items.length === 0 ? (
        <div className="py-20 text-center text-text-muted">
          <p>No menu items yet. Add your first dish.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
          {items.map((item) => {
            const imageSrc = item.imageURL || FALLBACK_MENU_IMAGE;
            return (
              <div
                key={item._id}
                className="overflow-hidden rounded-xl border border-border-color bg-bg-card"
              >
                <div className="relative aspect-video w-full bg-bg-elevated">
                  <MenuItemImage
                    src={imageSrc}
                    alt={item.name}
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  />
                  {!item.isAvailable && (
                    <div className="absolute inset-0 flex items-center justify-center bg-bg-primary/70">
                      <span className="text-sm font-bold text-danger">Unavailable</span>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <h3 className="line-clamp-1 text-sm font-semibold text-text-primary sm:text-base">
                      {item.name}
                    </h3>
                    <span className="shrink-0 text-sm font-bold text-accent-gold">
                      {(() => {
                        try {
                          return new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 }).format(item.price);
                        } catch (e) {
                          return `PKR ${Number(item.price).toLocaleString()}`;
                        }
                      })()}
                    </span>
                  </div>
                  <p className="mb-3 line-clamp-2 text-xs text-text-muted sm:text-sm">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-bg-elevated px-2 py-1 text-xs text-text-secondary">
                      {item.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(item)}
                        className="flex h-10 w-10 items-center justify-center rounded-lg bg-bg-elevated text-text-secondary transition-colors hover:text-accent-gold"
                        aria-label="Edit"
                      >
                        <HiPencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="flex h-10 w-10 items-center justify-center rounded-lg bg-bg-elevated text-text-secondary transition-colors hover:text-danger"
                        aria-label="Delete"
                      >
                        <HiTrash size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
          <div className="absolute inset-0 bg-overlay" onClick={() => setModalOpen(false)} />

          <div className="relative z-10 max-h-[90vh] w-full overflow-y-auto rounded-t-2xl border-t border-border-color bg-bg-card sm:max-w-lg sm:rounded-2xl sm:border">
            <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-border-color bg-bg-card p-4 sm:p-5">
              <h2 className="text-base font-semibold text-text-primary sm:text-lg">
                {editingId ? "Edit Item" : "Add New Item"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-text-muted transition-colors hover:text-text-primary"
                aria-label="Close"
              >
                <HiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-4 sm:p-5">
              <div>
                <label className="mb-1.5 block text-sm text-text-secondary">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-text-secondary">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="input-field resize-none"
                  required
                />
              </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm text-text-secondary">Price (PKR)</label>
                  <input
                    type="number"
                    step="1"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-text-secondary">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="input-field"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm text-text-secondary">Image URL</label>
                <input
                  type="url"
                  value={form.imageURL}
                  onChange={(e) => setForm({ ...form, imageURL: e.target.value })}
                  placeholder="https://example.com/image.webp"
                  className="input-field"
                  required
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={form.isAvailable}
                    onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })}
                    className="peer sr-only"
                  />
                  <div className="h-6 w-11 rounded-full bg-bg-elevated transition-colors peer-checked:bg-accent-gold after:absolute after:left-[2px] after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full" />
                </label>
                <span className="text-sm text-text-secondary">Available</span>
              </div>

              <button type="submit" disabled={saving} className="btn-primary w-full rounded-lg">
                {saving ? "Saving..." : editingId ? "Update Item" : "Add Item"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
