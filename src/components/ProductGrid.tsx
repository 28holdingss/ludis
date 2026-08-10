import type { Product } from "@/lib/shopify/types";
import Link from "next/link";
import { ProductCard } from "./ProductCard";

export function ProductGrid({
  products,
  title,
  subtitle,
  href,
  linkLabel = "View all",
}: {
  products: Product[];
  title?: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
}) {
  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-10 lg:py-20">
      {(title || subtitle || href) && (
        <div className="mb-10 flex flex-col gap-3 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {title && (
              <h2 className="font-display text-4xl tracking-[0.04em] sm:text-5xl">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-2 max-w-md text-sm text-fg-muted">{subtitle}</p>
            )}
          </div>
          {href && (
            <Link
              href={href}
              className="text-[12px] font-semibold tracking-[0.16em] uppercase text-fg underline underline-offset-4 decoration-border hover:decoration-fg"
            >
              {linkLabel}
            </Link>
          )}
        </div>
      )}
      <div className="grid grid-cols-2 gap-x-1.5 gap-y-8 md:grid-cols-3 lg:grid-cols-4 lg:gap-y-10">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
