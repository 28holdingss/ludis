import type { CollectionDef } from "@/components/CollectionGrid";
import { matchCollection } from "@/components/CollectionGrid";
import type { Product } from "@/lib/shopify/types";

export type FavoriteTile = CollectionDef & {
  fallbackImage?: string;
};

export const WOMEN_FAVORITES: FavoriteTile[] = [
  {
    slug: "leggings",
    label: "Leggings",
    keywords: ["legging", "tight", "yoga pant"],
    fallbackImage: "/shop-women-v2.png",
  },
  {
    slug: "sports-bras",
    label: "Sports Bras",
    keywords: ["bra", "sports bra", "crop"],
    fallbackImage: "/shop-women-v2.png",
  },
  {
    slug: "shorts",
    label: "Shorts",
    keywords: ["shorts"],
    fallbackImage: "/shop-women-v2.png",
  },
  {
    slug: "tops",
    label: "T-Shirts & Tops",
    keywords: ["tee", "t-shirt", "tank", "top", "crop"],
    fallbackImage: "/shop-women-v2.png",
  },
];

export const MEN_FAVORITES: FavoriteTile[] = [
  {
    slug: "hoodies",
    label: "Hoodies",
    keywords: ["hoodie", "hood"],
    fallbackImage: "/shop-men-v2.png",
  },
  {
    slug: "t-shirts",
    label: "T-Shirts",
    keywords: ["tee", "t-shirt", "tshirt", "boxy"],
    fallbackImage: "/shop-men-v2.png",
  },
  {
    slug: "shorts",
    label: "Shorts",
    keywords: ["shorts"],
    fallbackImage: "/shop-men-v2.png",
  },
  {
    slug: "pants",
    label: "Joggers & Pants",
    keywords: ["jogger", "sweatpant", "pants", "fleece"],
    fallbackImage: "/shop-men-v2.png",
  },
];

export function getFavoritesForGender(gender: "women" | "men") {
  return gender === "women" ? WOMEN_FAVORITES : MEN_FAVORITES;
}

/** Shopify collection handle for a gender shop page. */
export function genderCollectionHandle(gender: "women" | "men") {
  return gender === "women" ? "shop-women" : "shop-men";
}

/** Normalize query aliases (e.g. women → shop-women). */
export function resolveCollectionHandle(handle: string) {
  if (handle === "women") return "shop-women";
  if (handle === "men") return "shop-men";
  return handle;
}

export function pickFavoriteImage(
  products: Product[],
  tile: FavoriteTile,
): string {
  const match = products.find(
    (p) => matchCollection(p, tile) && p.featuredImage?.url,
  );
  return match?.featuredImage?.url || tile.fallbackImage || "/shop-women-v2.png";
}
