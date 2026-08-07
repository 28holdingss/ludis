"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { CheckoutButton } from "@/components/CheckoutButton";
import { formatMoney } from "@/lib/format";

export function CartDrawer() {
  const {
    items,
    count,
    subtotal,
    currencyCode,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
  } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 animate-fade-in"
        onClick={closeCart}
        aria-label="Close cart"
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-bg border-l border-border animate-fade-up">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-display text-2xl tracking-[0.06em]">
            Your Bag ({count})
          </h2>
          <button
            type="button"
            onClick={closeCart}
            className="text-[11px] font-semibold tracking-[0.2em] uppercase text-fg-muted hover:text-fg"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <p className="text-fg-muted">Your bag is empty.</p>
              <Link
                href="/shop"
                onClick={closeCart}
                className="bg-fg px-6 py-3 text-[11px] font-bold tracking-[0.2em] uppercase text-bg"
              >
                Shop Now
              </Link>
            </div>
          ) : (
            <ul className="space-y-5">
              {items.map((item) => (
                <li key={item.key} className="flex gap-4">
                  <div className="relative h-28 w-20 shrink-0 overflow-hidden bg-bg-muted">
                    {item.product.featuredImage && (
                      <Image
                        src={item.product.featuredImage.url}
                        alt={item.product.title}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <Link
                      href={`/shop/${item.product.handle}`}
                      onClick={closeCart}
                      className="text-sm font-medium hover:underline"
                    >
                      {item.product.title}
                    </Link>
                    <p className="mt-1 text-xs text-fg-muted">
                      {item.variant.selectedOptions
                        .map((o) => o.value)
                        .join(" / ")}
                    </p>
                    <p className="mt-1 text-sm">
                      {formatMoney(
                        item.variant.price.amount,
                        item.variant.price.currencyCode,
                      )}
                    </p>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center border border-border">
                        <button
                          type="button"
                          className="h-8 w-8 text-sm"
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
                          className="h-8 w-8 text-sm"
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
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border px-5 py-5 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-fg-muted">Subtotal</span>
              <span className="font-medium">
                {formatMoney(subtotal, currencyCode)}
              </span>
            </div>
            <CheckoutButton
              label="Checkout"
              className="flex h-12 w-full items-center justify-center bg-fg text-[11px] font-bold tracking-[0.2em] uppercase text-bg disabled:opacity-50"
            />
            <Link
              href="/cart"
              onClick={closeCart}
              className="flex h-11 w-full items-center justify-center border border-border text-[11px] font-bold tracking-[0.2em] uppercase text-fg hover:border-fg"
            >
              View Bag
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}
