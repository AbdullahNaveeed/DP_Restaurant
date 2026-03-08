import Link from "next/link";
import MenuDetailClientLoader from "@/features/menu/components/MenuDetailClientLoader";
import dbConnect from "@/lib/db/mongoose";
import MenuItem from "@/models/MenuItem";
import DEFAULT_MENU from "@/features/menu/data/default-menu";
import { FALLBACK_MENU_IMAGE } from "@/features/menu/constants/images";

export default async function Page({ params }) {
  // `params` may be a Promise in some Next.js runtimes — resolve safely.
  const resolvedParams = params && typeof params.then === "function" ? await params : params || {};
  const id = resolvedParams?.id;

  let payload = null;
  try {
    if (id) {
      const conn = await dbConnect();

      if (conn) {
        const item = await MenuItem.findById(id).lean();
        if (item) {
          payload = {
            _id: String(item._id),
            name: item.name,
            description: item.description,
            price: item.price,
            category: item.category,
              imageURL: item.imageURL || FALLBACK_MENU_IMAGE,
              imageURLs: Array.isArray(item.imageURLs) && item.imageURLs.length ? item.imageURLs : [item.imageURL || FALLBACK_MENU_IMAGE],
            variants: Array.isArray(item.variants) ? item.variants : [],
            options: Array.isArray(item.options) ? item.options : [],
            isAvailable: Boolean(item.isAvailable),
          };
        }
      }

      // Fallback to bundled data when DB missing or item not found
      if (!payload) {
        const found = DEFAULT_MENU.find((m) => String(m._id) === String(id));
        if (found) {
          payload = {
            _id: String(found._id),
            name: found.name,
            description: found.description,
            price: found.price,
            category: found.category,
            imageURL: found.imageURL || FALLBACK_MENU_IMAGE,
            imageURLs: Array.isArray(found.imageURLs) && found.imageURLs.length ? found.imageURLs : [found.imageURL || FALLBACK_MENU_IMAGE],
            variants: Array.isArray(found.variants) ? found.variants : [],
            options: Array.isArray(found.options) ? found.options : [],
            isAvailable: Boolean(found.isAvailable),
          };
        }
      }
    }
  } catch (e) {
    console.error("Menu item page fetch failed:", e);
    payload = null;
  }

  return (
    <section className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/menu" className="text-sm text-link">
          ← Back to Menu
        </Link>
      </div>

      <MenuDetailClientLoader initialItem={payload} />
    </section>
  );
}
