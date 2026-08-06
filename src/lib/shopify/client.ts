import { MOCK_COLLECTIONS, MOCK_PRODUCTS } from "./mock";
import {
  ADD_TO_CART_MUTATION,
  COLLECTION_BY_HANDLE_QUERY,
  CREATE_CART_MUTATION,
  PRODUCT_BY_HANDLE_QUERY,
  PRODUCTS_QUERY,
} from "./queries";
import type { Cart, Collection, Product } from "./types";

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const storefrontToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION || "2025-01";

export function isShopifyConfigured() {
  return Boolean(domain && storefrontToken);
}

type ShopifyImage = {
  url: string;
  altText: string | null;
  width?: number;
  height?: number;
};

type ShopifyProductNode = {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml?: string;
  tags: string[];
  productType?: string;
  featuredImage: ShopifyImage | null;
  images?: { edges: { node: ShopifyImage }[] };
  priceRange: Product["priceRange"];
  options: { name: string; values: string[] }[];
  variants: {
    edges: {
      node: Product["variants"][number];
    }[];
  };
};

function normalizeProduct(node: ShopifyProductNode): Product {
  return {
    id: node.id,
    handle: node.handle,
    title: node.title,
    description: node.description,
    descriptionHtml: node.descriptionHtml,
    tags: node.tags ?? [],
    productType: node.productType,
    featuredImage: node.featuredImage,
    images: node.images?.edges.map((e) => e.node) ?? [],
    priceRange: node.priceRange,
    options: node.options ?? [],
    variants: node.variants.edges.map((e) => e.node),
  };
}

async function storefrontFetch<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T | null> {
  if (!isShopifyConfigured()) return null;

  const res = await fetch(
    `https://${domain}/api/${apiVersion}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": storefrontToken!,
      },
      body: JSON.stringify({ query, variables }),
      next: { revalidate: 60 },
    },
  );

  if (!res.ok) {
    console.error("Shopify Storefront error", res.status, await res.text());
    return null;
  }

  const json = await res.json();
  if (json.errors) {
    console.error("Shopify GraphQL errors", json.errors);
    return null;
  }

  return json.data as T;
}

export async function getProducts(first = 100): Promise<Product[]> {
  const data = await storefrontFetch<{
    products: { edges: { node: ShopifyProductNode }[] };
  }>(PRODUCTS_QUERY, { first });

  if (!data) return MOCK_PRODUCTS;
  return data.products.edges.map((e) => normalizeProduct(e.node));
}

export async function getProductByHandle(
  handle: string,
): Promise<Product | null> {
  const data = await storefrontFetch<{ product: ShopifyProductNode | null }>(
    PRODUCT_BY_HANDLE_QUERY,
    { handle },
  );

  if (data?.product) return normalizeProduct(data.product);

  return MOCK_PRODUCTS.find((p) => p.handle === handle) ?? null;
}

export async function getCollectionByHandle(
  handle: string,
): Promise<Collection | null> {
  if (handle === "all" && !isShopifyConfigured()) {
    return MOCK_COLLECTIONS.find((c) => c.handle === "all") ?? null;
  }

  const data = await storefrontFetch<{
    collection: {
      id: string;
      handle: string;
      title: string;
      description: string;
      image: Collection["image"];
      products: { edges: { node: ShopifyProductNode }[] };
    } | null;
  }>(COLLECTION_BY_HANDLE_QUERY, { handle, first: 100 });

  if (data?.collection) {
    return {
      id: data.collection.id,
      handle: data.collection.handle,
      title: data.collection.title,
      description: data.collection.description,
      image: data.collection.image,
      products: data.collection.products.edges.map((e) =>
        normalizeProduct(e.node),
      ),
    };
  }

  return MOCK_COLLECTIONS.find((c) => c.handle === handle) ?? null;
}

function matchesTagOrTitle(product: Product, words: string[]) {
  const haystack = [product.title, ...product.tags, product.productType ?? ""]
    .join(" ")
    .toLowerCase();
  return words.some((w) => haystack.includes(w));
}

export async function getCatalogSections() {
  const products = await getProducts(100);

  const taggedBestsellers = products.filter((p) =>
    matchesTagOrTitle(p, ["bestseller", "best seller", "best-selling"]),
  );
  const taggedNew = products.filter((p) =>
    matchesTagOrTitle(p, ["new", "drop", "latest"]),
  );

  const bestsellers =
    taggedBestsellers.length >= 4
      ? taggedBestsellers.slice(0, 8)
      : products.slice(0, 8);

  const bestsellerIds = new Set(bestsellers.map((p) => p.id));

  const newest =
    taggedNew.filter((p) => !bestsellerIds.has(p.id)).length >= 4
      ? taggedNew.filter((p) => !bestsellerIds.has(p.id)).slice(0, 8)
      : products.filter((p) => !bestsellerIds.has(p.id)).slice(-8).reverse();

  const used = new Set([...bestsellers, ...newest].map((p) => p.id));
  const more = products.filter((p) => !used.has(p.id)).slice(0, 8);

  return { bestsellers, newest, more, all: products };
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const { bestsellers } = await getCatalogSections();
  return bestsellers.slice(0, 8);
}

type CartPayload = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: Cart["cost"];
  lines: {
    edges: {
      node: {
        id: string;
        quantity: number;
        merchandise: Cart["lines"][number]["merchandise"];
      };
    }[];
  };
};

function normalizeCart(cart: CartPayload): Cart {
  return {
    id: cart.id,
    checkoutUrl: cart.checkoutUrl,
    totalQuantity: cart.totalQuantity,
    cost: cart.cost,
    lines: cart.lines.edges.map((e) => e.node),
  };
}

export async function createCart(
  variantId: string,
  quantity = 1,
): Promise<Cart | null> {
  if (!isShopifyConfigured()) {
    return {
      id: "local-cart",
      checkoutUrl: "#",
      totalQuantity: quantity,
      cost: {
        subtotalAmount: { amount: "0", currencyCode: "GBP" },
        totalAmount: { amount: "0", currencyCode: "GBP" },
      },
      lines: [],
    };
  }

  const data = await storefrontFetch<{
    cartCreate: { cart: CartPayload; userErrors: { message: string }[] };
  }>(CREATE_CART_MUTATION, {
    lines: [{ merchandiseId: variantId, quantity }],
  });

  if (!data?.cartCreate.cart) return null;
  return normalizeCart(data.cartCreate.cart);
}

export async function addToCart(
  cartId: string,
  variantId: string,
  quantity = 1,
): Promise<Cart | null> {
  if (!isShopifyConfigured() || cartId === "local-cart") {
    return createCart(variantId, quantity);
  }

  const data = await storefrontFetch<{
    cartLinesAdd: { cart: CartPayload; userErrors: { message: string }[] };
  }>(ADD_TO_CART_MUTATION, {
    cartId,
    lines: [{ merchandiseId: variantId, quantity }],
  });

  if (!data?.cartLinesAdd.cart) return null;
  return normalizeCart(data.cartLinesAdd.cart);
}
