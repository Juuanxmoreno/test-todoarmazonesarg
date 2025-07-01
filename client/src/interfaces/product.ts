interface ProductCategory {
  id: string;
  name: string;
  slug: string;
}

interface ProductSubcategory {
  id: string;
  name: string;
  slug: string;
}

interface ProductVariantColor {
  name: string;
  hex: string;
}

export interface ProductVariant {
  id: string;
  color: ProductVariantColor;
  stock: number;
  thumbnail: string;
  images: string[];
}

export interface Product {
  id: string;
  slug: string;
  thumbnail: string;
  primaryImage: string;
  category: ProductCategory[];
  subcategory: ProductSubcategory;
  productModel: string;
  sku: string;
  size?: string;
  costUSD: number;
  priceUSD: number;
  variants: ProductVariant[];
}

export interface ProductsResponse {
  products: Product[];
  nextCursor: string | null;
}
