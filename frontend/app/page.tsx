'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getProducts } from '@/services/api';
import { ProductListResponse } from '@/types';
import ProductList from '@/components/ProductList';
import FilterPanel from '@/components/FilterPanel';
import SearchBar from '@/components/SearchBar';
import Pagination from '@/components/Pagination';
import CompareBar from '@/components/CompareBar';

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const LIMIT = 12;

function CatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlSearch = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';
  const sortBy = searchParams.get('sort_by') || '';
  const sortOrder = (searchParams.get('sort_order') || 'asc') as 'asc' | 'desc';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [searchInput, setSearchInput] = useState(urlSearch);
  const debouncedSearch = useDebounce(searchInput, 400);

  const [data, setData] = useState<ProductListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sync debounced search → URL
  useEffect(() => {
    if (debouncedSearch === urlSearch) return;
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearch) {
      params.set('search', debouncedSearch);
    } else {
      params.delete('search');
    }
    params.delete('page');
    router.push(`?${params.toString()}`, { scroll: false });
  }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch products when URL params change
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const offset = (page - 1) * LIMIT;
      const result = await getProducts({
        search: urlSearch || undefined,
        category: category || undefined,
        min_price: minPrice ? parseFloat(minPrice) : undefined,
        max_price: maxPrice ? parseFloat(maxPrice) : undefined,
        sort_by: sortBy || undefined,
        sort_order: sortOrder,
        limit: LIMIT,
        offset,
      });
      setData(result);
    } catch {
      setError('Failed to load products. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [urlSearch, category, minPrice, maxPrice, sortBy, sortOrder, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      params.delete('page');
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [searchParams, router]
  );

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    router.push(`?${params.toString()}`, { scroll: true });
  };

  const totalPages = data ? Math.ceil(data.count / LIMIT) : 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Catalog</h1>
        <p className="text-gray-500">
          {data ? `${data.count} products found` : 'Discover our collection'}
        </p>
      </div>

      <div className="mb-6">
        <SearchBar
          value={searchInput}
          onChange={setSearchInput}
          onSelect={(id) => router.push(`/products/${id}`)}
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="w-full lg:w-64 flex-shrink-0">
          <FilterPanel
            category={category}
            minPrice={minPrice}
            maxPrice={maxPrice}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onUpdate={updateParams}
          />
        </aside>

        <div className="flex-1 min-w-0">
          <ProductList
            products={data?.results ?? []}
            loading={loading}
            error={error}
          />

          {!loading && !error && data && totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>

      <CompareBar />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      }
    >
      <CatalogContent />
    </Suspense>
  );
}
