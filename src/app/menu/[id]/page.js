import Link from "next/link";
import MenuDetailClientLoader from "@/features/menu/components/MenuDetailClientLoader";
import { FALLBACK_MENU_IMAGE } from "@/features/menu/constants/images";
import { supabase } from "@/lib/db/supabase";

export default async function Page({ params }) {
  // `params` may be a Promise in some Next.js runtimes — resolve safely.
  const resolvedParams = params && typeof params.then === "function" ? await params : params || {};
  const id = resolvedParams?.id;

  let payload = null;
  try {
    if (id) {
      const { data: item, error } = await supabase
        .from("menu_items")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Menu item page Supabase error:", error);
      } else if (item) {
        payload = {
            _id: String(item.id),
            name: item.name,
            description: item.description,
            price: item.price,
            category: item.category,
            imageURL: item.image_url || FALLBACK_MENU_IMAGE,
            imageURLs: Array.isArray(item.image_urls) && item.image_urls.length ? item.image_urls : [item.image_url || FALLBACK_MENU_IMAGE],
            variants: Array.isArray(item.variants) ? item.variants : [],
            options: Array.isArray(item.options) ? item.options : [],
            isAvailable: Boolean(item.is_available),
        };
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
