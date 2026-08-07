import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg-elevated">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-14 sm:px-6 lg:grid-cols-4 lg:px-10">
        <div className="lg:col-span-2">
          <p className="font-display text-3xl tracking-[0.06em]">
            Ludis Aqtive
          </p>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-fg-muted">
            Performance apparel for athletes who train with intent. Built to
            move. Designed to last.
          </p>
        </div>

        <div>
          <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-fg">
            Shop
          </p>
          <ul className="mt-4 space-y-2 text-sm text-fg-muted">
            <li>
              <Link href="/shop?collection=shop-women" className="hover:text-fg">
                Women
              </Link>
            </li>
            <li>
              <Link href="/shop?collection=shop-men" className="hover:text-fg">
                Men
              </Link>
            </li>
            <li>
              <Link href="/shop?collection=new-drops" className="hover:text-fg">
                New Drops
              </Link>
            </li>
            <li>
              <Link href="/shop" className="hover:text-fg">
                All Products
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-fg">
            Support
          </p>
          <ul className="mt-4 space-y-2 text-sm text-fg-muted">
            <li>Shipping &amp; Returns</li>
            <li>Size Guide</li>
            <li>Contact</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border px-4 py-5 sm:px-6 lg:px-10">
        <p className="text-xs text-fg-muted">
          © {new Date().getFullYear()} Ludis Aqtive. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
