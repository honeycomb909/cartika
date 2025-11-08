'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_at_price?: number;
  images: string[];
  stock_quantity: number;
}

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.stock_quantity <= 0) {
      toast.error('Product out of stock');
      return;
    }
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.images[0] || '/placeholder.jpg',
      stock_quantity: product.stock_quantity,
    });
    toast.success('Added to cart!');
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
  const imageUrl = product.images && product.images.length > 0 
    ? (product.images[0].startsWith('http')
        ? product.images[0]
        : `${API_URL}${product.images[0]}`)
    : '/placeholder.jpg';

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
    >
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-square bg-gray-50 dark:bg-gray-700 overflow-hidden">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover transform group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
          {product.compare_at_price && product.compare_at_price > product.price && (
            <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm bg-opacity-90">
              Sale
            </span>
          )}
          {product.stock_quantity <= 0 && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center transition-opacity">
              <span className="text-white font-bold bg-black/40 px-4 py-2 rounded-lg">Out of Stock</span>
            </div>
          )}
        </div>
      </Link>
      <div className="p-5">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-3 line-clamp-2 group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                ₹{product.price.toFixed(2)}
              </span>
              {product.compare_at_price && product.compare_at_price > product.price && (
                <span className="text-sm text-gray-500 line-through">
                  ₹{product.compare_at_price.toFixed(2)}
                </span>
              )}
            </div>
            {product.stock_quantity > 0 && (
              <span className="text-xs text-primary-600 dark:text-primary-400">
                {product.stock_quantity} in stock
              </span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={product.stock_quantity <= 0}
            className="p-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-xl"
            aria-label="Add to cart"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

