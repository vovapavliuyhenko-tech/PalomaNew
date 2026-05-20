-- Применить на существующей БД: связь строк внутреннего меню с товаром каталога (/coffee).
ALTER TABLE public.cafe_items
  ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES public.products (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_cafe_items_product_id ON public.cafe_items (product_id);
