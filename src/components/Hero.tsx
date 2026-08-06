import Link from "next/link";
import Image from "next/image";

export function Hero() {
  return (
    <section className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-black">
      <Image
        src="/hero.png"
        alt="Ludis Aqtive performance apparel"
        fill
        priority
        className="object-cover object-center animate-fade-in"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-black/35" />

      <div className="relative mx-auto flex h-full max-w-[1440px] flex-col justify-end px-4 pb-10 pt-24 sm:px-6 sm:pb-14 lg:px-10 lg:pb-16">
        <div className="max-w-xl">
          <h1 className="animate-fade-up font-display text-[clamp(2.5rem,6vw,4.25rem)] leading-[0.95] tracking-[0.04em] text-white">
            Our Bestsellers
          </h1>
          <p className="animate-fade-up delay-1 mt-3 text-base text-white/85 sm:text-lg">
            Everyone loves them, and so will you.
          </p>
          <div className="animate-fade-up delay-2 mt-7 flex flex-wrap gap-3">
            <Link
              href="/shop?collection=new"
              className="inline-flex h-11 items-center bg-white px-7 text-[12px] font-semibold tracking-wide text-black transition-opacity hover:opacity-90"
            >
              Bestsellers
            </Link>
            <Link
              href="/shop?collection=women"
              className="inline-flex h-11 items-center border border-white px-7 text-[12px] font-semibold tracking-wide text-white transition-colors hover:bg-white hover:text-black"
            >
              Shop Women
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
