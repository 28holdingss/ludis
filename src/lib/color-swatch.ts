import type { Product, ProductImage } from "@/lib/shopify/types";

/** Fallback when a Tapstitch variant image isn’t available. */
const NAMED: Record<string, string> = {
  black: "#111111",
  white: "#f5f5f5",
  cream: "#f2ebe3",
  ivory: "#fffff0",
  "off white": "#f4f1ea",
  "off-white": "#f4f1ea",
  gray: "#8a8a8a",
  grey: "#8a8a8a",
  "flower gray": "#9a9691",
  "flower grey": "#9a9691",
  charcoal: "#36454f",
  "washed black": "#2b2b2b",
  "navy blue": "#1b2a4a",
  navy: "#1b2a4a",
  blue: "#7eb6d9",
  "blue with white": "#7eb6d9",
  "powder blue": "#9ec9e0",
  "light blue": "#9ec9e0",
  "static blue": "#3d6f9c",
  "green camo": "#4a5a3a",
  camo: "#556b2f",
  green: "#3f6b45",
  "black plaid": "#1a1a1a",
  plaid: "#2c2c2c",
  "black with white": "#1a1a1a",
  "black with gray": "#2f2f2f",
  "black with grey": "#2f2f2f",
  "navy blue with black": "#152238",
  "black beauty": "#0d0d0d",
  red: "#b91c1c",
  beige: "#d6c6a8",
  brown: "#6b4423",
  pink: "#e8a0b0",
  purple: "#6b3fa0",
  orange: "#d97706",
  yellow: "#eab308",
};

function normalize(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Primary color token — ignore trailing "with …" accents from Tapstitch. */
function primaryColorKey(name: string) {
  const key = normalize(name);
  const withIdx = key.indexOf(" with ");
  return withIdx >= 0 ? key.slice(0, withIdx).trim() : key;
}

/** Best-effort CSS color for a Shopify Color option value. */
export function swatchColor(name: string): string {
  const full = normalize(name);
  const primary = primaryColorKey(name);

  if (NAMED[full]) return NAMED[full];
  if (NAMED[primary]) return NAMED[primary];

  let best: { token: string; color: string } | null = null;
  for (const [token, color] of Object.entries(NAMED)) {
    if (
      (primary === token || primary.startsWith(`${token} `) || primary.endsWith(` ${token}`)) &&
      (!best || token.length > best.token.length)
    ) {
      best = { token, color };
    }
  }
  if (best) return best.color;

  for (const [token, color] of Object.entries(NAMED)) {
    if (primary.includes(token) && (!best || token.length > best.token.length)) {
      best = { token, color };
    }
  }
  return best?.color ?? "#888888";
}

export function isLightSwatch(hexOrName: string): boolean {
  const color = swatchColor(hexOrName);
  const hex = color.startsWith("#") ? color.slice(1) : "";
  if (hex.length !== 6) {
    return ["white", "cream", "ivory", "beige", "yellow"].some((w) =>
      primaryColorKey(hexOrName).includes(w),
    );
  }
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.72;
}

/** Tapstitch front image for a color — most accurate swatch source. */
export function swatchImageForColor(
  product: Product,
  color: string,
): ProductImage | null {
  const variant = product.variants.find(
    (v) =>
      v.image?.url &&
      v.selectedOptions.some(
        (o) =>
          o.name.toLowerCase() === "color" &&
          o.value.toLowerCase() === color.toLowerCase(),
      ),
  );
  return variant?.image ?? null;
}
