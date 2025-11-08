'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Package, Users, ShoppingCart, DollarSign, CheckCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [pendingProducts, setPendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated() || user?.role !== 'admin') {
      router.push('/admin/login');
      return;
    }
    loadDashboard();
  }, [user]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [dashboardResponse, productsResponse] = await Promise.all([
        adminApi.getDashboard(),
        adminApi.getProducts({ status: 'pending', limit: 5 }),
      ]);
      setStats(dashboardResponse.data);
      setPendingProducts(productsResponse.data.products || []);
    } catch (error: any) {
      console.error('Error loading dashboard:', error);
      if (error.response?.status === 401) {
        router.push('/admin/login');
      } else {
        toast.error('Failed to load dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await adminApi.approveProduct(id);
      toast.success('Product approved');
      loadDashboard();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to approve product');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await adminApi.rejectProduct(id);
      toast.success('Product rejected');
      loadDashboard();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to reject product');
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Admin Dashboard
        </h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Products</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.products.total}
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  {stats.products.pending} pending
                </p>
              </div>
              <Package className="w-8 h-8 text-primary-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Sellers</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.sellers.total}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {stats.sellers.active} active
                </p>
              </div>
              <Users className="w-8 h-8 text-primary-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ₹{stats.orders.totalRevenue.toFixed(2)}
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
                  {stats.orders.total}
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  {stats.orders.pending} pending
                </p>
              </div>
              <ShoppingCart className="w-8 h-8 text-primary-500" />
            </div>
          </div>
        </div>

        {/* Pending Products */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Pending Product Approvals
          </h2>
          {pendingProducts.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No pending products</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Product</th>
                    <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Seller</th>
                    <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Price</th>
                    <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingProducts.map((product: any) => (
                    <tr key={product.id} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {product.seller_email}
                      </td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white">
                        ₹{product.price.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(product.id)}
                            className="p-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReject(product.id)}
                            className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

