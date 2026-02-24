export type UserRole = "maker" | "sipper" | "admin";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";

export type PaymentStatus = "unpaid" | "paid" | "refunded";

export type BlogPostStatus =
  | "draft"
  | "pending_review"
  | "published"
  | "rejected"
  | "archived";

export type ProductCategory = "hot" | "cold" | "pastry" | "snack";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  display_name: string;
  avatar_url: string | null;
  phone: string | null;
  is_verified: boolean;
  is_active: boolean;
  preferred_language: string;
  created_at: string;
  updated_at: string;
}

export interface MakerProfile {
  id: string;
  user_id: string;
  shop_name: string;
  bio: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  latitude: number | null;
  longitude: number | null;
  location_label: string | null;
  is_live: boolean;
  operating_hours: Record<string, { open: string; close: string }> | null;
  avg_rating: number;
  total_ratings: number;
  total_products: number;
  created_at: string;
}

export interface SipperProfile {
  id: string;
  user_id: string;
  preferred_radius_km: number;
  favorite_drink: string | null;
  location_lat: number | null;
  location_lng: number | null;
  created_at: string;
}

export interface Product {
  id: string;
  maker_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: ProductCategory;
  is_available: boolean;
  sort_order: number;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  sipper_id: string;
  maker_id: string;
  status: OrderStatus;
  total_amount: number;
  notes: string | null;
  payment_status: PaymentStatus;
  estimated_ready_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Review {
  id: string;
  sipper_id: string;
  maker_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface Favorite {
  id: string;
  sipper_id: string;
  maker_id: string;
  created_at: string;
}

export interface BlogAuthor {
  id: string;
  user_id: string | null;
  name: string;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface BlogPost {
  id: string;
  author_id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  tags: string[];
  status: BlogPostStatus;
  reviewed_by: string | null;
  review_notes: string | null;
  locale: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
}
