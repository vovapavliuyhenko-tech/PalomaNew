"use client";

import { createBrowserClient } from "@supabase/ssr";

/** Клиент для Client Components (anon key + RLS). */
export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Задайте NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY в .env.local (после создания проекта Supabase)."
    );
  }
  return createBrowserClient(url, key);
}
