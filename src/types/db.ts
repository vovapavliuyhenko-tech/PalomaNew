/** Строки из PostgreSQL / Supabase (этап 2). Numeric приходит строкой из PostgREST — нормализуйте через Number(). */
export interface DbCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string | null;
  display_order: number;
  created_at: string;
}

export interface DbProduct {
  id: string;
  category_id: string | null;
  /** Slug связанной категории из join categories(slug); опционально. */
  category_slug?: string | null;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  composition: string | null;
  care_instructions: string | null;
  delivery_info: string | null;
  is_available: boolean;
  is_ready_today: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  product_images?: DbProductImage[] | null;
}
