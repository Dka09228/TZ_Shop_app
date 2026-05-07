export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: string;
  image: string | null;
  category: string | null;
  brand: string | null;
  rating: number;
  stock: number;
  created_at: string;
  updated_at: string;
}

export interface ProductListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}

export interface Suggestion {
  id: number;
  name: string;
  category: string | null;
  price: string;
}

export interface CartProductInfo {
  id: number;
  name: string;
  price: string;
  image: string | null;
  category: string | null;
}

export interface CartItem {
  id: number;
  product: CartProductInfo;
  quantity: number;
  subtotal: string;
}

export interface Cart {
  id: number;
  session_id: string;
  items: CartItem[];
  total: string;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}
