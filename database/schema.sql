-- PALOMA · Supabase / PostgreSQL (этап 2)
-- Выполните в SQL Editor нового проекта Supabase перед seed.sql.

-- ─── Вспомогательные ─────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- Активный менеджер: строка admin_users для текущего auth.uid()
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT au.is_active FROM public.admin_users au WHERE au.id = auth.uid()),
    false
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin_user() TO authenticated;

-- ─── Таблицы ─────────────────────────────────────────────────────────────────
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL UNIQUE,
  slug VARCHAR NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_categories_updated
BEFORE UPDATE ON public.categories
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories (id) ON DELETE SET NULL,
  name VARCHAR NOT NULL,
  slug VARCHAR NOT NULL UNIQUE,
  description TEXT,
  price NUMERIC(12, 2) NOT NULL,
  composition TEXT,
  care_instructions TEXT,
  delivery_info TEXT,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  is_ready_today BOOLEAN NOT NULL DEFAULT FALSE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_category ON public.products (category_id);
CREATE INDEX idx_products_ready ON public.products (is_ready_today) WHERE is_ready_today = TRUE;

CREATE TRIGGER trg_products_updated
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TABLE public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_product_images_product ON public.product_images (product_id);

CREATE TABLE public.product_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
  option_type VARCHAR NOT NULL,
  option_id UUID NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT product_options_unique UNIQUE (product_id, option_type, option_id)
);

CREATE TABLE public.cafe_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  category VARCHAR NOT NULL,
  description TEXT,
  price NUMERIC(12, 2) NOT NULL,
  image_url TEXT,
  product_id UUID REFERENCES public.products (id) ON DELETE SET NULL,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_cafe_items_product_id ON public.cafe_items (product_id);

CREATE TRIGGER trg_cafe_items_updated
BEFORE UPDATE ON public.cafe_items
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR NOT NULL UNIQUE,
  customer_name VARCHAR NOT NULL,
  customer_phone VARCHAR NOT NULL,
  customer_email VARCHAR,
  contact_method VARCHAR,
  delivery_type VARCHAR NOT NULL,
  delivery_city VARCHAR,
  delivery_address VARCHAR,
  delivery_date DATE NOT NULL,
  delivery_interval VARCHAR,
  card_text TEXT,
  send_photo_before BOOLEAN NOT NULL DEFAULT TRUE,
  comment TEXT,
  subtotal NUMERIC(12, 2),
  delivery_cost NUMERIC(12, 2),
  total NUMERIC(12, 2),
  payment_method VARCHAR,
  payment_status VARCHAR NOT NULL DEFAULT 'pending',
  order_status VARCHAR NOT NULL DEFAULT 'new',
  stripe_payment_id VARCHAR,
  telegram_notified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_created ON public.orders (created_at DESC);

CREATE TRIGGER trg_orders_updated
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products (id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1,
  price_at_purchase NUMERIC(12, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_order_items_order ON public.order_items (order_id);

CREATE TABLE public.delivery_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city VARCHAR NOT NULL UNIQUE,
  free_delivery_threshold NUMERIC(12, 2) NOT NULL DEFAULT 5000,
  paid_delivery_cost NUMERIC(12, 2),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_delivery_settings_updated
BEFORE UPDATE ON public.delivery_settings
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR NOT NULL UNIQUE,
  setting_value TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_site_settings_updated
BEFORE UPDATE ON public.site_settings
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TABLE public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email VARCHAR NOT NULL UNIQUE,
  role VARCHAR NOT NULL DEFAULT 'manager',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.event_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  email VARCHAR,
  phone VARCHAR NOT NULL,
  event_date DATE,
  city VARCHAR,
  budget VARCHAR,
  guest_count INTEGER,
  zones TEXT,
  "references" TEXT,
  message TEXT,
  status VARCHAR NOT NULL DEFAULT 'new',
  telegram_notified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_event_requests_updated
BEFORE UPDATE ON public.event_requests
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TABLE public.subscription_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name VARCHAR NOT NULL,
  customer_phone VARCHAR NOT NULL,
  customer_email VARCHAR,
  frequency INTEGER NOT NULL DEFAULT 2,
  composition VARCHAR,
  size VARCHAR NOT NULL,
  price NUMERIC(12, 2),
  add_vase BOOLEAN NOT NULL DEFAULT FALSE,
  add_secateur BOOLEAN NOT NULL DEFAULT FALSE,
  delivery_address VARCHAR,
  status VARCHAR NOT NULL DEFAULT 'active',
  payment_status VARCHAR NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_subscription_orders_updated
BEFORE UPDATE ON public.subscription_orders
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TABLE public.wedding_piggybank_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_name VARCHAR NOT NULL,
  wedding_date DATE NOT NULL,
  phone VARCHAR NOT NULL,
  telegram VARCHAR,
  status VARCHAR NOT NULL DEFAULT 'new',
  telegram_notified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_wedding_piggybank_requests_created ON public.wedding_piggybank_requests (created_at DESC);

CREATE TRIGGER trg_wedding_piggybank_requests_updated
BEFORE UPDATE ON public.wedding_piggybank_requests
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

COMMENT ON COLUMN public.orders.stripe_payment_id IS 'Внешний id платежа (ЮKassa и др.) до выделения отдельной колонки.';

-- ─── RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cafe_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wedding_piggybank_requests ENABLE ROW LEVEL SECURITY;

-- Каталог: публичное чтение
CREATE POLICY categories_public_read ON public.categories
  FOR SELECT TO anon, authenticated
  USING (is_active IS TRUE);

CREATE POLICY categories_admin_manage ON public.categories
  FOR ALL TO authenticated
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

CREATE POLICY products_public_read ON public.products
  FOR SELECT TO anon, authenticated
  USING (
    is_available IS TRUE
    AND (
      category_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.categories c
        WHERE c.id = products.category_id AND c.is_active IS TRUE
      )
    )
  );

CREATE POLICY products_admin_manage ON public.products
  FOR ALL TO authenticated
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

CREATE POLICY product_images_public_read ON public.product_images
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_images.product_id
        AND p.is_available IS TRUE
        AND (
          p.category_id IS NULL
          OR EXISTS (
            SELECT 1 FROM public.categories c
            WHERE c.id = p.category_id AND c.is_active IS TRUE
          )
        )
    )
  );

CREATE POLICY product_images_admin_manage ON public.product_images
  FOR ALL TO authenticated
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

CREATE POLICY product_options_public_read ON public.product_options
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_options.product_id
        AND p.is_available IS TRUE
    )
  );

CREATE POLICY product_options_admin_manage ON public.product_options
  FOR ALL TO authenticated
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

CREATE POLICY cafe_items_public_read ON public.cafe_items
  FOR SELECT TO anon, authenticated
  USING (is_available IS TRUE);

CREATE POLICY cafe_items_admin_manage ON public.cafe_items
  FOR ALL TO authenticated
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

CREATE POLICY delivery_settings_public_read ON public.delivery_settings
  FOR SELECT TO anon, authenticated
  USING (is_active IS TRUE);

CREATE POLICY delivery_settings_admin_manage ON public.delivery_settings
  FOR ALL TO authenticated
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

CREATE POLICY site_settings_public_read ON public.site_settings
  FOR SELECT TO anon, authenticated
  USING (TRUE);

CREATE POLICY site_settings_admin_manage ON public.site_settings
  FOR ALL TO authenticated
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

-- Заказы: только service role (без политик для anon) — создавать через API с service key
CREATE POLICY orders_admin_manage ON public.orders
  FOR ALL TO authenticated
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

CREATE POLICY order_items_admin_manage ON public.order_items
  FOR ALL TO authenticated
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

CREATE POLICY admin_users_self_read ON public.admin_users
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY admin_users_admin_manage ON public.admin_users
  FOR ALL TO authenticated
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

CREATE POLICY event_requests_admin_manage ON public.event_requests
  FOR ALL TO authenticated
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

CREATE POLICY subscription_orders_admin_manage ON public.subscription_orders
  FOR ALL TO authenticated
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

CREATE POLICY wedding_piggybank_requests_admin_manage ON public.wedding_piggybank_requests
  FOR ALL TO authenticated
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());
