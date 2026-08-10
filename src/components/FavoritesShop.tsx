import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import {
  genderCollectionHandle,
  getFavoritesForGender,
  pickFavoriteImage,
  type FavoriteTile,
} from "@/lib/favorites";
import type { Product } from "@/lib/shopify/types";

export function FavoritesShop({
  gender,
  products,
}: {
  gender: "women" | "men";
  products: Product[];
}) {
  const tiles = getFavoritesForGender(gender);

  return (
    <div className="mx-auto max-w-[1440px] px-4 pt-10 sm:px-6 lg:px-10">
      <h1 className="font-display text-4xl tracking-[0.06em] sm:text-5xl">
        Favorites
      </h1>

      <div className="mt-6 flex gap-2">
        <GenderPill
          href={`/shop?collection=${genderCollectionHandle("women")}`}
          active={gender === "women"}
        >
          Women
        </GenderPill>
        <GenderPill
          href={`/shop?collection=${genderCollectionHandle("men")}`}
          active={gender === "men"}
        >
          Men
        </GenderPill>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {tiles.map((tile) => (
          <FavoriteCard
            key={tile.slug}
            tile={tile}
            gender={gender}
            image={pickFavoriteImage(products, tile)}
          />
        ))}
      </div>
    </div>
  );
}

function GenderPill({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full px-6 py-2.5 text-[12px] font-semibold tracking-[0.14em] uppercase transition-colors ${
        active
          ? "bg-fg text-bg"
          : "bg-bg-elevated text-fg hover:bg-bg-muted"
      }`}
    >
      {children}
    </Link>
  );
}

function FavoriteCard({
  tile,
  gender,
  image,
}: {
  tile: FavoriteTile;
  gender: "women" | "men";
  image: string;
}) {
  return (
    <Link
      href={`/shop?collection=${genderCollectionHandle(gender)}&type=${tile.slug}`}
      className="group block"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-bg-studio p-3 sm:p-4">
        <div className="relative h-full w-full">
          <Image
            src={image}
            alt={tile.label}
            fill
            className="object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-[1.02]"
            sizes="(max-width: 1024px) 50vw, 25vw"
          />
        </div>
      </div>
      <p className="mt-3 text-sm font-bold tracking-[0.08em] uppercase text-fg">
        {tile.label}
      </p>
    </Link>
  );
}
