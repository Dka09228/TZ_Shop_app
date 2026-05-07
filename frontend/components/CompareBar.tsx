'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCompareIds, clearCompare } from '@/utils/session';

export default function CompareBar() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(getCompareIds().length);
    const handler = () => setCount(getCompareIds().length);
    window.addEventListener('compareUpdated', handler);
    return () => window.removeEventListener('compareUpdated', handler);
  }, []);

  if (count === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
      <div className="bg-gray-900 text-white rounded-2xl shadow-2xl px-5 py-3 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className="text-sm font-medium">
            {count} product{count !== 1 ? 's' : ''} selected
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/compare"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
          >
            Compare
          </Link>
          <button
            onClick={() => clearCompare()}
            className="text-gray-400 hover:text-white transition-colors text-sm px-2 py-1.5"
            title="Clear comparison"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
