import Link from "next/link";
import { Hero } from "@/components/Hero";
import { CategorySplit } from "@/components/CategorySplit";
import { CollectionGrid } from "@/components/CollectionGrid";
import { ProductGrid } from "@/components/ProductGrid";
import {
  getCatalogSections,
  isShopifyConfigured,
} from "@/lib/shopify/client";

export default async function Home() {
  const { bestsellers, newest, more } = await getCatalogSections();
  const live = isShopifyConfigured();

  return (
    <>
      <Hero />
      <CollectionGrid />
      <ProductGrid
        products={bestsellers}
        title="Bestsellers"
        subtitle="The pieces everyone keeps coming back for."
        href="/shop"
        linkLabel="Shop all"
      />
      <ProductGrid
        products={newest}
        title="New Drops"
        subtitle="Fresh from the floor — just landed."
        href="/shop?collection=new"
        linkLabel="View new"
      />
      <CategorySplit />
      {more.length > 0 && (
        <ProductGrid
          products={more}
          title="More to Explore"
          subtitle="Keep building the kit."
          href="/shop"
          linkLabel="Shop all"
        />
      )}
      <section className="mx-auto max-w-[1440px] px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <h2 className="font-display text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.92] tracking-[0.02em]">
            Engineered
            <br />
            for the
            <br />
            <span className="text-fg">grind</span>
          </h2>
          <div className="space-y-6">
            <p className="max-w-md text-base leading-relaxed text-fg-muted">
              From seamless leggings to heavyweight hoodies — every Ludis Aqtive
              piece is cut for movement, recovery, and the life between sets.
            </p>
            <Link
              href="/shop"
              className="inline-flex h-12 items-center bg-fg px-7 text-[11px] font-bold tracking-[0.2em] uppercase text-bg hover:bg-neutral-800 transition-colors"
            >
              Shop All
            </Link>
            {!live && (
              <p className="text-xs text-fg-muted/80">
                Showing preview products. Connect Shopify Storefront API to load
                your Tapstitch catalog.
              </p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
