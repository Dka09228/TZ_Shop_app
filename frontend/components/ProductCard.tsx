'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Product } from '@/types';
import { addToCart } from '@/services/api';
import { getSessionId, addToCompare, removeFromCompare, isInCompare, dispatchCartUpdate } from '@/utils/session';
import { formatPrice } from '@/utils/helpers';

interface ProductCardProps {
  product: Product;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-3.5 h-3.5 ${star <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-xs text-gray-500 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function ProductCard({ product }: ProductCardProps) {
  const [adding, setAdding] = useState(false);
  const [inCompare, setInCompare] = useState(false);

  useEffect(() => {
    setInCompare(isInCompare(product.id));
    const handler = () => setInCompare(isInCompare(product.id));
    window.addEventListener('compareUpdated', handler);
    return () => window.removeEventListener('compareUpdated', handler);
  }, [product.id]);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock === 0) {
      toast.error('This product is out of stock');
      return;
    }
    setAdding(true);
    try {
      const sessionId = getSessionId();
      await addToCart(sessionId, product.id, 1);
      dispatchCartUpdate();
      toast.success(`${product.name} added to cart!`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
        toast.error('You can compare up to 4 products');
      }
    }
  };

  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="card overflow-hidden h-full flex flex-col">
        {/* Image */}
        <div className="relative overflow-hidden bg-gray-100">
          <img
            src={product.image || 'https://picsum.photos/seed/placeholder/400/400'}
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white text-gray-900 text-xs font-bold px-2 py-1 rounded-full">
                Out of Stock
              </span>
            </div>
          )}
          <button
            onClick={handleCompare}
            title={inCompare ? 'Remove from comparison' : 'Add to comparison'}
            className={`absolute top-2 right-2 p-1.5 rounded-full shadow-md transition-all duration-200 ${
              inCompare
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-500 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          {product.category && (
            <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
              {product.category}
            </span>
          )}
          <h3 className="mt-1 font-semibold text-gray-900 text-sm leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
          {product.brand && (
            <p className="text-xs text-gray-500 mt-0.5">{product.brand}</p>
          )}
          <div className="mt-2">
            <StarRating rating={product.rating} />
          </div>

          <div className="mt-auto pt-3 flex items-center justify-between gap-2">
            <span className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
            <button
              onClick={handleAddToCart}
              disabled={adding || product.stock === 0}
              className="btn-primary text-xs px-3 py-1.5 flex-shrink-0 flex items-center gap-1"
            >
              {adding ? (
                <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              )}
              {product.stock === 0 ? 'Sold Out' : 'Add'}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
