"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";

export function CheckoutButton({
  className,
  label = "Checkout",
}: {
  className?: string;
  label?: string;
}) {
  const { items, removeItemsByVariantIds, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    if (items.length === 0 || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines: items.map((item) => ({
            merchandiseId: item.variant.id,
            quantity: item.quantity,
          })),
        }),
      });

      const data = (await res.json()) as {
        checkoutUrl?: string;
        error?: string;
        invalidMerchandiseIds?: string[];
        removedCount?: number;
      };

      if (data.invalidMerchandiseIds?.length) {
        removeItemsByVariantIds(data.invalidMerchandiseIds);
      }

      if (!res.ok || !data.checkoutUrl) {
        if (
          !data.checkoutUrl &&
          items.length > 0 &&
          data.invalidMerchandiseIds?.length === items.length
        ) {
          clearCart();
        }
        setError(data.error || "Checkout failed. Try again.");
        setLoading(false);
        return;
      }

      window.location.href = data.checkoutUrl;
    } catch {
      setError("Something went wrong starting checkout.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleCheckout}
        disabled={loading || items.length === 0}
        className={
          className ??
          "flex h-14 w-full items-center justify-center bg-fg text-[12px] font-bold tracking-[0.22em] uppercase text-bg transition-opacity disabled:opacity-50"
        }
      >
        {loading ? "Redirecting…" : label}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
