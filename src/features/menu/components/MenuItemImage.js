"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { FALLBACK_MENU_IMAGE } from "@/features/menu/constants/images";

export default function MenuItemImage({
  src,
  alt,
  sizes,
  className = "object-cover",
  quality = 75,
  loading = "lazy",
}) {
  const normalizedSrc = (src && String(src).trim()) || FALLBACK_MENU_IMAGE;
  const [imageSrc, setImageSrc] = useState(normalizedSrc);

  useEffect(() => {
    setImageSrc(normalizedSrc);
  }, [normalizedSrc]);

  return (
    <Image
      src={imageSrc}
      alt={alt}
      fill
      className={className}
      sizes={sizes}
      loading={loading}
      quality={quality}
      onError={() => setImageSrc(FALLBACK_MENU_IMAGE)}
    />
  );
}

