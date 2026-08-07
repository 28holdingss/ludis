import Link from "next/link";
import Image from "next/image";

export function Hero() {
  return (
    <section className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-black">
      <Image
        src="/images/hero-mobile.png"
        alt="Ludis Aqtive performance apparel"
        fill
        priority
        className="object-cover object-[center_35%] animate-fade-in md:hidden"
        sizes="100vw"
      />
      <Image
        src="/images/hero.png"
        alt="Ludis Aqtive performance apparel"
        fill
        priority
        className="hidden object-cover object-center animate-fade-in md:block"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-black/30 md:bg-black/35" />
      <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black/70 via-black/25 to-transparent md:h-[45%] md:from-black/55" />

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
              href="/shop?collection=bestsellers"
              className="inline-flex h-11 items-center bg-white px-7 text-[12px] font-semibold tracking-wide text-black transition-opacity hover:opacity-90"
            >
              Bestsellers
            </Link>
            <Link
              href="/shop?collection=shop-women"
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
