import Image from "next/image";
import { Hero } from "@/components/Hero";
import { CategorySplit } from "@/components/CategorySplit";
import { ProductGrid } from "@/components/ProductGrid";
import { getCatalogSections } from "@/lib/shopify/client";

export default async function Home() {
  const { wears, bestsellers, newest, more } = await getCatalogSections();

  return (
    <>
      <Hero />
      <ProductGrid
        products={wears}
        title="Ludis Aqtive Wears"
        subtitle="Performance sportswear built for training and everyday movement."
        href="/shop?collection=ludis-aqtive-wears"
        linkLabel="Shop wears"
      />
      <ProductGrid
        products={bestsellers}
        title="Bestsellers"
        subtitle="The pieces everyone keeps coming back for."
        linkLabel="Shop bestsellers"
      />
      <ProductGrid
        products={newest}
        title="New Drops"
        subtitle="Fresh from the floor — just landed."
        href="/shop?collection=new-drops"
        linkLabel="View new"
      />
      <CategorySplit />
      {more.length > 0 && (
        <ProductGrid
          products={more}
          title="More to Explore"
          subtitle="Keep building the kit."
          href="/shop?collection=more-to-explore"
          linkLabel="Explore more"
        />
      )}
      <section className="relative min-h-[70vh] w-full overflow-hidden">
        <Image
          src="/images/banner.png"
          alt="Ludis Aqtive athletes"
          fill
          className="object-cover object-[center_30%]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative mx-auto flex min-h-[70vh] max-w-[1440px] items-end px-4 py-16 sm:px-6 lg:items-center lg:px-10 lg:py-24">
          <h2 className="font-display text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.92] tracking-[0.02em] text-white">
            Engineered
            <br />
            for the
            <br />
            grind
          </h2>
        </div>
      </section>
    </>
  );
}
