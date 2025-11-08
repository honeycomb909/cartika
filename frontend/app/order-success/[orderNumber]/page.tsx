'use client';

export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, Home } from 'lucide-react';
import { motion } from 'framer-motion';

export default function OrderSuccessPage() {
  const params = useParams();
  const orderNumber = params.orderNumber as string;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-block mb-6"
          >
            <CheckCircle className="w-24 h-24 text-green-500" />
          </motion.div>

          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Order Placed Successfully!
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
            Your order number is
          </p>
          <p className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-8">
            {orderNumber}
          </p>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md mb-8 text-left">
            <div className="flex items-center gap-3 mb-4">
              <Package className="w-6 h-6 text-primary-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                What's Next?
              </h2>
            </div>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li>✓ You will receive an order confirmation email shortly</li>
              <li>✓ Your order is being processed and will be shipped soon</li>
              <li>✓ You can track your order using the order number</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/track-order?orderNumber=${orderNumber}`}
              className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
            >
              Track Order
            </Link>
            <Link
              href="/"
              className="px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Continue Shopping
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

