// Color de una variante
interface Color {
  name: string;
  hex: string;
}

// Producto (usado en GET /cart)
interface Product {
  _id: string;
  slug: string;
  category: string[];
  subcategory: string;
  productModel: string;
  sku: string;
}

// Variante de producto (usado en GET /cart)
interface ProductVariant {
  _id: string;
  product: Product;
  color: Color;
  stock: number;
  images: string[];
  priceUSD: number;
  createdAt: string;
  updatedAt: string;
}

// Ítem dentro del carrito (puede tener string o el objeto completo como variante)
interface CartItem {
  productVariant: string | ProductVariant;
  quantity: number;
  subTotal: number;
}

// Carrito completo
export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  subTotal: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface AddItemToCartPayload {
  productVariantId: string;
  quantity: number;
}

export interface UpdateCartItemPayload {
  productVariantId: string;
}
