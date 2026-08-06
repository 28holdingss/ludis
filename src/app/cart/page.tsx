"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatMoney } from "@/lib/format";

export default function CartPage() {
  const { items, subtotal, removeItem, updateQuantity, count } = useCart();

  return (
    <div className="pt-20">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-10">
        <h1 className="font-display text-5xl tracking-[0.04em]">
          Your Bag ({count})
        </h1>

        {items.length === 0 ? (
          <div className="mt-16 text-center">
            <p className="text-fg-muted">Nothing in your bag yet.</p>
            <Link
              href="/shop"
              className="mt-6 inline-flex h-12 items-center bg-accent px-7 text-[11px] font-bold tracking-[0.2em] uppercase text-accent-ink"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <>
            <ul className="mt-10 divide-y divide-border border-y border-border">
              {items.map((item) => (
                <li key={item.key} className="flex gap-5 py-6">
                  <div className="relative h-32 w-24 shrink-0 bg-bg-muted">
                    {item.product.featuredImage && (
                      <Image
                        src={item.product.featuredImage.url}
                        alt={item.product.title}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <Link
                      href={`/shop/${item.product.handle}`}
                      className="font-medium hover:text-accent"
                    >
                      {item.product.title}
                    </Link>
                    <p className="mt-1 text-sm text-fg-muted">
                      {item.variant.selectedOptions
                        .map((o) => `${o.name}: ${o.value}`)
                        .join(" · ")}
                    </p>
                    <p className="mt-2 text-sm">
                      {formatMoney(
                        item.variant.price.amount,
                        item.variant.price.currencyCode,
                      )}
                    </p>
                    <div className="mt-auto flex items-center gap-4 pt-3">
                      <div className="flex items-center border border-border">
                        <button
                          type="button"
                          className="h-9 w-9"
                          onClick={() =>
                            updateQuantity(item.key, item.quantity - 1)
                          }
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-sm">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          className="h-9 w-9"
                          onClick={() =>
                            updateQuantity(item.key, item.quantity + 1)
                          }
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.key)}
                        className="text-[10px] font-semibold tracking-[0.15em] uppercase text-fg-muted hover:text-fg"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-8 space-y-4">
              <div className="flex justify-between text-base">
                <span className="text-fg-muted">Subtotal</span>
                <span className="font-medium">{formatMoney(subtotal)}</span>
              </div>
              <p className="text-sm text-fg-muted">
                After you add your Shopify Storefront token, checkout will
                redirect to Shopify — Tapstitch will fulfill as usual.
              </p>
              <button
                type="button"
                disabled
                className="flex h-14 w-full items-center justify-center bg-fg text-[12px] font-bold tracking-[0.22em] uppercase text-bg opacity-50"
              >
                Checkout (connect Shopify)
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
