-- Создайте в Supabase публичный bucket `catalog-images` (или переимпортируйте имя в SUPABASE_STORAGE_BUCKET_PRODUCTS).
-- Dashboard: Storage → New bucket → имя catalog-images → Public ✓

-- Если создаёте bucket через SQL (опционально):
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'catalog-images',
  'catalog-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set public = excluded.public;

-- Анонимное чтение для <img /> на витрине (upload идёт с service role и обходит политики).
drop policy if exists "Public read catalog images" on storage.objects;
create policy "Public read catalog images"
  on storage.objects for select to public
  using (bucket_id = 'catalog-images');
