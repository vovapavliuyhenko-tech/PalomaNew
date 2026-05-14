export function hasSupabaseEnv(): boolean {
  const u = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const k = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(u?.trim?.() && k?.trim?.());
}
