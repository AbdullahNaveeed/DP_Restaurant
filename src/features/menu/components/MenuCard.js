"use client";

import { memo, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";
import { HiPlus } from "react-icons/hi";
import { FALLBACK_MENU_IMAGE } from "@/features/menu/constants/images";
import MenuItemImage from "@/features/menu/components/MenuItemImage";

function MenuCard({ item }) {
  const { addItem } = useCart();
  const router = useRouter();
  const imageSrc = useMemo(
    () => (
      (Array.isArray(item.imageURLs) && item.imageURLs.length && String(item.imageURLs[0]).trim()) ||
      (item.imageURL && String(item.imageURL).trim()) ||
      FALLBACK_MENU_IMAGE
    ),
    [item.imageURL, item.imageURLs]
  );

  const formattedPrice = useMemo(() => {
    try {
      return new Intl.NumberFormat("en-PK", {
        style: "currency",
        currency: "PKR",
        maximumFractionDigits: 0,
      }).format(item.price);
    } catch (e) {
      return `PKR ${Number(item.price).toLocaleString()}`;
    }
  }, [item.price]);

  const handleAdd = useCallback(() => {
    // If the item has variants or per-item options, send the user to the detail
    // page so they can choose size/options. Otherwise add directly.
    if ((item.variants && item.variants.length > 0) || (item.options && item.options.length > 0)) {
      router.push(`/menu/${item._id}`);
      return;
    }

    const payload = {
      _id: item._id,
      baseId: item._id,
      name: item.name,
      price: item.price,
      imageURL: imageSrc,
      description: item.description,
      quantity: 1,
    };

    addItem(payload);
    toast.success(`${item.name} added to cart`);
  }, [addItem, item, router]);

  return (
    <article className="group overflow-hidden rounded-xl border border-border-color bg-bg-card card-hover">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-bg-elevated">
        <MenuItemImage
          src={imageSrc}
          alt={item.name}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
        />

        <span className="absolute left-3 top-3 rounded-full bg-bg-primary/80 px-2.5 py-1 text-xs font-semibold text-accent-gold backdrop-blur-sm">
          {item.category}
        </span>
      </div>

      <div className="p-4 sm:p-5">
        <Link href={`/menu/${item._id}`} className="block">
          <div className="mb-2 flex items-start justify-between gap-3">
            <h3 className="line-clamp-1 text-base font-semibold leading-snug text-text-primary">
              {item.name}
            </h3>
            <span className="shrink-0 whitespace-nowrap text-base font-bold text-accent-gold">
              {formattedPrice}
            </span>
          </div>

          <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-text-muted">
            {item.description}
          </p>
        </Link>

        <button
          type="button"
          onClick={handleAdd}
          className="btn-primary w-full rounded-lg text-sm"
        >
          <HiPlus size={16} />
          Add to Cart
        </button>
      </div>
    </article>
  );
}

export default memo(MenuCard);

