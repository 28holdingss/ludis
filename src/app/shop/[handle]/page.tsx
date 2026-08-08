import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ProductView } from "@/components/ProductView";
import { ProductGrid } from "@/components/ProductGrid";
import { getProductByHandle, getProducts } from "@/lib/shopify/client";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);
  return {
    title: product?.title ?? "Product",
    description: product?.description,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);
  if (!product) notFound();

  // Tapstitch republishes (e.g. …-1 with new colors) — use the richer URL.
  if (product.handle !== handle) {
    redirect(`/shop/${product.handle}`);
  }

  const related = (await getProducts())
    .filter((p) => p.handle !== product.handle)
    .slice(0, 4);

  return (
    <div className="pt-16">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <nav className="mb-6 text-sm text-fg-muted">
          <Link href="/shop" className="hover:text-fg">
            Catalog
          </Link>
          <span className="mx-2">/</span>
          <span className="text-fg">{product.title}</span>
        </nav>

        <ProductView product={product} />
      </div>

      {related.length > 0 && (
        <ProductGrid
          products={related}
          title="You May Also Like"
          subtitle="More from the Ludis Aqtive lineup."
        />
      )}
    </div>
  );
}
