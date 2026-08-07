"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";

const NAV = [
  { href: "/shop?collection=shop-women", label: "Women" },
  { href: "/shop?collection=shop-men", label: "Men" },
  { href: "/shop?collection=new-drops", label: "New" },
  { href: "/shop", label: "Explore" },
];

export function Header() {
  const { count, openCart } = useCart();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isHome = pathname === "/";
  const overHero = isHome && !scrolled && !menuOpen;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const linkClass = overHero
    ? "text-white/90 hover:text-white"
    : "text-fg/80 hover:text-fg";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        overHero
          ? "bg-transparent"
          : "bg-bg/95 backdrop-blur-md border-b border-border"
      }`}
    >
      <div className="mx-auto flex h-[4.25rem] max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-10">
        <button
          type="button"
          className={`lg:hidden text-xs font-semibold tracking-[0.18em] uppercase ${linkClass}`}
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-label="Toggle menu"
        >
          {menuOpen ? "Close" : "Menu"}
        </button>

        <nav className="hidden lg:flex items-center gap-7">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-[13px] font-medium tracking-wide transition-colors ${linkClass}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/"
          className={`font-display absolute left-1/2 -translate-x-1/2 text-[1.4rem] sm:text-[1.65rem] tracking-[0.12em] transition-colors ${
            overHero ? "text-white" : "text-fg"
          }`}
        >
          Ludis Aqtive
        </Link>

        <div className="ml-auto flex items-center gap-5 lg:ml-0">
          <Link
            href="/shop"
            className={`hidden sm:flex transition-colors ${linkClass}`}
            aria-label="Search"
          >
            <SearchIcon />
          </Link>
          <button
            type="button"
            onClick={openCart}
            className={`relative transition-colors ${linkClass}`}
            aria-label="Bag"
          >
            <BagIcon />
            {count > 0 && (
              <span
                className={`absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center px-1 text-[10px] font-bold ${
                  overHero ? "bg-white text-black" : "bg-fg text-bg"
                }`}
              >
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="lg:hidden border-t border-border bg-bg px-4 py-6 animate-fade-in">
          <div className="flex flex-col gap-4">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="text-2xl font-semibold text-fg"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M20 20l-3.5-3.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 8h12l-1 12H7L6 8z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M9 8V7a3 3 0 0 1 6 0v1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
