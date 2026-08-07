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

/** Market used for inventory/shipping at checkout (ISO country). GH has no Tapstitch stock. */
export function getCheckoutCountryCode() {
  const raw = (
    process.env.NEXT_PUBLIC_SHOPIFY_CHECKOUT_COUNTRY || "US"
  ).toUpperCase();
  return /^[A-Z]{2}$/.test(raw) ? raw : "US";
}

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
  options: { cache?: RequestCache } = {},
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
      ...(options.cache
        ? { cache: options.cache }
        : // Short TTL so catalog/media updates show up without a hard refresh.
          { next: { revalidate: 15 } }),
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
  // Always fresh — cached product payloads keep deleted Shopify images around
  // on client navigations until a hard refresh.
  const data = await storefrontFetch<{ product: ShopifyProductNode | null }>(
    PRODUCT_BY_HANDLE_QUERY,
    { handle },
    { cache: "no-store" },
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

  const wearsCollection = await getCollectionByHandle("ludis-aqtive-wears");
  const newDropsCollection = await getCollectionByHandle("new-drops");
  const bestsellersCollection = await getCollectionByHandle("bestsellers");
  const moreCollection = await getCollectionByHandle("more-to-explore");
  const sportswearKeywords = [
    "sport",
    "active",
    "training",
    "athletic",
    "skirt",
    "legging",
    "bra",
    "jogger",
    "performance",
    "seamless",
    "gym",
    "workout",
    "tank",
    "short",
  ];

  const sportswearMatches = products.filter((p) =>
    matchesTagOrTitle(p, sportswearKeywords),
  );

  const wears =
    wearsCollection && wearsCollection.products.length > 0
      ? wearsCollection.products.slice(0, 12)
      : sportswearMatches.length >= 4
        ? sportswearMatches.slice(0, 8)
        : products.slice(0, 8);

  const wearIds = new Set(wears.map((p) => p.id));

  const taggedBestsellers = products.filter((p) =>
    matchesTagOrTitle(p, ["bestseller", "best seller", "best-selling"]),
  );
  const taggedNew = products.filter((p) =>
    matchesTagOrTitle(p, ["new", "drop", "latest"]),
  );

  const bestsellers =
    bestsellersCollection && bestsellersCollection.products.length > 0
      ? bestsellersCollection.products.slice(0, 12)
      : taggedBestsellers.filter((p) => !wearIds.has(p.id)).length >= 4
        ? taggedBestsellers.filter((p) => !wearIds.has(p.id)).slice(0, 8)
        : products.filter((p) => !wearIds.has(p.id)).slice(0, 8);

  const newest =
    newDropsCollection && newDropsCollection.products.length > 0
      ? newDropsCollection.products.slice(0, 12)
      : taggedNew.filter((p) => !wearIds.has(p.id)).length >= 4
        ? taggedNew.filter((p) => !wearIds.has(p.id)).slice(0, 8)
        : products.filter((p) => !wearIds.has(p.id)).slice(-8).reverse();

  const more =
    moreCollection && moreCollection.products.length > 0
      ? moreCollection.products.slice(0, 12)
      : products
          .filter(
            (p) =>
              ![...wears, ...bestsellers, ...newest].some((x) => x.id === p.id),
          )
          .slice(0, 8);

  return { wears, bestsellers, newest, more, all: products };
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
  const result = await createCheckoutCart([
    { merchandiseId: variantId, quantity },
  ]);
  return result.cart;
}

export type CheckoutCartResult = {
  cart: Cart | null;
  userErrors: { field?: string[]; message: string }[];
  invalidMerchandiseIds: string[];
};

export async function createCheckoutCart(
  lines: { merchandiseId: string; quantity: number }[],
): Promise<CheckoutCartResult> {
  const empty: CheckoutCartResult = {
    cart: null,
    userErrors: [],
    invalidMerchandiseIds: [],
  };

  if (!isShopifyConfigured()) return empty;
  if (lines.length === 0) return empty;

  // Drop preview/mock variant IDs
  const validLines = lines.filter(
    (line) =>
      /^gid:\/\/shopify\/ProductVariant\/\d+$/.test(line.merchandiseId) &&
      line.quantity > 0,
  );

  if (validLines.length === 0) {
    return {
      ...empty,
      userErrors: [
        {
          message:
            "Your bag has outdated items. Remove them and add products again.",
        },
      ],
      invalidMerchandiseIds: lines.map((l) => l.merchandiseId),
    };
  }

  async function attempt(
    attemptLines: { merchandiseId: string; quantity: number }[],
  ): Promise<CheckoutCartResult> {
    const data = await storefrontFetch<{
      cartCreate: {
        cart: CartPayload | null;
        userErrors: { field?: string[]; message: string }[];
      };
    }>(
      CREATE_CART_MUTATION,
      {
        lines: attemptLines,
        buyerIdentity: { countryCode: getCheckoutCountryCode() },
      },
      { cache: "no-store" },
    );

    if (!data?.cartCreate) {
      return {
        cart: null,
        userErrors: [{ message: "Shopify did not return a cart response." }],
        invalidMerchandiseIds: [],
      };
    }

    const userErrors = data.cartCreate.userErrors ?? [];
    const invalidMerchandiseIds = attemptLines
      .filter((line) =>
        userErrors.some(
          (err) =>
            err.message.toLowerCase().includes("does not exist") &&
            err.message.includes(line.merchandiseId),
        ),
      )
      .map((line) => line.merchandiseId);

    // Also catch index-based errors: lines.N.merchandiseId
    for (const err of userErrors) {
      const path = err.field ?? [];
      const linesIdx = path.indexOf("lines");
      if (
        linesIdx >= 0 &&
        err.message.toLowerCase().includes("does not exist") &&
        path[linesIdx + 1] != null
      ) {
        const i = Number(path[linesIdx + 1]);
        if (Number.isFinite(i) && attemptLines[i]) {
          invalidMerchandiseIds.push(attemptLines[i].merchandiseId);
        }
      }
    }

    const uniqueInvalid = [...new Set(invalidMerchandiseIds)];

    if (data.cartCreate.cart?.checkoutUrl) {
      return {
        cart: normalizeCart(data.cartCreate.cart),
        userErrors,
        invalidMerchandiseIds: uniqueInvalid,
      };
    }

    return {
      cart: null,
      userErrors,
      invalidMerchandiseIds: uniqueInvalid,
    };
  }

  let result = await attempt(validLines);

  if (!result.cart && result.invalidMerchandiseIds.length > 0) {
    const retryLines = validLines.filter(
      (line) => !result.invalidMerchandiseIds.includes(line.merchandiseId),
    );
    if (retryLines.length > 0) {
      const retry = await attempt(retryLines);
      return {
        ...retry,
        invalidMerchandiseIds: [
          ...new Set([
            ...result.invalidMerchandiseIds,
            ...retry.invalidMerchandiseIds,
          ]),
        ],
      };
    }
  }

  return result;
}

/** Online Store cart permalink — pin country so IP market (e.g. GH) doesn’t zero stock. */
export function buildCartPermalink(
  lines: { merchandiseId: string; quantity: number }[],
): string | null {
  if (!domain || lines.length === 0) return null;

  const parts = lines
    .map((line) => {
      const match = line.merchandiseId.match(
        /^gid:\/\/shopify\/ProductVariant\/(\d+)$/,
      );
      if (!match) return null;
      return `${match[1]}:${Math.max(1, Math.floor(line.quantity))}`;
    })
    .filter((part): part is string => Boolean(part));

  if (parts.length === 0) return null;
  const country = getCheckoutCountryCode();
  return `https://${domain}/cart/${parts.join(",")}?country=${country}`;
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
  }>(
    ADD_TO_CART_MUTATION,
    {
      cartId,
      lines: [{ merchandiseId: variantId, quantity }],
    },
    { cache: "no-store" },
  );

  if (!data?.cartLinesAdd.cart) return null;
  return normalizeCart(data.cartLinesAdd.cart);
}
