"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/shopify/types";
import { ProductForm } from "@/components/ProductForm";
import { ProductGallery } from "@/components/ProductGallery";

export function ProductView({ product }: { product: Product }) {
  const colorOption = useMemo(
    () =>
      product.options.find((option) => option.name.toLowerCase() === "color"),
    [product.options],
  );
  const [selectedColor, setSelectedColor] = useState(
    colorOption?.values[0] ?? "",
  );

  return (
    <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-10">
      <ProductGallery product={product} selectedColor={selectedColor} />
      <ProductForm
        key={product.id}
        product={product}
        onColorChange={setSelectedColor}
      />
    </div>
  );
}
