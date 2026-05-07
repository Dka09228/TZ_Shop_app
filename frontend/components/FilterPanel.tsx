'use client';

import { useState, useEffect } from 'react';
import { getCategories } from '@/services/api';

interface FilterPanelProps {
  category: string;
  minPrice: string;
  maxPrice: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onUpdate: (updates: Record<string, string | undefined>) => void;
}

export default function FilterPanel({
  category,
  minPrice,
  maxPrice,
  sortBy,
  sortOrder,
  onUpdate,
}: FilterPanelProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [localMin, setLocalMin] = useState(minPrice);
  const [localMax, setLocalMax] = useState(maxPrice);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => { setLocalMin(minPrice); }, [minPrice]);
  useEffect(() => { setLocalMax(maxPrice); }, [maxPrice]);

  const handlePriceApply = () => {
    onUpdate({
      min_price: localMin || undefined,
      max_price: localMax || undefined,
    });
  };

  const handleClear = () => {
    setLocalMin('');
    setLocalMax('');
    onUpdate({
      category: undefined,
      min_price: undefined,
      max_price: undefined,
      sort_by: undefined,
      sort_order: undefined,
    });
  };

  const hasFilters = category || minPrice || maxPrice || sortBy;

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 space-y-5 sticky top-20">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Filters</h2>
        {hasFilters && (
          <button
            onClick={handleClear}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
        <select
          value={category}
          onChange={(e) => onUpdate({ category: e.target.value || undefined })}
          className="input-field text-sm"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Price range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={localMin}
            onChange={(e) => setLocalMin(e.target.value)}
            min={0}
            className="input-field text-sm w-full"
          />
          <span className="text-gray-400 flex-shrink-0">—</span>
          <input
            type="number"
            placeholder="Max"
            value={localMax}
            onChange={(e) => setLocalMax(e.target.value)}
            min={0}
            className="input-field text-sm w-full"
          />
        </div>
        <button
          onClick={handlePriceApply}
          className="mt-2 w-full btn-secondary text-sm py-1.5"
        >
          Apply
        </button>
      </div>

      {/* Sort */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
        <select
          value={sortBy}
          onChange={(e) => onUpdate({ sort_by: e.target.value || undefined })}
          className="input-field text-sm mb-2"
        >
          <option value="">Default</option>
          <option value="price">Price</option>
          <option value="name">Name</option>
          <option value="rating">Rating</option>
        </select>

        {sortBy && (
          <div className="flex gap-2">
            <button
              onClick={() => onUpdate({ sort_order: 'asc' })}
              className={`flex-1 text-sm py-1.5 rounded-lg border font-medium transition-colors ${
                sortOrder === 'asc'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              ↑ Asc
            </button>
            <button
              onClick={() => onUpdate({ sort_order: 'desc' })}
              className={`flex-1 text-sm py-1.5 rounded-lg border font-medium transition-colors ${
                sortOrder === 'desc'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              ↓ Desc
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
