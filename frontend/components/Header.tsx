'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getCart } from '@/services/api';
import { getSessionId, getCompareIds } from '@/utils/session';

export default function Header() {
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);
  const [compareCount, setCompareCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const fetchCartCount = () => {
    const sessionId = getSessionId();
    if (!sessionId) return;
    getCart(sessionId)
      .then((cart) => {
        const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(count);
      })
      .catch(() => setCartCount(0));
  };

  useEffect(() => {
    fetchCartCount();
    setCompareCount(getCompareIds().length);

    const handleCartUpdate = () => fetchCartCount();
    const handleCompareUpdate = () => setCompareCount(getCompareIds().length);

    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('compareUpdated', handleCompareUpdate);
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('compareUpdated', handleCompareUpdate);
    };
  }, []);

  const navLinks = [
    { href: '/', label: 'Catalog' },
    {
      href: '/cart',
      label: 'Cart',
      badge: cartCount > 0 ? cartCount : undefined,
    },
    {
      href: '/compare',
      label: 'Compare',
      badge: compareCount > 0 ? compareCount : undefined,
    },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🛍️</span>
            <span className="font-bold text-xl text-gray-900 hidden sm:block">ShopCatalog</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, badge }) => (
              <Link
                key={href}
                href={href}
                className={`relative flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  pathname === href
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {label}
                {badge !== undefined && (
                  <span className="bg-blue-600 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <nav className="md:hidden pb-3 border-t border-gray-100 pt-3 flex flex-col gap-1">
            {navLinks.map(({ href, label, badge }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                  pathname === href
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{label}</span>
                {badge !== undefined && (
                  <span className="bg-blue-600 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
