-- Таблица заявок «свадебная копилка». Выполните в Supabase SQL Editor на существующем проекте
-- (в свежих установках из schema.sql таблица уже есть).

CREATE TABLE IF NOT EXISTS public.wedding_piggybank_requests (
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

CREATE INDEX IF NOT EXISTS idx_wedding_piggybank_requests_created
  ON public.wedding_piggybank_requests (created_at DESC);

DROP TRIGGER IF EXISTS trg_wedding_piggybank_requests_updated ON public.wedding_piggybank_requests;

CREATE TRIGGER trg_wedding_piggybank_requests_updated
  BEFORE UPDATE ON public.wedding_piggybank_requests
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

ALTER TABLE public.wedding_piggybank_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS wedding_piggybank_requests_admin_manage ON public.wedding_piggybank_requests;

CREATE POLICY wedding_piggybank_requests_admin_manage ON public.wedding_piggybank_requests
  FOR ALL TO authenticated
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());
