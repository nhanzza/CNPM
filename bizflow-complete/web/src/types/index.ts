export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: 'admin' | 'owner' | 'employee';
  business_id?: string;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  business_id: string;
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  price: number;
  cost: number;
  category: string;
  units: Array<{ name: string; value: number }>;
  is_active: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  business_id: string;
  customer_id?: string;
  customer_name: string;
  employee_id: string;
  order_type: 'counter' | 'phone' | 'zalo';
  status: 'draft' | 'confirmed' | 'completed' | 'cancelled';
  items: OrderItem[];
  total_amount: number;
  discount: number;
  is_credit: boolean;
  payment_method: string;
  notes?: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  subtotal: number;
}

export interface Customer {
  id: string;
  business_id: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  outstanding_debt: number;
  total_purchases: number;
  total_transactions: number;
  is_active: boolean;
  created_at: string;
}

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
}

export interface DraftOrder {
  id: string;
  business_id: string;
  customer_name: string;
  items: DraftOrderItem[];
  total_amount: number;
  raw_input: string;
  confidence: number;
  is_confirmed: boolean;
  is_rejected: boolean;
  created_at: string;
}

export interface DraftOrderItem {
  product_id?: string;
  product_name: string;
  quantity: number;
  unit: string;
  unit_price: number;
}

export interface Analytics {
  total_revenue: number;
  total_orders: number;
  total_customers: number;
  outstanding_debt: number;
  average_order_value: number;
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
}

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
  is_active: boolean;
  subscription_plan: 'basic' | 'pro' | 'premium';
  subscription_expires_at?: string;
  created_at: string;
}
