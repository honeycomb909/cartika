import { create } from 'zustand';

interface CartItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  quantity: number;
  stock_quantity: number;
}

interface CartStore {
  items: CartItem[];
  initialized: boolean;
  init: () => void;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

const loadCartFromStorage = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('breezycart-cart');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveCartToStorage = (items: CartItem[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('breezycart-cart', JSON.stringify(items));
  } catch {
    // Ignore storage errors
  }
};

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  initialized: false,
  init: () => {
    if (get().initialized) return;
    const items = loadCartFromStorage();
    set({ items, initialized: true });
  },
  addItem: (item) => {
    const items = get().items;
    const existingItem = items.find((i) => i.id === item.id);
    
    let newItems: CartItem[];
    if (existingItem) {
      newItems = items.map((i) =>
        i.id === item.id
          ? { ...i, quantity: i.quantity + 1 }
          : i
      );
    } else {
      newItems = [...items, { ...item, quantity: 1 }];
    }
    set({ items: newItems });
    saveCartToStorage(newItems);
  },
  removeItem: (id) => {
    const newItems = get().items.filter((i) => i.id !== id);
    set({ items: newItems });
    saveCartToStorage(newItems);
  },
  updateQuantity: (id, quantity) => {
    if (quantity <= 0) {
      get().removeItem(id);
      return;
    }
    const newItems = get().items.map((i) =>
      i.id === id ? { ...i, quantity } : i
    );
    set({ items: newItems });
    saveCartToStorage(newItems);
  },
  clearCart: () => {
    set({ items: [] });
    saveCartToStorage([]);
  },
  getTotal: () => {
    return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
  },
  getItemCount: () => {
    return get().items.reduce((count, item) => count + item.quantity, 0);
  },
}));

