'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ShoppingBag } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

export function Hero({ categories }: { categories: Category[] }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-pastel-turquoise via-pastel-beige to-pastel-lavender dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 py-32">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pastel-lavender/30 dark:bg-primary-700/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-block mb-4 px-6 py-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-md"
          >
            <span className="text-primary-600 dark:text-primary-400 font-medium">
              Welcome to the Future of Shopping
            </span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight"
          >
            Shopping that feels{' '}
            <span className="bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
              light
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Fast, fun, and effortless shopping experience. No login required, just browse and buy.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 justify-center"
          >
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-8 py-4 bg-primary-500 text-white rounded-2xl hover:bg-primary-600 transition-all duration-300 font-medium shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95"
            >
              Start Shopping
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              href="/seller/register"
              className="inline-flex items-center justify-center px-8 py-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-900 dark:text-white rounded-2xl hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 font-medium border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95"
            >
              <ShoppingBag className="mr-2 w-5 h-5" />
              Sell on Cartika
            </Link>
          </motion.div>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-16"
          >
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-6 text-center">
              Shop by Category
            </h3>
            <div className="flex flex-wrap justify-center gap-4">
              {categories.slice(0, 6).map((category) => (
                <Link
                  key={category.id}
                  href={`/products?category=${category.slug}`}
                  className="px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl hover:bg-white dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300 font-medium shadow-md hover:shadow-lg"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}

