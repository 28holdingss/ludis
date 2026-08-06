import Link from "next/link";
import { ProductGrid } from "@/components/ProductGrid";
import { FavoritesShop } from "@/components/FavoritesShop";
import {
  getCollectionBySlug,
  matchCollection,
  COLLECTIONS,
} from "@/components/CollectionGrid";
import {
  getFavoritesForGender,
  WOMEN_FAVORITES,
  MEN_FAVORITES,
} from "@/lib/favorites";
import {
  getCollectionByHandle,
  getProducts,
  isShopifyConfigured,
} from "@/lib/shopify/client";

const FILTERS = [
  { handle: "all", label: "All" },
  { handle: "women", label: "Women" },
  { handle: "men", label: "Men" },
  { handle: "new", label: "New" },
];

export const metadata = {
  title: "Shop",
};

function resolveType(typeSlug?: string) {
  if (!typeSlug) return undefined;
  return (
    getCollectionBySlug(typeSlug) ||
    WOMEN_FAVORITES.find((t) => t.slug === typeSlug) ||
    MEN_FAVORITES.find((t) => t.slug === typeSlug) ||
    COLLECTIONS.find((t) => t.slug === typeSlug)
  );
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ collection?: string; type?: string }>;
}) {
  const params = await searchParams;
  const handle = params.collection || "all";
  const typeSlug = params.type;
  const typeCollection = resolveType(typeSlug);
  const isGenderLanding =
    (handle === "women" || handle === "men") && !typeSlug;

  let products =
    handle === "all"
      ? await getProducts(100)
      : ((await getCollectionByHandle(handle))?.products ?? []);

  if (products.length === 0 && handle !== "all") {
    products = await getProducts(100);
  }

  const catalog = await getProducts(100);

  if (typeCollection) {
    products = products.filter((p) => matchCollection(p, typeCollection));
  }

  // Gender pages without Shopify collections still show catalog filtered loosely
  if (
    (handle === "women" || handle === "men") &&
    products.length === 0
  ) {
    products = catalog;
  }

  const shopifyCollection =
    !typeCollection && handle !== "all"
      ? await getCollectionByHandle(handle)
      : null;

  const title =
    typeCollection?.label ||
    shopifyCollection?.title ||
    (handle === "women" ? "Women" : handle === "men" ? "Men" : "Shop All");

  const live = isShopifyConfigured();
  const gender = handle === "men" ? "men" : "women";

  if (isGenderLanding) {
    const favorites = getFavoritesForGender(gender);
    const preview = catalog
      .filter((p) =>
        favorites.some((tile) => matchCollection(p, tile)),
      )
      .slice(0, 8);

    return (
      <div className="pt-20 pb-16">
        <FavoritesShop gender={gender} products={catalog} />
        {preview.length > 0 && (
          <div className="mt-6">
            <ProductGrid
              products={preview}
              title="Popular Now"
              subtitle={`Top picks in ${gender}.`}
              href={`/shop?collection=${gender}&type=${favorites[0].slug}`}
              linkLabel="Shop more"
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="pt-20">
      <div className="mx-auto max-w-[1440px] px-4 pt-10 sm:px-6 lg:px-10">
        {(handle === "women" || handle === "men") && (
          <div className="mb-6 flex gap-2">
            <Link
              href="/shop?collection=women"
              className={`rounded-full px-6 py-2.5 text-[12px] font-semibold tracking-[0.14em] uppercase ${
                handle === "women" ? "bg-fg text-bg" : "bg-bg-elevated text-fg"
              }`}
            >
              Women
            </Link>
            <Link
              href="/shop?collection=men"
              className={`rounded-full px-6 py-2.5 text-[12px] font-semibold tracking-[0.14em] uppercase ${
                handle === "men" ? "bg-fg text-bg" : "bg-bg-elevated text-fg"
              }`}
            >
              Men
            </Link>
          </div>
        )}

        <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-fg-muted">
          Ludis Aqtive
        </p>
        <h1 className="font-display mt-3 text-5xl tracking-[0.04em] sm:text-6xl">
          {title}
        </h1>
        {typeCollection && (
          <p className="mt-3 max-w-lg text-sm text-fg-muted">
            Browse {typeCollection.label.toLowerCase()} from the Ludis Aqtive
            lineup.
          </p>
        )}
        {!live && (
          <p className="mt-3 text-xs text-fg-muted">
            Preview mode — connect Storefront API to sync live Tapstitch
            products.
          </p>
        )}

        {handle !== "women" && handle !== "men" && (
          <div className="mt-8 flex flex-wrap gap-2 border-b border-border pb-6">
            {FILTERS.map((f) => {
              const active = !typeSlug && handle === f.handle;
              const href =
                f.handle === "all" ? "/shop" : `/shop?collection=${f.handle}`;
              return (
                <Link
                  key={f.handle}
                  href={href}
                  className={`rounded-full px-4 py-2 text-[11px] font-bold tracking-[0.18em] uppercase transition-colors ${
                    active
                      ? "bg-fg text-bg"
                      : "border border-border text-fg-muted hover:text-fg hover:border-fg"
                  }`}
                >
                  {f.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <div className="mx-auto max-w-[1440px] px-4 py-20 text-center sm:px-6 lg:px-10">
          <p className="text-fg-muted">No products in this collection yet.</p>
          <Link
            href="/shop"
            className="mt-6 inline-flex h-11 items-center bg-fg px-6 text-[11px] font-bold tracking-[0.18em] uppercase text-bg"
          >
            Shop All
          </Link>
        </div>
      )}
    </div>
  );
}
