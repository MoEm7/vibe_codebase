-- Coffee Carriers Database Schema
-- All tables for Phase 1 (future-proof fields included)

-- Enable PostGIS for geo queries
CREATE EXTENSION IF NOT EXISTS cube;
CREATE EXTENSION IF NOT EXISTS earthdistance;

-- Custom ENUM types
CREATE TYPE user_role AS ENUM ('maker', 'sipper', 'admin');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('unpaid', 'paid', 'refunded');
CREATE TYPE blog_post_status AS ENUM ('draft', 'pending_review', 'published', 'rejected', 'archived');

-- 1. Users (extends Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'sipper',
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  preferred_language TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Maker Profiles
CREATE TABLE maker_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  shop_name TEXT NOT NULL,
  bio TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  latitude FLOAT8,
  longitude FLOAT8,
  location_label TEXT,
  is_live BOOLEAN NOT NULL DEFAULT false,
  operating_hours JSONB,
  avg_rating FLOAT4 NOT NULL DEFAULT 0,
  total_ratings INT4 NOT NULL DEFAULT 0,
  total_products INT4 NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Sipper Profiles
CREATE TABLE sipper_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  preferred_radius_km FLOAT4 NOT NULL DEFAULT 5,
  favorite_drink TEXT,
  location_lat FLOAT8,
  location_lng FLOAT8,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  maker_id UUID NOT NULL REFERENCES maker_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(8,2) NOT NULL,
  image_url TEXT,
  category TEXT NOT NULL DEFAULT 'hot',
  is_available BOOLEAN NOT NULL DEFAULT true,
  sort_order INT4 NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  sipper_id UUID NOT NULL REFERENCES sipper_profiles(id) ON DELETE CASCADE,
  maker_id UUID NOT NULL REFERENCES maker_profiles(id) ON DELETE CASCADE,
  status order_status NOT NULL DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  notes TEXT,
  payment_status payment_status NOT NULL DEFAULT 'unpaid',
  estimated_ready_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Order Items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INT4 NOT NULL DEFAULT 1,
  unit_price DECIMAL(8,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL
);

-- 7. Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sipper_id UUID NOT NULL REFERENCES sipper_profiles(id) ON DELETE CASCADE,
  maker_id UUID NOT NULL REFERENCES maker_profiles(id) ON DELETE CASCADE,
  rating INT2 NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (sipper_id, maker_id)
);

-- 8. Favorites
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sipper_id UUID NOT NULL REFERENCES sipper_profiles(id) ON DELETE CASCADE,
  maker_id UUID NOT NULL REFERENCES maker_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (sipper_id, maker_id)
);

-- 9. Blog Authors
CREATE TABLE blog_authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Blog Posts
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES blog_authors(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  status blog_post_status NOT NULL DEFAULT 'draft',
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  review_notes TEXT,
  locale TEXT NOT NULL DEFAULT 'en',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. Blog Categories
CREATE TABLE blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL
);

-- 12. Blog Post Categories (junction)
CREATE TABLE blog_post_categories (
  post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES blog_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, category_id)
);

-- INDEXES
CREATE INDEX idx_maker_profiles_location ON maker_profiles (latitude, longitude);
CREATE INDEX idx_maker_profiles_is_live ON maker_profiles (is_live);
CREATE INDEX idx_products_maker_id ON products (maker_id);
CREATE INDEX idx_orders_sipper_id ON orders (sipper_id);
CREATE INDEX idx_orders_maker_id ON orders (maker_id);
CREATE INDEX idx_orders_status ON orders (status);
CREATE INDEX idx_reviews_maker_id ON reviews (maker_id);
CREATE INDEX idx_favorites_sipper_id ON favorites (sipper_id);
CREATE INDEX idx_blog_posts_status ON blog_posts (status);
CREATE INDEX idx_blog_posts_slug ON blog_posts (slug);
CREATE INDEX idx_users_role ON users (role);
CREATE INDEX idx_users_is_active ON users (is_active);

-- FUNCTIONS

-- Get nearby makers sorted by distance
CREATE OR REPLACE FUNCTION get_nearby_makers(
  user_lat FLOAT8,
  user_lng FLOAT8,
  radius_km FLOAT8 DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  shop_name TEXT,
  bio TEXT,
  logo_url TEXT,
  latitude FLOAT8,
  longitude FLOAT8,
  location_label TEXT,
  is_live BOOLEAN,
  avg_rating FLOAT4,
  total_ratings INT4,
  total_products INT4,
  distance_km FLOAT8
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    mp.id,
    mp.user_id,
    mp.shop_name,
    mp.bio,
    mp.logo_url,
    mp.latitude,
    mp.longitude,
    mp.location_label,
    mp.is_live,
    mp.avg_rating,
    mp.total_ratings,
    mp.total_products,
    (point(mp.longitude, mp.latitude) <@> point(user_lng, user_lat)) * 1.609344 AS distance_km
  FROM maker_profiles mp
  JOIN users u ON u.id = mp.user_id
  WHERE
    mp.latitude IS NOT NULL
    AND mp.longitude IS NOT NULL
    AND u.is_active = true
    AND (point(mp.longitude, mp.latitude) <@> point(user_lng, user_lat)) * 1.609344 <= radius_km
  ORDER BY distance_km ASC;
END;
$$ LANGUAGE plpgsql;

-- Auto-update maker rating after review changes
CREATE OR REPLACE FUNCTION update_maker_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE maker_profiles
  SET
    avg_rating = COALESCE((SELECT AVG(rating)::FLOAT4 FROM reviews WHERE maker_id = COALESCE(NEW.maker_id, OLD.maker_id)), 0),
    total_ratings = (SELECT COUNT(*) FROM reviews WHERE maker_id = COALESCE(NEW.maker_id, OLD.maker_id))
  WHERE id = COALESCE(NEW.maker_id, OLD.maker_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_maker_rating
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_maker_rating();

-- Auto-update product count
CREATE OR REPLACE FUNCTION update_product_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE maker_profiles
  SET total_products = (SELECT COUNT(*) FROM products WHERE maker_id = COALESCE(NEW.maker_id, OLD.maker_id))
  WHERE id = COALESCE(NEW.maker_id, OLD.maker_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_product_count
AFTER INSERT OR UPDATE OR DELETE ON products
FOR EACH ROW EXECUTE FUNCTION update_product_count();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ROW LEVEL SECURITY

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE maker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sipper_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_categories ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Public can read active user display info" ON users FOR SELECT USING (is_active = true);

-- Maker profiles policies
CREATE POLICY "Anyone can read maker profiles" ON maker_profiles FOR SELECT USING (true);
CREATE POLICY "Makers can update own profile" ON maker_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Makers can insert own profile" ON maker_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Sipper profiles policies
CREATE POLICY "Sippers can read own profile" ON sipper_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Sippers can update own profile" ON sipper_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Sippers can insert own profile" ON sipper_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Products policies
CREATE POLICY "Auth users can read products" ON products FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Makers can manage own products" ON products FOR ALL USING (
  maker_id IN (SELECT id FROM maker_profiles WHERE user_id = auth.uid())
);

-- Orders policies
CREATE POLICY "Sippers can read own orders" ON orders FOR SELECT USING (
  sipper_id IN (SELECT id FROM sipper_profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Makers can read incoming orders" ON orders FOR SELECT USING (
  maker_id IN (SELECT id FROM maker_profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Sippers can create orders" ON orders FOR INSERT WITH CHECK (
  sipper_id IN (SELECT id FROM sipper_profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Makers can update order status" ON orders FOR UPDATE USING (
  maker_id IN (SELECT id FROM maker_profiles WHERE user_id = auth.uid())
);

-- Order items policies
CREATE POLICY "Users can read own order items" ON order_items FOR SELECT USING (
  order_id IN (
    SELECT id FROM orders WHERE
      sipper_id IN (SELECT id FROM sipper_profiles WHERE user_id = auth.uid())
      OR maker_id IN (SELECT id FROM maker_profiles WHERE user_id = auth.uid())
  )
);
CREATE POLICY "Sippers can insert order items" ON order_items FOR INSERT WITH CHECK (
  order_id IN (SELECT id FROM orders WHERE sipper_id IN (SELECT id FROM sipper_profiles WHERE user_id = auth.uid()))
);

-- Reviews policies
CREATE POLICY "Anyone can read reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Sippers can write reviews" ON reviews FOR INSERT WITH CHECK (
  sipper_id IN (SELECT id FROM sipper_profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Sippers can update own reviews" ON reviews FOR UPDATE USING (
  sipper_id IN (SELECT id FROM sipper_profiles WHERE user_id = auth.uid())
);

-- Favorites policies
CREATE POLICY "Sippers can manage own favorites" ON favorites FOR ALL USING (
  sipper_id IN (SELECT id FROM sipper_profiles WHERE user_id = auth.uid())
);

-- Blog policies
CREATE POLICY "Anyone can read blog authors" ON blog_authors FOR SELECT USING (true);
CREATE POLICY "Anyone can read published posts" ON blog_posts FOR SELECT USING (status = 'published');
CREATE POLICY "Authors can read own posts" ON blog_posts FOR SELECT USING (
  author_id IN (SELECT id FROM blog_authors WHERE user_id = auth.uid())
);
CREATE POLICY "Authors can insert posts" ON blog_posts FOR INSERT WITH CHECK (
  author_id IN (SELECT id FROM blog_authors WHERE user_id = auth.uid())
);
CREATE POLICY "Authors can update own posts" ON blog_posts FOR UPDATE USING (
  author_id IN (SELECT id FROM blog_authors WHERE user_id = auth.uid())
);
CREATE POLICY "Anyone can read blog categories" ON blog_categories FOR SELECT USING (true);
CREATE POLICY "Anyone can read blog post categories" ON blog_post_categories FOR SELECT USING (true);

-- Seed blog categories
INSERT INTO blog_categories (name, slug) VALUES
  ('Recipes', 'recipes'),
  ('Maker Stories', 'maker-stories'),
  ('Tips & Tricks', 'tips-tricks'),
  ('News', 'news');
