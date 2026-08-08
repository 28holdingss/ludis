export type Money = {
  amount: string;
  currencyCode: string;
};

export type ProductImage = {
  url: string;
  altText: string | null;
  width?: number;
  height?: number;
};

export type ProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: { name: string; value: string }[];
  price: Money;
  compareAtPrice?: Money | null;
  image?: ProductImage | null;
};

export type Product = {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml?: string;
  tags: string[];
  productType?: string;
  featuredImage: ProductImage | null;
  images: ProductImage[];
  priceRange: {
    minVariantPrice: Money;
    maxVariantPrice: Money;
  };
  variants: ProductVariant[];
  options: { name: string; values: string[] }[];
};

export type Collection = {
  id: string;
  handle: string;
  title: string;
  description: string;
  image: ProductImage | null;
  products: Product[];
};

export type CartLine = {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    product: {
      title: string;
      handle: string;
      featuredImage: ProductImage | null;
    };
    price: Money;
    selectedOptions: { name: string; value: string }[];
  };
};

export type Cart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
  };
  lines: CartLine[];
};
