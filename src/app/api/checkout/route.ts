import { NextResponse } from "next/server";
import {
  buildCartPermalink,
  createCheckoutCart,
  isShopifyConfigured,
} from "@/lib/shopify/client";

type CheckoutLine = {
  merchandiseId: string;
  quantity: number;
};

export async function POST(request: Request) {
  if (!isShopifyConfigured()) {
    return NextResponse.json(
      { error: "Shopify Storefront API is not configured." },
      { status: 503 },
    );
  }

  let body: { lines?: CheckoutLine[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const lines = (body.lines ?? [])
    .filter(
      (line) =>
        typeof line.merchandiseId === "string" &&
        /^gid:\/\/shopify\/ProductVariant\/\d+$/.test(line.merchandiseId) &&
        Number.isFinite(line.quantity) &&
        line.quantity > 0,
    )
    .map((line) => ({
      merchandiseId: line.merchandiseId,
      quantity: Math.min(Math.floor(line.quantity), 50),
    }));

  if (lines.length === 0) {
    return NextResponse.json(
      {
        error:
          "Your bag is empty or has outdated items. Clear the bag and add products again.",
        invalidMerchandiseIds: (body.lines ?? [])
          .map((l) => l.merchandiseId)
          .filter(Boolean),
      },
      { status: 400 },
    );
  }

  // Storefront cart with checkout country (default US). Without this, Ghana IP
  // markets mark Tapstitch variants sold out even when Online Store (US) works.
  const result = await createCheckoutCart(lines);
  const usable =
    result.cart?.checkoutUrl &&
    result.cart.totalQuantity > 0 &&
    result.cart.lines.every((line) => line.quantity > 0);

  if (usable && result.cart?.checkoutUrl) {
    return NextResponse.json({
      checkoutUrl: result.cart.checkoutUrl,
      cartId: result.cart.id,
      method: "storefront-cart",
      invalidMerchandiseIds: result.invalidMerchandiseIds,
    });
  }

  const permalink = buildCartPermalink(lines);
  if (permalink) {
    return NextResponse.json({
      checkoutUrl: permalink,
      method: "permalink",
      invalidMerchandiseIds: result.invalidMerchandiseIds,
    });
  }

  const shopifyMessage = result.userErrors.map((e) => e.message).join(" ");
  const stale = result.invalidMerchandiseIds.length > 0;

  return NextResponse.json(
    {
      error: stale
        ? "Some items in your bag are no longer available. They were removed — add products again and checkout."
        : shopifyMessage ||
          "Could not start checkout. In Shopify, enable shipping/inventory for your market (Tapstitch ODMPOD), or set NEXT_PUBLIC_SHOPIFY_CHECKOUT_COUNTRY=US.",
      invalidMerchandiseIds: result.invalidMerchandiseIds,
      userErrors: result.userErrors,
    },
    { status: 502 },
  );
}
