'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Product } from '@/types';
import { addToCart } from '@/services/api';
import {
  getSessionId,
  addToCompare,
  removeFromCompare,
  isInCompare,
  dispatchCartUpdate,
} from '@/utils/session';
import { formatPrice } from '@/utils/helpers';

interface ProductDetailProps {
  product: Product;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-5 h-5 ${star <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-gray-600 ml-1">{rating.toFixed(1)} / 5.0</span>
    </div>
  );
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [inCompare, setInCompare] = useState(false);

  useEffect(() => {
    setInCompare(isInCompare(product.id));
  }, [product.id]);

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.min(Math.max(1, prev + delta), product.stock));
  };

  const handleAddToCart = async () => {
    if (product.stock === 0) {
      toast.error('This product is out of stock');
      return;
    }
    setAdding(true);
    try {
      const sessionId = getSessionId();
      await addToCart(sessionId, product.id, quantity);
      dispatchCartUpdate();
      toast.success(`${quantity}× ${product.name} added to cart!`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  const handleCompare = () => {
    if (inCompare) {
      removeFromCompare(product.id);
      setInCompare(false);
      toast('Removed from comparison', { icon: '⚖️' });
    } else {
      const added = addToCompare(product.id);
      if (added) {
        setInCompare(true);
        toast('Added to comparison', { icon: '⚖️' });
      } else {
        toast.error('You can compare up to 4 products at once');
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
      {/* Image */}
      <div className="relative">
        <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 shadow-sm">
          <img
            src={product.image || 'https://picsum.photos/seed/placeholder/600/600'}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
        {product.stock === 0 && (
          <div className="absolute top-4 left-4">
            <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
        {product.stock > 0 && product.stock <= 10 && (
          <div className="absolute top-4 left-4">
            <span className="bg-orange-500 text-white text-sm font-bold px-3 py-1 rounded-full">
              Only {product.stock} left!
            </span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-col">
        {product.category && (
          <span className="text-sm font-medium text-blue-600 uppercase tracking-wide">
            {product.category}
          </span>
        )}
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mt-2">{product.name}</h1>

        {product.brand && (
          <p className="text-gray-500 mt-1">
            by <span className="font-medium text-gray-700">{product.brand}</span>
          </p>
        )}

        <div className="mt-3">
          <StarRating rating={product.rating} />
        </div>

        <div className="mt-4">
          <span className="text-3xl font-bold text-gray-900">{formatPrice(product.price)}</span>
        </div>

        {product.description && (
          <p className="mt-4 text-gray-600 leading-relaxed">{product.description}</p>
        )}

        {/* Stock */}
        <div className="mt-4 flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}
          />
          <span className="text-sm text-gray-600">
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </span>
        </div>

        {product.stock > 0 && (
          <>
            {/* Quantity selector */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-bold text-lg"
                >
                  −
                </button>
                <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.stock}
                  className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-bold text-lg"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to cart */}
            <button
              onClick={handleAddToCart}
              disabled={adding}
              className="mt-6 btn-primary w-full py-3 text-base flex items-center justify-center gap-2"
            >
              {adding ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Adding...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Add {quantity > 1 ? `${quantity} items` : 'to Cart'}
                </>
              )}
            </button>
          </>
        )}

        {/* Compare button */}
        <button
          onClick={handleCompare}
          className={`mt-3 w-full py-3 rounded-lg font-medium text-sm border transition-colors flex items-center justify-center gap-2 ${
            inCompare
              ? 'bg-blue-50 text-blue-600 border-blue-300 hover:bg-blue-100'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          {inCompare ? 'Remove from Compare' : 'Add to Compare'}
        </button>
      </div>
    </div>
  );
}
