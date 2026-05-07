import { Cart, ProductFilters, ProductListResponse, Product, Suggestion } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || `Request failed: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export async function getProducts(filters: ProductFilters): Promise<ProductListResponse> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== '' && v !== null) {
      params.append(k, String(v));
    }
  });
  return request<ProductListResponse>(`/api/products/?${params.toString()}`);
}

export async function getProduct(id: number): Promise<Product> {
  return request<Product>(`/api/products/${id}/`);
}

export async function getCategories(): Promise<string[]> {
  return request<string[]>('/api/products/categories/');
}

export async function getSuggestions(search: string): Promise<Suggestion[]> {
  const params = new URLSearchParams({ search });
  return request<Suggestion[]>(`/api/products/suggestions/?${params.toString()}`);
}

export async function getCart(sessionId: string): Promise<Cart> {
  const params = new URLSearchParams({ session_id: sessionId });
  return request<Cart>(`/api/cart/?${params.toString()}`);
}

export async function addToCart(
  sessionId: string,
  productId: number,
  quantity: number
): Promise<Cart> {
  return request<Cart>('/api/cart/', {
    method: 'POST',
    body: JSON.stringify({ session_id: sessionId, product_id: productId, quantity }),
  });
}

export async function updateCartItem(
  sessionId: string,
  itemId: number,
  quantity: number
): Promise<Cart> {
  return request<Cart>(`/api/cart/${itemId}/`, {
    method: 'PUT',
    body: JSON.stringify({ session_id: sessionId, quantity }),
  });
}

export async function removeCartItem(sessionId: string, itemId: number): Promise<Cart> {
  const params = new URLSearchParams({ session_id: sessionId });
  return request<Cart>(`/api/cart/${itemId}/?${params.toString()}`, { method: 'DELETE' });
}

export async function clearCart(sessionId: string): Promise<void> {
  const params = new URLSearchParams({ session_id: sessionId });
  await request(`/api/cart/clear/?${params.toString()}`, { method: 'DELETE' });
}
