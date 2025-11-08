'use client';

import { useState } from 'react';
import { ordersApi } from '@/lib/api';
import { Search, Package, Truck, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
  pending: { label: 'Pending', icon: Clock, color: 'text-yellow-600' },
  confirmed: { label: 'Confirmed', icon: CheckCircle, color: 'text-blue-600' },
  processing: { label: 'Processing', icon: Package, color: 'text-indigo-600' },
  shipped: { label: 'Shipped', icon: Truck, color: 'text-purple-600' },
  delivered: { label: 'Delivered', icon: CheckCircle, color: 'text-green-600' },
  cancelled: { label: 'Cancelled', icon: Clock, color: 'text-red-600' },
};

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber || (!email && !phone)) {
      toast.error('Please enter order number and email or phone');
      return;
    }

    setLoading(true);
    try {
      const response = await ordersApi.track(orderNumber, email || undefined, phone || undefined);
      setOrder(response.data);
    } catch (error: any) {
      console.error('Error tracking order:', error);
      toast.error(error.response?.data?.error || 'Order not found');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Track Your Order
        </h1>

        <form onSubmit={handleTrack} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md mb-8">
          <div className="space-y-4">
            <div>
              <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Order Number *
              </label>
              <input
                type="text"
                id="orderNumber"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="BC-1234567890-ABC"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 1234567890"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              {loading ? 'Tracking...' : 'Track Order'}
            </button>
          </div>
        </form>

        {order && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Order Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Order Number</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {order.order.order_number}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Order Status</p>
                  {(() => {
                    const status = statusConfig[order.order.order_status] || statusConfig.pending;
                    const StatusIcon = status.icon;
                    return (
                      <p className={`text-lg font-semibold flex items-center gap-2 ${status.color}`}>
                        <StatusIcon className="w-5 h-5" />
                        {status.label}
                      </p>
                    );
                  })()}
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Payment Status</p>
                  <p className={`text-lg font-semibold ${
                    order.order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {order.order.payment_status.charAt(0).toUpperCase() + order.order.payment_status.slice(1)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    ₹{order.order.total_amount.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Shipping Address
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {order.order.customer_name}<br />
                {order.order.shipping_address}<br />
                {order.order.city}, {order.order.state} {order.order.pincode}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Order Items
              </h3>
              <div className="space-y-2">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{item.product_name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Quantity: {item.quantity} × ₹{item.price.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      ₹{item.subtotal.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

