'use client';

import { ProductCard } from './ProductCard';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_at_price?: number;
  images: string[];
  stock_quantity: number;
}

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="text-center py-24">
        <div className="inline-block p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl mb-4">
          <ShoppingCart className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto" />
        </div>
        <p className="text-xl text-gray-500 dark:text-gray-400">No products found. Check back soon!</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
    >
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <ProductCard product={product} />
        </motion.div>
      ))}
    </motion.div>
  );
}

