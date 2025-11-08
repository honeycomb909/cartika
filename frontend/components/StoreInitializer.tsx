'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';

export function StoreInitializer() {
  const initCart = useCartStore((state) => state.init);
  const initAuth = useAuthStore((state) => state.init);

  useEffect(() => {
    initCart();
    initAuth();
  }, [initCart, initAuth]);

  return null;
}

