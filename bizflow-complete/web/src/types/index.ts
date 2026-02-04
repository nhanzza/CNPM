/* ================= ENUMS ================= */

export type UserRole = 'admin' | 'owner' | 'employee';
export type OrderType = 'counter' | 'phone' | 'zalo';
export type OrderStatus = 'draft' | 'confirmed' | 'completed' | 'cancelled';
export type SubscriptionPlan = 'basic' | 'pro' | 'premium';
export type PaymentMethod = 'cash' | 'bank_transfer' | 'momo' | 'card';
export type PaymentStatus = 'pending' | 'paid' | 'failed';
export type Currency = 'VND' | 'USD';

/* ================= USER ================= */

export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: UserRole;
  business_id?: string;
  phone?: string;
  avatar_url?: string;
  last_login_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

/* ================= BUSINESS ================= */

export interface Business {
  id: string;
  name: string;
  owner_id: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  province: string;
  business_type: string;
  tax_id?: string;
  logo_url?: string;
  currency: Currency;
  is_active: boolean;
  subscription_plan: SubscriptionPlan;
  subscription_expires_at?: string;
  created_at: string;
  updated_at?: string;
}

/* ================= PRODUCT ================= */

export interface Product {
  id: string;
  business_id: string;
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  price: number;
  cost: number;
  currency: Currency;
  category: string;
  units: Array<{
    name: string;      // ví dụ: thùng, hộp, cái
    value: number;     // quy đổi về đơn vị gốc
  }>;
  min_stock?: number;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

/* ================= INVENTORY ================= */

export interface Inventory {
  id: string;
  product_id: string;
  business_id: string;
  quantity_available: number;
  quantity_reserved: number;
  last_import_at?: string;
  last_export_at?: string;
  created_at: string;
  updated_at?: string;
}

/* ================= CUSTOMER ================= */

export interface Customer {
  id: string;
  business_id: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  note?: string;
  outstanding_debt: number;
  credit_limit?: number;
  total_purchases: number;
  total_transactions: number;
  last_purchase_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

/* ================= ORDER ================= */

export interface Order {
  id: string;
  order_number: string;
  business_id: string;
  customer_id?: string;
  customer_name: string;
  employee_id: string;
  order_type: OrderType;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax?: number;
  total_amount: number;
  is_credit: boolean;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  notes?: string;
  completed_at?: string;
  created_at: string;
  updated_at?: string;
}

/* ================= ORDER ITEM ================= */

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  cost_price?: number;
  discount?: number;
  subtotal: number;
}

/* ================= PAYMENT ================= */

export interface Payment {
  id: string;
  order_id: string;
  business_id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transaction_code?: string;
  paid_at?: string;
  created_at: string;
}

/* ================= DEBT ================= */

export interface Debt {
  id: string;
  business_id: string;
  customer_id: string;
  order_id: string;
  amount: number;
  remaining_debt: number;
  due_date?: string;
  is_paid: boolean;
  paid_date?: string;
  created_at: string;
  updated_at?: string;
}

/* ================= DRAFT ORDER (AI PARSING) ================= */

export interface DraftOrder {
  id: string;
  business_id: string;
  customer_name: string;
  items: DraftOrderItem[];
  total_amount: number;
  raw_input: string;     // text nhập từ Zalo/ghi chú
  confidence: number;    // độ tin cậy AI parse
  parsed_by?: string;    // user/ai
  is_confirmed: boolean;
  is_rejected: boolean;
  created_at: string;
  updated_at?: string;
}

export interface DraftOrderItem {
  product_id?: string;
  product_name: string;
  quantity: number;
  unit: string;
  unit_price: number;
}

/* ================= ANALYTICS ================= */

export interface Analytics {
  total_revenue: number;
  total_orders: number;
  total_customers: number;
  outstanding_debt: number;
  average_order_value: number;
  revenue_growth_rate?: number;
  top_sellers: TopSeller[];
  outstanding_debts: DebtReport[];
}

export interface TopSeller {
  product_id: string;
  product_name: string;
  quantity_sold: number;
  revenue: number;
}

export interface DebtReport {
  customer_id: string;
  customer_name: string;
  outstanding_debt: number;
  total_orders: number;
  overdue_amount?: number;
}
