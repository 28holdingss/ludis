import Link from "next/link";
import Image from "next/image";
import { getProducts } from "@/lib/shopify/client";
import type { Product, ProductImage } from "@/lib/shopify/types";

export type CollectionDef = {
  slug: string;
  label: string;
  keywords: string[];
};

export const COLLECTIONS: CollectionDef[] = [
  {
    slug: "t-shirts",
    label: "T-Shirts",
    keywords: ["tee", "t-shirt", "tshirt", "boxy"],
  },
  {
    slug: "tank-tops",
    label: "Tank Tops",
    keywords: ["tank", "sleeveless", "racer"],
  },
  {
    slug: "long-sleeve",
    label: "Long Sleeve Shirts",
    keywords: ["long sleeve", "longsleeve", "ls "],
  },
  {
    slug: "hoodies",
    label: "Hoodies",
    keywords: ["hoodie", "hood"],
  },
  {
    slug: "sweatshirts",
    label: "Sweatshirts",
    keywords: ["sweatshirt", "crewneck", "crew neck"],
  },
  {
    slug: "pants",
    label: "Pants",
    keywords: ["pants", "jeans", "trouser", "denim"],
  },
  {
    slug: "sweatpants",
    label: "Sweatpants",
    keywords: ["sweatpant", "jogger", "flared fleece"],
  },
  {
    slug: "shorts",
    label: "Shorts",
    keywords: ["shorts"],
  },
  {
    slug: "jackets",
    label: "Coats & Jackets",
    keywords: ["jacket", "coat", "windbreaker", "outerwear"],
  },
  {
    slug: "sportswear",
    label: "Sportswear",
    keywords: [
      "sport",
      "active",
      "training",
      "athletic",
      "skirt",
      "legging",
      "bra",
      "jogger",
      "performance",
      "seamless",
      "gym",
      "workout",
      "tank",
      "shorts",
    ],
  },
];

export function matchCollection(
  product: {
    title: string;
    handle: string;
    productType?: string;
    tags: string[];
  },
  collection: CollectionDef,
) {
  const haystack = [
    product.title,
    product.handle,
    product.productType ?? "",
    ...product.tags,
  ]
    .join(" ")
    .toLowerCase();

  return collection.keywords.some((kw) => haystack.includes(kw.toLowerCase()));
}

export function getCollectionBySlug(slug: string) {
  return COLLECTIONS.find((c) => c.slug === slug);
}

function productImages(product: Product) {
  const seen = new Set<string>();
  const list = [
    ...(product.images ?? []),
    ...(product.featuredImage ? [product.featuredImage] : []),
  ].filter((img) => {
    if (!img?.url || seen.has(img.url)) return false;
    seen.add(img.url);
    return true;
  });
  return list;
}

/** Prefer flat / product-only shots over lifestyle model photos. */
function scorePackshot(img: ProductImage, index: number) {
  const haystack = `${img.altText ?? ""} ${img.url}`.toLowerCase();
  let score = 0;

  if (
    /flat|packshot|pack.?shot|ghost|isolated|cutout|still.?life|product.?shot|no.?model/.test(
      haystack,
    )
  ) {
    score += 12;
  }
  if (/lifestyle|model|worn|on.?body|on.?model|campaign|lookbook|editorial/.test(haystack)) {
    score -= 12;
  }
  // Featured/first image is often a model shot for apparel
  if (index === 0) score -= 2;
  if (index >= 1) score += 3;

  return score;
}

function pickProduct(
  products: Product[],
  collection: CollectionDef,
): { product: Product; imageUrl: string } | undefined {
  const matches = products.filter((p) => matchCollection(p, collection));
  if (matches.length === 0) return undefined;

  let best:
    | { product: Product; imageUrl: string; score: number }
    | undefined;

  for (const product of matches) {
    const images = productImages(product);
    for (let i = 0; i < images.length; i++) {
      const score = scorePackshot(images[i], i);
      const imageUrl = images[i].url;
      if (!best || score > best.score) {
        best = { product, imageUrl, score };
      }
    }
  }

  if (!best) return undefined;
  return { product: best.product, imageUrl: best.imageUrl };
}

export async function CollectionGrid() {
  const products = await getProducts(100);

  const cards = COLLECTIONS.map((collection) => {
    const picked = pickProduct(products, collection);
    return picked
      ? { collection, product: picked.product, imageUrl: picked.imageUrl }
      : null;
  }).filter((c): c is NonNullable<typeof c> => Boolean(c));

  if (cards.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1100px] px-4 py-16 sm:px-6 lg:px-10 lg:py-20">
      <div className="mb-10 text-center sm:mb-12">
        <h2 className="font-display text-4xl tracking-[0.06em] sm:text-5xl">
          Collections
        </h2>
        <p className="mt-3 text-sm text-fg-muted">
          Shop by category — find your next training staple.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-5 md:gap-x-5 md:gap-y-10">
        {cards.map(({ collection, imageUrl }) => (
          <Link
            key={collection.slug}
            href={`/shop?type=${collection.slug}`}
            className="group flex flex-col items-center gap-3 text-center"
          >
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-white p-3">
              <div className="relative h-full w-full">
                <Image
                  src={imageUrl}
                  alt={collection.label}
                  fill
                  className="object-contain transition-transform duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width: 768px) 45vw, 180px"
                />
              </div>
            </div>
            <span className="text-sm font-semibold text-fg">
              {collection.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
