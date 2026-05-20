import type { MockProduct } from "@/data/mockProducts";
import { mockProducts } from "@/data/mockProducts";
import type { CafeMenuCategorySlug } from "@/data/cafe-menu";
import { PRD_CAFE_MENU_ITEMS } from "@/data/cafe-menu";
import { dbProductToMock } from "@/lib/catalog/mapDbToMock";
import { fetchDbProducts } from "@/lib/supabase/catalog";
import { hasSupabaseEnv } from "@/lib/supabase/config";

const MENU_CATEGORY_SLUGS = new Set(["kofe", "vypechka"]);

const CAFE_CATEGORY_CATALOG_SLUG: Record<CafeMenuCategorySlug, string> = {
  coffee: "cafe-coffee",
  cocoa: "cafe-cocoa",
  tea: "cafe-tea",
  bakery: "cafe-bakery",
  desserts: "cafe-desserts",
};

/** Позиции из `cafe-menu.ts`: дополняют каталог чаем/какао и дают полное меню без БД. */
export function prdCafeMenuToMockProducts(): MockProduct[] {
  return PRD_CAFE_MENU_ITEMS.map((item) => {
    const img =
      item.image ??
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80";
    return {
      id: item.id,
      slug: item.id,
      title: item.title,
      catalogCategorySlug: CAFE_CATEGORY_CATALOG_SLUG[item.category],
      category: "coffee",
      price: item.price,
      sizes: [{ size: "стандарт", price: item.price }],
      composition: item.description ?? "",
      origin: "Paloma Coffee",
      description: item.description ?? "",
      images: [img],
      inStock: true,
      isBestseller: false,
      isSeasonal: false,
      relatedProductIds: [],
      upsellProductIds: [],
    };
  });
}

function mergeMenuWithPrd(dbOrLegacy: MockProduct[]): MockProduct[] {
  const prd = prdCafeMenuToMockProducts();
  const slugs = new Set(dbOrLegacy.map((p) => p.slug));
  return [...dbOrLegacy, ...prd.filter((p) => !slugs.has(p.slug))];
}

function legacyCoffeeMenu(): MockProduct[] {
  return mockProducts.filter((p) => p.category === "coffee" && p.inStock);
}

/** Меню /coffee: каталог (kofe, vypechka) + недостающие позиции из PRD `cafe-menu.ts`. */
export async function getCoffeeMenuBootstrap(): Promise<MockProduct[]> {
  if (!hasSupabaseEnv()) {
    return mergeMenuWithPrd(legacyCoffeeMenu());
  }

  try {
    const [kofe, pastry] = await Promise.all([
      fetchDbProducts({ categorySlug: "kofe" }),
      fetchDbProducts({ categorySlug: "vypechka" }),
    ]);

    if (kofe.error || pastry.error) return mergeMenuWithPrd(legacyCoffeeMenu());

    const merged = [...(kofe.data ?? []), ...(pastry.data ?? [])];
    const mapped = merged
      .filter((p) => MENU_CATEGORY_SLUGS.has(p.category_slug ?? ""))
      .map(dbProductToMock)
      .filter((m) => m.inStock);

    const fromDb = mapped.length > 0 ? mapped : legacyCoffeeMenu();
    return mergeMenuWithPrd(fromDb);
  } catch {
    return mergeMenuWithPrd(legacyCoffeeMenu());
  }
}
