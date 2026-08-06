import Link from "next/link";
import Image from "next/image";

const categories = [
  {
    href: "/shop?collection=women",
    label: "Women",
    copy: "Sculpt. Stretch. Dominate.",
    image: "/shop-women.png",
    position: "object-[70%_center]",
  },
  {
    href: "/shop?collection=men",
    label: "Men",
    copy: "Built for the heavy sets.",
    image: "/shop-men.png",
    position: "object-center",
  },
];

export function CategorySplit() {
  return (
    <section className="grid md:grid-cols-2">
      {categories.map((cat) => (
        <Link
          key={cat.href}
          href={cat.href}
          className="group relative min-h-[70vh] overflow-hidden bg-bg-muted"
        >
          <Image
            src={cat.image}
            alt={`Shop ${cat.label}`}
            fill
            className={`object-cover transition-transform duration-700 group-hover:scale-105 ${cat.position}`}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10" />
          <div className="absolute inset-x-0 bottom-0 p-8 sm:p-12">
            <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-white/70">
              Shop
            </p>
            <h2 className="font-display mt-2 text-5xl tracking-[0.04em] text-white sm:text-6xl">
              {cat.label}
            </h2>
            <p className="mt-3 text-sm text-white/80">{cat.copy}</p>
            <span className="mt-6 inline-flex text-[11px] font-bold tracking-[0.2em] uppercase text-white underline decoration-white decoration-2 underline-offset-8 transition-opacity group-hover:opacity-70">
              Explore
            </span>
          </div>
        </Link>
      ))}
    </section>
  );
}
