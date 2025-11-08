'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { sellerApi, productsApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Package, DollarSign, ShoppingCart, Eye, Plus } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function SellerDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated() || user?.role !== 'seller') {
      router.push('/seller/login');
      return;
    }
    loadDashboard();
  }, [user]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [dashboardResponse, productsResponse] = await Promise.all([
        sellerApi.getDashboard(),
        sellerApi.getProducts({ page: 1, limit: 5 }),
      ]);
      setStats(dashboardResponse.data);
      setProducts(productsResponse.data.products || []);
    } catch (error: any) {
      console.error('Error loading dashboard:', error);
      if (error.response?.status === 401) {
        router.push('/seller/login');
      } else {
        toast.error('Failed to load dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Seller Dashboard
          </h1>
          <Link
            href="/seller/products/new"
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Products</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.productStats.total}
                </p>
              </div>
              <Package className="w-8 h-8 text-primary-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.productStats.approved}
                </p>
              </div>
              <Package className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ₹{stats.orderStats.totalRevenue.toFixed(2)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-primary-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.orderStats.totalOrders}
                </p>
              </div>
              <ShoppingCart className="w-8 h-8 text-primary-500" />
            </div>
          </div>
        </div>

        {/* Recent Products */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Recent Products
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Product</th>
                  <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Status</th>
                  <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Price</th>
                  <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Stock</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product: any) => (
                  <tr key={product.id} className="border-b border-gray-200 dark:border-gray-700">
                    <td className="py-3 px-4">
                      <Link
                        href={`/seller/products/${product.id}`}
                        className="text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        {product.name}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        product.is_approved
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {product.is_approved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white">
                      ₹{product.price.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white">
                      {product.stock_quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-right">
            <Link
              href="/seller/products"
              className="text-primary-600 dark:text-primary-400 hover:underline"
            >
              View all products →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

