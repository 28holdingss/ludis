import type { Product, ProductImage } from "@/lib/shopify/types";

function imageKey(url: string) {
  const file = (url.split("/").pop() ?? url).split("?")[0];
  return file.replace(
    /_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(?=\.)/i,
    "",
  );
}

function optionValue(
  variant: Product["variants"][number],
  name: string,
): string | undefined {
  return variant.selectedOptions.find(
    (o) => o.name.toLowerCase() === name.toLowerCase(),
  )?.value;
}

function uniqueImages(images: ProductImage[]) {
  const seen = new Set<string>();
  return images.filter((img) => {
    if (!img?.url) return false;
    const key = imageKey(img.url);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function galleryImages(product: Product) {
  return uniqueImages([
    ...(product.featuredImage ? [product.featuredImage] : []),
    ...product.images,
  ]);
}

function packshotKeys(product: Product): Set<string> {
  const gallery = galleryImages(product);
  const variantFrontKeys = new Set(
    product.variants
      .map((variant) => variant.image?.url)
      .filter(Boolean)
      .map((url) => imageKey(url!)),
  );

  const keys = new Set<string>(variantFrontKeys);
  for (const frontKey of variantFrontKeys) {
    const idx = gallery.findIndex((img) => imageKey(img.url) === frontKey);
    if (idx >= 0 && gallery[idx + 1]) {
      keys.add(imageKey(gallery[idx + 1].url));
    }
  }
  return keys;
}

/** Lifestyle/model shots that aren't Tapstitch color front/back packshots. */
function lifestyleImages(product: Product): ProductImage[] {
  const keys = packshotKeys(product);
  return galleryImages(product).filter(
    (img) => !keys.has(imageKey(img.url)),
  );
}

function altMatchesColor(alt: string | null | undefined, color: string) {
  if (!alt) return false;
  const a = alt.trim().toLowerCase();
  const c = color.trim().toLowerCase();
  if (!c) return false;
  // Exact, or "model White", "lifestyle: Flower Gray", "White model", etc.
  if (a === c) return true;
  if (a.includes(c)) return true;
  return false;
}

/**
 * Model image for the selected color.
 * Match by Media alt text containing the Shopify Color name.
 */
function lifestyleForColor(
  product: Product,
  color?: string,
): ProductImage | null {
  const shots = lifestyleImages(product);
  if (shots.length === 0) return null;
  if (!color) return shots[0] ?? null;

  const matched = shots.find((img) => altMatchesColor(img.altText, color));
  return matched ?? shots[0] ?? null;
}

function frontBackPair(
  product: Product,
  color?: string,
): ProductImage[] {
  const colorOption = product.options.find(
    (o) => o.name.toLowerCase() === "color",
  );
  const activeColor = color || colorOption?.values[0];
  const gallery = galleryImages(product);

  if (!activeColor) {
    return gallery.slice(0, 2);
  }

  const variantWithImage = product.variants.find(
    (variant) =>
      optionValue(variant, "color") === activeColor && variant.image?.url,
  );

  const front = variantWithImage?.image ?? null;
  if (front) {
    const frontKey = imageKey(front.url);
    const idx = gallery.findIndex((img) => imageKey(img.url) === frontKey);
    const back = idx >= 0 ? gallery[idx + 1] : null;
    const resolvedFront = idx >= 0 ? gallery[idx] : front;
    return [resolvedFront, back].filter(Boolean) as ProductImage[];
  }

  const colors = colorOption?.values ?? [];
  const colorIndex = Math.max(0, colors.indexOf(activeColor));
  const packshots = gallery.filter((img) =>
    /\.(png|webp)(\?|$)/i.test(img.url),
  );
  const source = packshots.length >= colors.length * 2 ? packshots : gallery;
  const start = colorIndex * 2;
  const pair = source.slice(start, start + 2);
  return pair.length > 0 ? pair : gallery.slice(0, 2);
}

/**
 * Model (by color alt) + Tapstitch front/back for the selected color.
 */
export function galleryForColor(
  product: Product,
  color?: string,
): ProductImage[] {
  const lifestyle = lifestyleForColor(product, color);
  const pair = frontBackPair(product, color);
  return uniqueImages([
    ...(lifestyle ? [lifestyle] : []),
    ...pair,
  ]);
}

/** @deprecated use galleryForColor */
export function frontBackForColor(
  product: Product,
  color?: string,
): ProductImage[] {
  return galleryForColor(product, color);
}
