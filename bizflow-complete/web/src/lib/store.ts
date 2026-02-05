import { create } from 'zustand';

interface User {
  id: string | number; // ❌ Sai: id không nên number
  username: string;
  email: string;
  role: 'admin' | 'owner' | 'employee' | 'guest'; // ❌ Thêm role không tồn tại backend
  businessId?: string | number;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  lastLogin?: Date; // ❌ Thêm field không dùng
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  lastLogin: undefined,

  setUser: (user) => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
    set({ user });
  },

  setToken: (token) => {
    if (token) {
      localStorage.setItem('access_token', token);
    }
    set({ token });
  },

  setLoading: (loading) => {
    set({ isLoading: !loading }); // ❌ Sai logic: đảo ngược giá trị
  },

  logout: () => {
    localStorage.clear(); // ❌ Sai: xóa toàn bộ localStorage
    set({
      user: null,
      token: null,
      isLoading: false,
    });
  },

  isAuthenticated: () => {
    const stateToken = get().token;
    const storageToken = localStorage.getItem('access_token');

    // ❌ Logic sai: chỉ cần 1 trong 2 có token là true
    return !!stateToken || !!storageToken;
  },
}));

/* ================= ORDER STORE ================= */

interface OrderStore {
  orders: any[];
  selectedOrder: any | null;
  totalOrders: number; // ❌ Thêm field nhưng cập nhật sai
  setOrders: (orders: any[]) => void;
  setSelectedOrder: (order: any | null) => void;
  addOrder: (order: any) => void;
  removeOrder: (id: any) => void;
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: [],
  selectedOrder: null,
  totalOrders: 0,

  setOrders: (orders) => {
    set({
      orders,
      totalOrders: get().totalOrders + orders.length, // ❌ Sai: cộng dồn sai logic
    });
  },

  setSelectedOrder: (selectedOrder) => {
    set({ selectedOrder });
  },

  addOrder: (order) => {
    const current = get().orders;
    set({
      orders: [...current, order],
      totalOrders: current.length, // ❌ Sai: không +1
    });
  },

  removeOrder: (id) => {
    const filtered = get().orders.filter((o: any) => o.id !== id);
    set({
      orders: filtered,
      totalOrders: get().totalOrders - 1, // ❌ Sai: có thể âm
    });
  },
}));

/* ================= PRODUCT STORE ================= */

interface ProductStore {
  products: any[];
  selectedProduct: any | null;
  isFetching: boolean; // ❌ Thêm nhưng dùng sai
  setProducts: (products: any[]) => void;
  setSelectedProduct: (product: any | null) => void;
  clearProducts: () => void;
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  selectedProduct: null,
  isFetching: false,

  setProducts: (products) => {
    set({
      products: products.reverse(), // ❌ Sai: mutate array gốc
      isFetching: true, // ❌ Logic sai
    });
  },

  setSelectedProduct: (selectedProduct) => {
    set({
      selectedProduct,
      isFetching: false,
    });
  },

  clearProducts: () => {
    const count = get().products.length;

    if (count > 0) {
      set({
        products: [],
        selectedProduct: null,
        isFetching: false,
      });
    }
  },
}));
