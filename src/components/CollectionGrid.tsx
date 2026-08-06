import Link from "next/link";
import Image from "next/image";
import { getProducts } from "@/lib/shopify/client";
import type { Product } from "@/lib/shopify/types";

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
    keywords: ["sport", "active", "training", "athletic", "skirt"],
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

function pickProduct(
  products: Product[],
  collection: CollectionDef,
): Product | undefined {
  return products.find(
    (p) => matchCollection(p, collection) && p.featuredImage?.url,
  );
}

export async function CollectionGrid() {
  const products = await getProducts(50);

  const cards = COLLECTIONS.map((collection) => {
    const product = pickProduct(products, collection);
    return { collection, product };
  }).filter((c) => c.product);

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
        {cards.map(({ collection, product }) => (
          <Link
            key={collection.slug}
            href={`/shop?type=${collection.slug}`}
            className="group flex flex-col items-center gap-3 text-center"
          >
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-white p-3">
              <div className="relative h-full w-full">
                <Image
                  src={product!.featuredImage!.url}
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
