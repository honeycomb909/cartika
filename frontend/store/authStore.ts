import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'seller' | 'admin';
}

interface AuthStore {
  user: User | null;
  token: string | null;
  initialized: boolean;
  init: () => void;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

const loadAuthFromStorage = (): { user: User | null; token: string | null } => {
  if (typeof window === 'undefined') return { user: null, token: null };
  try {
    const stored = localStorage.getItem('breezycart-auth');
    if (!stored) return { user: null, token: null };
    const parsed = JSON.parse(stored);
    return {
      user: parsed.user,
      token: localStorage.getItem('token') || parsed.token || null,
    };
  } catch {
    return { user: null, token: null };
  }
};

const saveAuthToStorage = (user: User | null, token: string | null) => {
  if (typeof window === 'undefined') return;
  try {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    localStorage.setItem('breezycart-auth', JSON.stringify({ user, token }));
  } catch {
    // Ignore storage errors
  }
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  initialized: false,
  init: () => {
    if (get().initialized) return;
    const { user, token } = loadAuthFromStorage();
    set({ user, token, initialized: true });
  },
  setAuth: (user, token) => {
    set({ user, token });
    saveAuthToStorage(user, token);
  },
  clearAuth: () => {
    set({ user: null, token: null });
    saveAuthToStorage(null, null);
  },
  isAuthenticated: () => {
    return get().user !== null && get().token !== null;
  },
}));

