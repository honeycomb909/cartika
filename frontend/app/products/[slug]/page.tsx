'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { productsApi } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import { ShoppingCart, Plus, Minus, Package, Truck, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    loadProduct();
  }, [slug]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const response = await productsApi.getBySlug(slug);
      setProduct(response.data);
    } catch (error: any) {
      console.error('Error loading product:', error);
      toast.error(error.response?.data?.error || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (product.stock_quantity <= 0) {
      toast.error('Product out of stock');
      return;
    }
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image: product.images[0] || '/placeholder.jpg',
        stock_quantity: product.stock_quantity,
      });
    }
    toast.success(`Added ${quantity} item(s) to cart!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">Product not found</p>
        </div>
      </div>
    );
  }

  const maxQuantity = Math.min(product.stock_quantity, 10);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
  const imageUrl = product.images && product.images[selectedImage]
    ? `${API_URL}${product.images[selectedImage]}`
    : '/placeholder.jpg';

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden mb-4">
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto">
                {product.images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 ${
                      selectedImage === idx
                        ? 'border-primary-500'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <Image
                      src={`${API_URL}${img}`}
                      alt={`${product.name} ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {product.name}
            </h1>

            {product.category && (
              <p className="text-primary-600 dark:text-primary-400 mb-4">
                {product.category.name}
              </p>
            )}

            <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                ₹{product.price.toFixed(2)}
              </span>
              {product.compare_at_price && product.compare_at_price > product.price && (
                <>
                  <span className="text-xl text-gray-500 line-through">
                    ₹{product.compare_at_price.toFixed(2)}
                  </span>
                  <span className="bg-red-500 text-white text-sm font-bold px-2 py-1 rounded">
                    {Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}% OFF
                  </span>
                </>
              )}
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-6 whitespace-pre-line">
              {product.description || 'No description available.'}
            </p>

            {/* Stock Status */}
            <div className="mb-6">
              {product.stock_quantity > 0 ? (
                <p className="text-green-600 dark:text-green-400 font-medium">
                  ✓ In Stock ({product.stock_quantity} available)
                </p>
              ) : (
                <p className="text-red-600 dark:text-red-400 font-medium">
                  ✗ Out of Stock
                </p>
              )}
            </div>

            {/* Quantity Selector */}
            {product.stock_quantity > 0 && (
              <div className="flex items-center gap-4 mb-6">
                <span className="text-gray-700 dark:text-gray-300">Quantity:</span>
                <div className="flex items-center gap-2 border border-gray-300 dark:border-gray-700 rounded-lg">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="p-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 text-gray-900 dark:text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(maxQuantity, q + 1))}
                    disabled={quantity >= maxQuantity}
                    className="p-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Add to Cart Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              disabled={product.stock_quantity <= 0}
              className="w-full py-4 bg-primary-500 text-white rounded-xl hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium text-lg flex items-center justify-center gap-2 mb-6"
            >
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </motion.button>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Free Shipping</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Fast Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Secure Payment</span>
              </div>
            </div>

            {/* Seller Info */}
            {product.seller && (
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Sold by</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {product.seller.business_name || product.seller.name}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

