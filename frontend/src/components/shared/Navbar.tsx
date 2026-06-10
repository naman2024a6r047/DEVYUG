'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Menu, X, ShoppingBag, Heart, User as UserIcon, Search, Sparkles } from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { cartCount, wishlist } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Scroll effect to change background opacity
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'About Us', path: '/about' },
    { name: 'Blog', path: '/blog' },
    { name: 'Contact', path: '/contact' },
    { name: 'FAQ', path: '/faq' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#FAF8F2]/90 backdrop-blur-md shadow-md border-b border-[#F5EFE2]'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Brand Area */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="group flex flex-col items-start select-none">
              <span className="text-3xl font-serif font-bold tracking-wider text-[#2D5A27] transition-colors duration-300 group-hover:text-[#C9A227] flex items-center gap-1">
                DVYUG
                <Sparkles className="w-5 h-5 text-[#C9A227] animate-pulse" />
              </span>
              <span className="text-[9px] font-sans font-medium uppercase tracking-[0.25em] text-[#2B2B2B] -mt-1 opacity-80">
                Divine Essentials
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`text-sm font-medium tracking-wide transition-all duration-200 border-b-2 py-1 ${
                    isActive
                      ? 'border-[#2D5A27] text-[#2D5A27]'
                      : 'border-transparent text-[#2B2B2B]/80 hover:text-[#2D5A27] hover:border-[#2D5A27]/30'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            
            {user && user.role === 'ADMIN' && (
              <Link
                href="/admin"
                className={`text-sm font-semibold tracking-wide text-[#C9A227] transition-all duration-200 border-b-2 py-1 border-transparent hover:border-[#C9A227]/40`}
              >
                Admin Panel
              </Link>
            )}
          </nav>

          {/* Right Side Icons */}
          <div className="hidden md:flex items-center space-x-6">
            
            {/* Search Bar Toggle */}
            <div className="relative flex items-center">
              {searchOpen && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (searchQuery.trim()) {
                      window.location.href = `/shop?search=${encodeURIComponent(searchQuery)}`;
                    }
                  }}
                  className="absolute right-8 animate-fade-in"
                >
                  <input
                    type="text"
                    placeholder="Search Vedic items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-48 px-3 py-1.5 text-xs rounded-full bg-[#F5EFE2] text-[#2B2B2B] focus:outline-none focus:ring-1 focus:ring-[#2D5A27] border border-[#d8d2c4]"
                  />
                </form>
              )}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="text-[#2B2B2B] hover:text-[#2D5A27] transition-colors p-1"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>

            {/* Wishlist */}
            <Link href="/dashboard?tab=wishlist" className="relative p-1 text-[#2B2B2B] hover:text-[#2D5A27] transition-colors">
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#C9A227] text-[9px] font-bold text-white">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart Icon */}
            <Link href="/cart" className="relative p-1 text-[#2B2B2B] hover:text-[#2D5A27] transition-colors">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#2D5A27] text-[9px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Profile Dropdown or Login */}
            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-1.5 text-[#2B2B2B] hover:text-[#2D5A27] transition-colors font-medium text-sm py-1.5 focus:outline-none">
                  <UserIcon className="w-4 h-4" />
                  <span className="max-w-[80px] truncate">{user.name.split(' ')[0]}</span>
                </button>
                <div className="absolute right-0 w-48 mt-1 origin-top-right rounded-md bg-[#FAF8F2] border border-[#F5EFE2] shadow-lg ring-1 ring-black/5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out p-1">
                  <Link
                    href="/dashboard"
                    className="block px-4 py-2 text-xs text-[#2B2B2B] hover:bg-[#F5EFE2] hover:text-[#2D5A27] rounded"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/dashboard?tab=orders"
                    className="block px-4 py-2 text-xs text-[#2B2B2B] hover:bg-[#F5EFE2] hover:text-[#2D5A27] rounded"
                  >
                    My Orders
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full text-left block px-4 py-2 text-xs text-red-600 hover:bg-[#F5EFE2] rounded"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1 px-4 py-2 text-xs font-semibold tracking-wide text-white bg-[#2D5A27] hover:bg-[#2D5A27]/90 rounded-full transition-colors shadow-sm"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center space-x-4">
            {/* Cart Icon Mobile */}
            <Link href="/cart" className="relative p-1 text-[#2B2B2B] hover:text-[#2D5A27]">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#2D5A27] text-[9px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-[#2B2B2B] hover:text-[#2D5A27] focus:outline-none p-1"
              aria-label="Menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Navigation Panel */}
      {isOpen && (
        <div className="md:hidden bg-[#FAF8F2] border-t border-[#F5EFE2] animate-slide-up py-4 px-6 space-y-4 shadow-inner">
          <div className="space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                onClick={() => setIsOpen(false)}
                className="block py-2 text-sm font-medium text-[#2B2B2B] hover:text-[#2D5A27]"
              >
                {link.name}
              </Link>
            ))}
            {user && user.role === 'ADMIN' && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="block py-2 text-sm font-semibold text-[#C9A227]"
              >
                Admin Panel
              </Link>
            )}
          </div>
          <div className="pt-4 border-t border-[#F5EFE2] flex items-center justify-between">
            {user ? (
              <div className="flex items-center justify-between w-full">
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-1.5 text-sm font-medium text-[#2B2B2B] hover:text-[#2D5A27]"
                >
                  <UserIcon className="w-4 h-4" />
                  {user.name}
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="text-xs font-semibold text-red-600"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="w-full text-center block py-2.5 px-4 text-xs font-semibold text-white bg-[#2D5A27] rounded-full"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
