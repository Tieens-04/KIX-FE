
// ============ Auth / User ============
export interface User {
  id: string;
  _id?: string;
  email: string;
  name?: string;
  avatar?: string;
  phone?: string;
  role: 'admin' | 'store_manager' | 'customer';
  default_address?: Address;
  createdAt?: string;
}

export interface Address {
  recipient_name: string;
  phone: string;
  address: string;
  ward?: string;
  district?: string;
  city?: string;
}

// ============ Product ============
export interface Product {
  id: string;
  _id?: string;
  name: string;
  brand?: string;
  description?: string;
  images?: { url: string; is_primary?: boolean }[];
  price: number;
  status?: string;
  category?: string;
  colorway?: string;
  imageUrl?: string;
  oldPrice?: number;
  isHot?: boolean;
  isSoldOut?: boolean;
  isFeatured?: boolean;
  createdAt?: string;
}

export interface SKU {
  id: string;
  _id?: string;
  product_id: string;
  size: number;
  color: string;
  sku_code: string;
}

export interface Color {
  id: string;
  _id?: string;
  name: string;
  code: string;
  slug: string;
  createdAt?: string;
}

// ============ Store ============
export interface Store {
  id: string;
  _id?: string;
  name: string;
  address: string;
  phone?: string;
  manager_id?: string | null;
  manager?: { id: string; name: string; email: string } | null;
  status?: string;
  hours?: string;
  image?: string | null;
  badge?: string | null;
  featured?: boolean;
  features?: string[];
  lat?: number;
  lng?: number;
  createdAt?: string;
}

// ============ Cart ============
export interface CartItem {
  _id: string;
  product_id: any;
  sku_id: any;
  store_id: any;
  quantity: number;
  price: number;
}

export interface Cart {
  _id: string;
  user_id: string;
  items: CartItem[];
}

// ============ Order ============
export interface OrderItem {
  product_id: any;
  sku_id: any;
  store_id: any;
  product_name?: string;
  product_image?: string | null;
  size?: number;
  color?: string;
  sku_code?: string;
  store_name?: string;
  quantity: number;
  price: number;
  subtotal?: number;
}

export interface Order {
  id: string;
  _id?: string;
  order_number: string;
  customer_id: any;
  customer_email?: string;
  customer_phone?: string;
  shipping_address: Address;
  items: OrderItem[];
  subtotal?: number;
  tax?: number;
  discount_amount?: number;
  promo_code?: string | null;
  promotion_id?: string | null;
  total: number;
  payment_method?: string;
  payment_status?: string;
  status: 'pending' | 'paid' | 'completed' | 'cancelled';
  createdAt?: string;
}

// ============ Promotion ============
export interface Promotion {
  id: string;
  _id?: string;
  code: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_value: number;
  max_discount_amount: number | null;
  start_date: string;
  end_date: string;
  usage_limit: number | null;
  used_count: number;
  is_active: boolean;
  createdAt?: string;
}

export interface PromoValidationResult {
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  discount_amount: number;
  description?: string;
}

// ============ Inventory ============
export interface Inventory {
  id: string;
  _id?: string;
  store_id: any;
  sku_id: any;
  quantity: number;
  updatedAt?: string;
}

export interface InventoryHistory {
  _id: string;
  store_id: any;
  sku_id: any;
  type: 'SOLD' | 'RESTOCK' | 'ADJUSTMENT' | 'IMPORT' | 'TRANSFER_IN' | 'TRANSFER_OUT';
  quantity_change: number;
  quantity_before: number;
  quantity_after: number;
  note?: string;
  changed_by?: any;
  ticket_id?: string;
  createdAt?: string;
}

// ============ AI Search ============
export interface GroundingChunk {
  web?: { uri: string; title: string };
}

export interface SearchResult {
  text: string;
  sources: GroundingChunk[];
}
