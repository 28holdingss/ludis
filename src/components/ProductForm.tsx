"use client";

import { useMemo, useState } from "react";
import type { Product, ProductVariant } from "@/lib/shopify/types";
import { useCart } from "@/context/CartContext";
import { formatMoney } from "@/lib/format";
import { swatchColor, swatchImageForColor } from "@/lib/color-swatch";
import { ProductDetails } from "@/components/ProductDetails";

function findVariant(
  variants: ProductVariant[],
  selected: Record<string, string>,
) {
  return (
    variants.find((v) =>
      v.selectedOptions.every((o) => selected[o.name] === o.value),
    ) ?? null
  );
}

export function ProductForm({
  product,
  onColorChange,
}: {
  product: Product;
  onColorChange?: (color: string) => void;
}) {
  const { addItem } = useCart();

  const initialSelected = useMemo(() => {
    const map: Record<string, string> = {};
    for (const option of product.options) {
      map[option.name] = option.values[0] ?? "";
    }
    return map;
  }, [product.options]);

  const [selected, setSelected] = useState(initialSelected);
  const [quantity, setQuantity] = useState(1);

  const selectedVariant = useMemo(
    () => findVariant(product.variants, selected) ?? product.variants[0],
    [product.variants, selected],
  );

  const price = selectedVariant?.price ?? product.priceRange.minVariantPrice;
  const available = selectedVariant?.availableForSale ?? false;

  function setOption(name: string, value: string) {
    setSelected((prev) => ({ ...prev, [name]: value }));
    if (name.toLowerCase() === "color") {
      onColorChange?.(value);
    }
  }

  function handleAdd() {
    if (!selectedVariant || !available) return;
    addItem(product, selectedVariant, quantity);
  }

  return (
    <div className="max-w-md">
      <h1 className="text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
        {product.title}
      </h1>
      <p className="mt-3 text-lg text-fg">
        {formatMoney(price.amount, price.currencyCode)}
      </p>

      <hr className="my-6 border-border" />

      <div className="space-y-5">
        {product.options.map((option) => {
          const isSize = option.name.toLowerCase() === "size";
          const isColor = option.name.toLowerCase() === "color";
          const current = selected[option.name];

          if (isColor) {
            return (
              <div key={option.name}>
                <p className="mb-2 text-sm">
                  <span className="text-fg-muted">{option.name}</span>{" "}
                  <span className="font-medium">{current}</span>
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {option.values.map((value) => {
                    const active = current === value;
                    const colorAvailable = product.variants.some(
                      (variant) =>
                        variant.availableForSale &&
                        variant.selectedOptions.some(
                          (o) => o.name === option.name && o.value === value,
                        ),
                    );
                    // Prefer Tapstitch variant photo so swatches match the garment.
                    const photo = swatchImageForColor(product, value);
                    const fill = swatchColor(value);

                    return (
                      <button
                        key={value}
                        type="button"
                        disabled={!colorAvailable}
                        onClick={() => setOption(option.name, value)}
                        title={value}
                        aria-label={value}
                        aria-pressed={active}
                        className={`relative h-12 w-12 overflow-hidden rounded-full bg-cover bg-center transition-transform disabled:opacity-35 ${
                          active
                            ? "scale-105 ring-2 ring-fg ring-offset-2 ring-offset-bg"
                            : "hover:scale-105"
                        }`}
                        style={{
                          backgroundColor: fill,
                          backgroundImage: photo
                            ? `url(${photo.url})`
                            : undefined,
                          boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.12)",
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            );
          }

          return (
            <div key={option.name}>
              <p className="mb-2 text-sm text-fg">{option.name}</p>
              <div className="flex flex-wrap gap-2">
                {option.values.map((value) => {
                  const trial = { ...selected, [option.name]: value };
                  const variant = findVariant(product.variants, trial);
                  const canBuy = variant?.availableForSale ?? false;
                  const active = current === value;

                  return (
                    <button
                      key={value}
                      type="button"
                      disabled={!canBuy && isSize}
                      onClick={() => setOption(option.name, value)}
                      className={`min-w-12 rounded-md border px-3.5 py-2 text-sm transition-colors ${
                        active
                          ? "border-fg bg-fg text-bg"
                          : canBuy
                            ? "border-border-strong bg-bg text-fg hover:border-fg"
                            : "border-border bg-bg text-fg-muted line-through opacity-40"
                      }`}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex gap-3">
        <div className="flex h-12 items-center rounded-md border border-border-strong">
          <button
            type="button"
            className="h-full w-10 text-lg text-fg-muted hover:text-fg"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="w-8 text-center text-sm tabular-nums">{quantity}</span>
          <button
            type="button"
            className="h-full w-10 text-lg text-fg-muted hover:text-fg"
            onClick={() => setQuantity((q) => q + 1)}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        <button
          type="button"
          disabled={!available}
          onClick={handleAdd}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-md bg-fg text-sm font-medium text-bg transition-colors hover:bg-neutral-800 disabled:opacity-40"
        >
          <CartPlusIcon />
          Add to cart
        </button>
      </div>

      <button
        type="button"
        disabled={!available}
        onClick={handleAdd}
        className="mt-3 flex h-12 w-full items-center justify-center rounded-md bg-fg text-sm font-medium text-bg transition-colors hover:bg-neutral-800 disabled:opacity-40"
      >
        Buy it now
      </button>

      {product.description && (
        <ProductDetails description={product.description} />
      )}
    </div>
  );
}

function CartPlusIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path d="M6 6h15l-1.5 9h-12z" />
      <path d="M6 6 5 3H2" />
      <circle cx="9" cy="20" r="1" fill="currentColor" stroke="none" />
      <circle cx="18" cy="20" r="1" fill="currentColor" stroke="none" />
      <path d="M12 9v4M10 11h4" />
    </svg>
  );
}
