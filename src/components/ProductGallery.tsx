"use client";

import Image from "next/image";
import type { Product } from "@/lib/shopify/types";

export function ProductGallery({ product }: { product: Product }) {
  const seen = new Set<string>();
  const images = [
    ...(product.images.length > 0
      ? product.images
      : product.featuredImage
        ? [product.featuredImage]
        : []),
  ].filter((img) => {
    if (seen.has(img.url)) return false;
    seen.add(img.url);
    return true;
  });

  if (images.length === 0) {
    return <div className="h-64 max-w-sm rounded-md bg-bg-muted" />;
  }

  return (
    <div
      className={`w-full max-w-lg ${
        images.length === 1 ? "grid grid-cols-1" : "grid grid-cols-2 gap-3"
      }`}
    >
      {images.slice(0, 4).map((img, i) => (
        <div
          key={img.url + i}
          className="overflow-hidden rounded-md bg-bg-elevated"
        >
          <Image
            src={img.url}
            alt={img.altText || `${product.title} ${i + 1}`}
            width={img.width || 800}
            height={img.height || 1000}
            priority={i < 2}
            className="h-auto w-full object-contain"
            sizes="(max-width: 768px) 45vw, 240px"
          />
        </div>
      ))}
    </div>
  );
}
