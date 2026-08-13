import type { Collection, Product } from "./types";

const img = (id: string, w = 1200, h = 1500) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

function money(amount: string): { amount: string; currencyCode: string } {
  return { amount, currencyCode: "USD" };
}

function sizes(productId: string, basePrice: string): Product["variants"] {
  return ["XS", "S", "M", "L", "XL"].map((size, i) => ({
    id: `gid://shopify/ProductVariant/mock-${productId}-${size}`,
    title: size,
    availableForSale: size !== "XS" || i % 2 === 0,
    selectedOptions: [{ name: "Size", value: size }],
    price: money(basePrice),
    compareAtPrice: null,
  }));
}

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "gid://shopify/Product/mock-1",
    handle: "apex-training-tee",
    title: "Apex Training Tee",
    description:
      "Lightweight performance tee built for high-output sessions. Breathable mesh panels and a athletic fit that moves with you.",
    tags: ["new", "bestseller", "men"],
    productType: "Tops",
    featuredImage: {
      url: img("photo-1571019614242-c5c5dee9f50b"),
      altText: "Apex Training Tee",
    },
    images: [
      {
        url: img("photo-1571019614242-c5c5dee9f50b"),
        altText: "Apex Training Tee",
      },
      {
        url: img("photo-1517836357463-d25dfeac3438"),
        altText: "Apex Training Tee lifestyle",
      },
    ],
    priceRange: {
      minVariantPrice: money("28.00"),
      maxVariantPrice: money("28.00"),
    },
    variants: sizes("1", "28.00"),
    options: [{ name: "Size", values: ["XS", "S", "M", "L", "XL"] }],
  },
  {
    id: "gid://shopify/Product/mock-2",
    handle: "volt-seamless-leggings",
    title: "Volt Seamless Leggings",
    description:
      "Sculpting seamless fabric with four-way stretch. High-rise waistband stays locked through squats, runs, and everything between.",
    tags: ["bestseller", "women"],
    productType: "Bottoms",
    featuredImage: {
      url: img("photo-1518611012118-696072aa579a"),
      altText: "Volt Seamless Leggings",
    },
    images: [
      {
        url: img("photo-1518611012118-696072aa579a"),
        altText: "Volt Seamless Leggings",
      },
    ],
    priceRange: {
      minVariantPrice: money("48.00"),
      maxVariantPrice: money("48.00"),
    },
    variants: sizes("2", "48.00"),
    options: [{ name: "Size", values: ["XS", "S", "M", "L", "XL"] }],
  },
  {
    id: "gid://shopify/Product/mock-3",
    handle: "forge-oversized-hoodie",
    title: "Forge Oversized Hoodie",
    description:
      "Heavyweight fleece with dropped shoulders. Warm-up essential that looks as sharp off the gym floor as on it.",
    tags: ["new", "men", "women"],
    productType: "Hoodies",
    featuredImage: {
      url: img("photo-1556817411-31ae72fa3ea0"),
      altText: "Forge Oversized Hoodie",
    },
    images: [
      {
        url: img("photo-1556817411-31ae72fa3ea0"),
        altText: "Forge Oversized Hoodie",
      },
    ],
    priceRange: {
      minVariantPrice: money("62.00"),
      maxVariantPrice: money("62.00"),
    },
    variants: sizes("3", "62.00"),
    options: [{ name: "Size", values: ["XS", "S", "M", "L", "XL"] }],
  },
  {
    id: "gid://shopify/Product/mock-4",
    handle: "pulse-sports-bra",
    title: "Pulse Sports Bra",
    description:
      "Medium-support bra with soft-touch straps and a racerback cut. Built for HIIT, lifting, and long studio sessions.",
    tags: ["women", "new"],
    productType: "Tops",
    featuredImage: {
      url: img("photo-1518310383802-640c2de311b2"),
      altText: "Pulse Sports Bra",
    },
    images: [
      {
        url: img("photo-1518310383802-640c2de311b2"),
        altText: "Pulse Sports Bra",
      },
    ],
    priceRange: {
      minVariantPrice: money("34.00"),
      maxVariantPrice: money("34.00"),
    },
    variants: sizes("4", "34.00"),
    options: [{ name: "Size", values: ["XS", "S", "M", "L", "XL"] }],
  },
  {
    id: "gid://shopify/Product/mock-5",
    handle: "stride-training-shorts",
    title: "Stride Training Shorts",
    description:
      "7\" inseam shorts with internal brief and zip pocket. Lightweight shell for heat sessions and outdoor miles.",
    tags: ["men", "bestseller"],
    productType: "Bottoms",
    featuredImage: {
      url: img("photo-1599058945522-28d584b6f14f"),
      altText: "Stride Training Shorts",
    },
    images: [
      {
        url: img("photo-1599058945522-28d584b6f14f"),
        altText: "Stride Training Shorts",
      },
    ],
    priceRange: {
      minVariantPrice: money("36.00"),
      maxVariantPrice: money("36.00"),
    },
    variants: sizes("5", "36.00"),
    options: [{ name: "Size", values: ["XS", "S", "M", "L", "XL"] }],
  },
  {
    id: "gid://shopify/Product/mock-6",
    handle: "altitude-crop-jacket",
    title: "Altitude Crop Jacket",
    description:
      "Wind-resistant crop jacket with reflective detailing. Layer up for early runs and late finishes.",
    tags: ["women", "new"],
    productType: "Outerwear",
    featuredImage: {
      url: img("photo-1541534741688-6078c6bfb5c5"),
      altText: "Altitude Crop Jacket",
    },
    images: [
      {
        url: img("photo-1541534741688-6078c6bfb5c5"),
        altText: "Altitude Crop Jacket",
      },
    ],
    priceRange: {
      minVariantPrice: money("72.00"),
      maxVariantPrice: money("72.00"),
    },
    variants: sizes("6", "72.00"),
    options: [{ name: "Size", values: ["XS", "S", "M", "L", "XL"] }],
  },
];

export const MOCK_COLLECTIONS: Collection[] = [
  {
    id: "gid://shopify/Collection/mock-all",
    handle: "all",
    title: "All Products",
    description: "The full Ludis Aqtive lineup.",
    image: null,
    products: MOCK_PRODUCTS,
  },
  {
    id: "gid://shopify/Collection/mock-women",
    handle: "shop-women",
    title: "Shop Women",
    description: "Performance pieces engineered for her.",
    image: {
      url: img("photo-1518611012118-696072aa579a", 1600, 2000),
      altText: "Women",
    },
    products: MOCK_PRODUCTS.filter((p) => p.tags.includes("women")),
  },
  {
    id: "gid://shopify/Collection/mock-men",
    handle: "shop-men",
    title: "Shop Men",
    description: "Training kit built to push harder.",
    image: {
      url: img("photo-1571019614242-c5c5dee9f50b", 1600, 2000),
      altText: "Men",
    },
    products: MOCK_PRODUCTS.filter((p) => p.tags.includes("men")),
  },
  {
    id: "gid://shopify/Collection/mock-new",
    handle: "new-drops",
    title: "New Drops",
    description: "Fresh from the floor.",
    image: {
      url: img("photo-1556817411-31ae72fa3ea0", 1600, 2000),
      altText: "New Drops",
    },
    products: MOCK_PRODUCTS.filter((p) => p.tags.includes("new")),
  },
];

export const HERO_IMAGE = img("photo-1534438327276-14e5300c3a48", 2400, 1600);
