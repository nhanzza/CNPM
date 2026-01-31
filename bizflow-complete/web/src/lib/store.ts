import { create } from 'zustand';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'owner' | 'employee';
  businessId?: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isLoading: false,

  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setLoading: (isLoading) => set({ isLoading }),

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    set({ user: null, token: null });
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('access_token');
    return !!token;
  },
}));

interface OrderStore {
  orders: any[];
  selectedOrder: any | null;
  setOrders: (orders: any[]) => void;
  setSelectedOrder: (order: any | null) => void;
  addOrder: (order: any) => void;
}

export const useOrderStore = create<OrderStore>((set) => ({
  orders: [],
  selectedOrder: null,

  setOrders: (orders) => set({ orders }),
  setSelectedOrder: (selectedOrder) => set({ selectedOrder }),
  addOrder: (order) => set((state) => ({ orders: [...state.orders, order] })),
}));

interface ProductStore {
  products: any[];
  selectedProduct: any | null;
  setProducts: (products: any[]) => void;
  setSelectedProduct: (product: any | null) => void;
}

export const useProductStore = create<ProductStore>((set) => ({
  products: [],
  selectedProduct: null,

  setProducts: (products) => set({ products }),
  setSelectedProduct: (selectedProduct) => set({ selectedProduct }),
}));
