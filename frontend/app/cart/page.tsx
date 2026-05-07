'use client';

import { useEffect, useState } from 'react';
import { getCart } from '@/services/api';
import { Cart as CartType } from '@/types';
import CartComponent from '@/components/Cart';
import { getSessionId } from '@/utils/session';
import Link from 'next/link';

export default function CartPage() {
  const [cart, setCart] = useState<CartType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = () => {
    const sessionId = getSessionId();
    setLoading(true);
    getCart(sessionId)
      .then(setCart)
      .catch(() => setError('Failed to load cart'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCart();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-white rounded-xl p-6 flex gap-4">
              <div className="w-20 h-20 bg-gray-200 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={fetchCart} className="btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <p className="text-6xl mb-4">🛒</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Add some products to get started</p>
          <Link href="/" className="btn-primary inline-block">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
      <CartComponent cart={cart} onCartUpdate={setCart} />
    </div>
  );
}
