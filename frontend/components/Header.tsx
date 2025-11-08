'use client';

import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from './ThemeProvider';
import { ShoppingCart, Moon, Sun, Menu, X, User, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export function Header() {
  const { items, getItemCount } = useCartStore();
  const { user, clearAuth, isAuthenticated } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    clearAuth();
    toast.success('Logged out successfully');
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
              Cartika
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
              Home
            </Link>
            <Link href="/products" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
              Products
            </Link>
            {isAuthenticated() && user?.role === 'seller' && (
              <Link href="/seller/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
                Dashboard
              </Link>
            )}
            {isAuthenticated() && user?.role === 'admin' && (
              <Link href="/admin/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
                Admin
              </Link>
            )}
            {!isAuthenticated() && (
              <Link href="/admin/login" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 text-sm">
                Admin
              </Link>
            )}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>

            {/* Cart */}
            <Link href="/cart" className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <ShoppingCart className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              {getItemCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {getItemCount()}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated() ? (
              <div className="hidden md:flex items-center space-x-2">
                <span className="text-sm text-gray-700 dark:text-gray-300">{user?.name}</span>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Logout"
                >
                  <LogOut className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link
                  href="/seller/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  Seller Login
                </Link>
                <Link
                  href="/seller/register"
                  className="px-4 py-2 text-sm font-medium bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Sell on Cartika
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex flex-col space-y-4">
              <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-primary-600">
                Home
              </Link>
              <Link href="/products" className="text-gray-700 dark:text-gray-300 hover:text-primary-600">
                Products
              </Link>
              {isAuthenticated() && user?.role === 'seller' && (
                <Link href="/seller/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-primary-600">
                  Dashboard
                </Link>
              )}
              {isAuthenticated() && user?.role === 'admin' && (
                <Link href="/admin/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-primary-600">
                  Admin
                </Link>
              )}
              {!isAuthenticated() && (
                <>
                  <Link href="/seller/login" className="text-gray-700 dark:text-gray-300 hover:text-primary-600">
                    Seller Login
                  </Link>
                  <Link href="/seller/register" className="text-gray-700 dark:text-gray-300 hover:text-primary-600">
                    Sell on Cartika
                  </Link>
                </>
              )}
              {isAuthenticated() && (
                <button onClick={handleLogout} className="text-left text-gray-700 dark:text-gray-300 hover:text-primary-600">
                  Logout
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

