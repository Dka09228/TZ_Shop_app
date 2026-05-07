'use client';

import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Cart as CartType, CartItem } from '@/types';
import { updateCartItem, removeCartItem, clearCart } from '@/services/api';
import { getSessionId, dispatchCartUpdate } from '@/utils/session';
import { formatPrice } from '@/utils/helpers';

interface CartProps {
  cart: CartType;
  onCartUpdate: (cart: CartType) => void;
}

interface CartItemRowProps {
  item: CartItem;
  onQuantityChange: (itemId: number, quantity: number) => Promise<void>;
  onRemove: (itemId: number) => Promise<void>;
}

function CartItemRow({ item, onQuantityChange, onRemove }: CartItemRowProps) {
  const [loading, setLoading] = useState(false);

  const handleQty = async (delta: number) => {
    const newQty = item.quantity + delta;
    if (newQty < 1) return;
    setLoading(true);
    try {
      await onQuantityChange(item.id, newQty);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    setLoading(true);
    try {
      await onRemove(item.id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-4 py-5 border-b last:border-b-0 border-gray-100">
      <Link href={`/products/${item.product.id}`} className="flex-shrink-0">
        <img
          src={item.product.image || 'https://picsum.photos/seed/placeholder/100/100'}
          alt={item.product.name}
          className="w-20 h-20 object-cover rounded-xl"
        />
      </Link>

      <div className="flex-1 min-w-0">
        <Link href={`/products/${item.product.id}`}>
          <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors leading-tight">
            {item.product.name}
          </h3>
        </Link>
        {item.product.category && (
          <p className="text-sm text-gray-500 mt-0.5">{item.product.category}</p>
        )}
        <p className="text-sm text-gray-600 mt-1">{formatPrice(item.product.price)} each</p>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleQty(-1)}
              disabled={loading || item.quantity <= 1}
              className="w-7 h-7 rounded-md border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors font-bold"
            >
              −
            </button>
            <span className="w-8 text-center font-semibold text-sm">
              {loading ? (
                <svg className="animate-spin w-4 h-4 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                item.quantity
              )}
            </span>
            <button
              onClick={() => handleQty(1)}
              disabled={loading}
              className="w-7 h-7 rounded-md border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors font-bold"
            >
              +
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-bold text-gray-900">{formatPrice(item.subtotal)}</span>
            <button
              onClick={handleRemove}
              disabled={loading}
              className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40"
              title="Remove item"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Cart({ cart, onCartUpdate }: CartProps) {
  const [clearing, setClearing] = useState(false);

  const handleQuantityChange = async (itemId: number, quantity: number) => {
    const prevCart = cart;
    // Optimistic update
    const optimistic: CartType = {
      ...cart,
      items: cart.items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity,
              subtotal: (parseFloat(item.product.price) * quantity).toFixed(2),
            }
          : item
      ),
      total: cart.items
        .map((item) =>
          item.id === itemId ? parseFloat(item.product.price) * quantity : parseFloat(item.subtotal)
        )
        .reduce((a, b) => a + b, 0)
        .toFixed(2),
    };
    onCartUpdate(optimistic);

    try {
      const sessionId = getSessionId();
      const updated = await updateCartItem(sessionId, itemId, quantity);
      onCartUpdate(updated);
      dispatchCartUpdate();
    } catch (err) {
      onCartUpdate(prevCart);
      toast.error(err instanceof Error ? err.message : 'Failed to update quantity');
    }
  };

  const handleRemove = async (itemId: number) => {
    const prevCart = cart;
    // Optimistic update
    const optimistic: CartType = {
      ...cart,
      items: cart.items.filter((item) => item.id !== itemId),
      total: cart.items
        .filter((item) => item.id !== itemId)
        .reduce((sum, item) => sum + parseFloat(item.subtotal), 0)
        .toFixed(2),
    };
    onCartUpdate(optimistic);

    try {
      const sessionId = getSessionId();
      const updated = await removeCartItem(sessionId, itemId);
      onCartUpdate(updated);
      dispatchCartUpdate();
      toast.success('Item removed from cart');
    } catch (err) {
      onCartUpdate(prevCart);
      toast.error(err instanceof Error ? err.message : 'Failed to remove item');
    }
  };

  const handleClear = async () => {
    setClearing(true);
    const prevCart = cart;
    const empty: CartType = { ...cart, items: [], total: '0.00' };
    onCartUpdate(empty);

    try {
      const sessionId = getSessionId();
      await clearCart(sessionId);
      dispatchCartUpdate();
      toast.success('Cart cleared');
    } catch {
      onCartUpdate(prevCart);
      toast.error('Failed to clear cart');
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Items */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-gray-900">
              {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'}
            </h2>
            <button
              onClick={handleClear}
              disabled={clearing || cart.items.length === 0}
              className="text-sm text-red-500 hover:text-red-700 font-medium disabled:opacity-40 transition-colors"
            >
              Clear cart
            </button>
          </div>

          {cart.items.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">Your cart is empty</p>
              <Link href="/" className="btn-primary inline-block mt-4 text-sm">
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div>
              {cart.items.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl shadow-sm p-6 sticky top-20">
          <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>

          <div className="space-y-3">
            {cart.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-600 truncate flex-1 mr-2">
                  {item.product.name} ×{item.quantity}
                </span>
                <span className="text-gray-900 font-medium flex-shrink-0">
                  {formatPrice(item.subtotal)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 mt-4 pt-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="text-xl font-bold text-gray-900">{formatPrice(cart.total)}</span>
            </div>
          </div>

          <button className="btn-primary w-full mt-6 py-3 text-base">
            Proceed to Checkout
          </button>

          <Link
            href="/"
            className="block text-center text-sm text-gray-500 hover:text-gray-700 mt-3 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
