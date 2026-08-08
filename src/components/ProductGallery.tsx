"use client";

import Image from "next/image";
import type { Product, ProductImage } from "@/lib/shopify/types";
import { galleryForColor } from "@/lib/product-media";

export function ProductGallery({
  product,
  selectedColor,
}: {
  product: Product;
  selectedColor?: string;
}) {
  const images: ProductImage[] = galleryForColor(product, selectedColor);

  if (images.length === 0) {
    return <div className="h-64 max-w-sm bg-white" />;
  }

  return (
    <div
      className={`w-full max-w-lg ${
        images.length === 1 ? "grid grid-cols-1" : "grid grid-cols-2 gap-3"
      }`}
    >
      {images.map((img, i) => (
        <div key={img.url} className="overflow-hidden bg-white">
          <Image
            src={img.url}
            alt={
              img.altText ||
              `${product.title}${selectedColor ? ` ${selectedColor}` : ""} ${
                i === 0 ? "lifestyle" : i === 1 ? "front" : "back"
              }`
            }
            width={img.width || 800}
            height={img.height || 1000}
            priority={i < 2}
            className="h-auto w-full object-contain animate-fade-in"
            sizes="(max-width: 768px) 45vw, 240px"
          />
        </div>
      ))}
    </div>
  );
}
