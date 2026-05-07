'use client';

import { useEffect, useState } from 'react';
import { getProduct } from '@/services/api';
import { Product } from '@/types';
import { getCompareIds, removeFromCompare, clearCompare } from '@/utils/session';
import { formatPrice } from '@/utils/helpers';
import Link from 'next/link';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${star <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-sm text-gray-600 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

const ROWS: { label: string; key: keyof Product; format?: (v: unknown) => string }[] = [
  { label: 'Category', key: 'category' },
  { label: 'Brand', key: 'brand' },
  { label: 'Price', key: 'price', format: (v) => formatPrice(v as string) },
  { label: 'Stock', key: 'stock', format: (v) => `${v} units` },
];

export default function ComparePage() {
  const [products, setProducts] = useState<(Product | null)[]>([]);
  const [loading, setLoading] = useState(true);
  const [ids, setIds] = useState<number[]>([]);

  useEffect(() => {
    const compareIds = getCompareIds();
    setIds(compareIds);

    if (compareIds.length === 0) {
      setLoading(false);
      return;
    }

    Promise.all(compareIds.map((id) => getProduct(id).catch(() => null)))
      .then(setProducts)
      .finally(() => setLoading(false));

    const handleUpdate = () => {
      const newIds = getCompareIds();
      setIds(newIds);
    };
    window.addEventListener('compareUpdated', handleUpdate);
    return () => window.removeEventListener('compareUpdated', handleUpdate);
  }, []);

  const handleRemove = (productId: number) => {
    removeFromCompare(productId);
    setProducts((prev) => prev.filter((p) => p?.id !== productId));
  };

  const handleClear = () => {
    clearCompare();
    setProducts([]);
    setIds([]);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  const validProducts = products.filter((p): p is Product => p !== null);

  if (ids.length === 0 || validProducts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8">Compare Products</h1>
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <p className="text-6xl mb-4">⚖️</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No products to compare</h2>
          <p className="text-gray-500 mb-6">
            Add products to compare by clicking the Compare button on any product card
          </p>
          <Link href="/" className="btn-primary inline-block">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Compare Products</h1>
        <div className="flex gap-3">
          <Link href="/" className="btn-secondary text-sm">
            Add More
          </Link>
          <button onClick={handleClear} className="btn-secondary text-sm text-red-600 border-red-200 hover:bg-red-50">
            Clear All
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Product headers */}
        <div className="grid border-b" style={{ gridTemplateColumns: `200px repeat(${validProducts.length}, 1fr)` }}>
          <div className="p-4 bg-gray-50 font-semibold text-gray-700">Product</div>
          {validProducts.map((product) => (
            <div key={product.id} className="p-4 border-l relative">
              <button
                onClick={() => handleRemove(product.id)}
                className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
                title="Remove from comparison"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <Link href={`/products/${product.id}`}>
                <img
                  src={product.image || 'https://picsum.photos/seed/placeholder/200/200'}
                  alt={product.name}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
                <h3 className="font-semibold text-gray-900 text-sm hover:text-blue-600 transition-colors line-clamp-2">
                  {product.name}
                </h3>
              </Link>
            </div>
          ))}
        </div>

        {/* Rating row */}
        <div className="grid border-b" style={{ gridTemplateColumns: `200px repeat(${validProducts.length}, 1fr)` }}>
          <div className="p-4 bg-gray-50 font-medium text-gray-600 text-sm flex items-center">Rating</div>
          {validProducts.map((product) => (
            <div key={product.id} className="p-4 border-l flex items-center">
              <StarRating rating={product.rating} />
            </div>
          ))}
        </div>

        {/* Other rows */}
        {ROWS.map(({ label, key, format }, idx) => (
          <div
            key={key}
            className={`grid border-b last:border-b-0 ${idx % 2 === 0 ? '' : 'bg-gray-50/50'}`}
            style={{ gridTemplateColumns: `200px repeat(${validProducts.length}, 1fr)` }}
          >
            <div className="p-4 bg-gray-50 font-medium text-gray-600 text-sm flex items-center">{label}</div>
            {validProducts.map((product) => {
              const value = product[key];
              return (
                <div key={product.id} className="p-4 border-l text-gray-900 text-sm flex items-center">
                  {value !== null && value !== undefined
                    ? format
                      ? format(value)
                      : String(value)
                    : <span className="text-gray-400">—</span>}
                </div>
              );
            })}
          </div>
        ))}

        {/* Add to cart row */}
        <div className="grid" style={{ gridTemplateColumns: `200px repeat(${validProducts.length}, 1fr)` }}>
          <div className="p-4 bg-gray-50" />
          {validProducts.map((product) => (
            <div key={product.id} className="p-4 border-l">
              <Link
                href={`/products/${product.id}`}
                className="btn-primary block text-center text-sm w-full"
              >
                View Product
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
