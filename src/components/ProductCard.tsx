import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/shopify/types";
import { formatMoney } from "@/lib/format";

export function ProductCard({ product }: { product: Product }) {
  const price = product.priceRange.minVariantPrice;
  const image = product.featuredImage;
  const isNew = product.tags.includes("new");

  return (
    <Link
      href={`/shop/${product.handle}`}
      prefetch={false}
      className="group block"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-bg-studio">
        {image && (
          <Image
            src={image.url}
            alt={image.altText || product.title}
            fill
            className="object-cover object-[center_20%] mix-blend-multiply transition-transform duration-500 ease-out group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        )}
        {isNew && (
          <span className="absolute left-3 top-3 z-10 bg-fg px-2 py-1 text-[10px] font-bold tracking-[0.15em] uppercase text-bg">
            New
          </span>
        )}
      </div>
      <div className="mt-3 space-y-1">
        <h3 className="text-sm font-medium tracking-wide text-fg group-hover:underline">
          {product.title}
        </h3>
        <p className="text-sm font-bold text-fg-muted">
          {formatMoney(price.amount, price.currencyCode)}
        </p>
      </div>
    </Link>
  );
}
