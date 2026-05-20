import type { MockProduct } from "@/data/mockProducts";
import type { DbProduct } from "@/types/db";

function placeholderImage(): string {
  return "https://images.unsplash.com/photo-1487530811015-780780169993?w=800&q=80";
}

function mockCategoryFromDbSlug(slug: string | null | undefined): MockProduct["category"] {
  switch (slug) {
    case "kofe":
      return "coffee";
    case "vazy":
      return "vases";
    case "monobuket":
      return "mono";
    case "v-korobke":
      return "compositions";
    case "otkritki":
      return "certificates";
    case "vypechka":
      return "coffee";
    case "wedding":
      return "wedding";
    case "bukety":
    case "piony":
    case "rozy":
    case "sezonnie":
    case "segodnya":
      return "seasonal";
    default:
      return "seasonal";
  }
}

/** Для домашней витрины и быстрых списков, пока ProductCard живёт на MockProduct. */
export function dbProductToMock(p: DbProduct): MockProduct {
  const imgs =
    p.product_images && p.product_images.length > 0
      ? p.product_images.map((i) => i.image_url)
      : [placeholderImage()];

  return {
    id: p.id,
    slug: p.slug,
    catalogCategorySlug: p.category_slug ?? null,
    title: p.name,
    category: mockCategoryFromDbSlug(p.category_slug),
    price: p.price,
    sizes: [{ size: "PALOMA", price: p.price }],
    composition: p.composition ?? "",
    origin: "",
    description: p.description ?? "",
    images: imgs,
    inStock: p.is_available,
    isBestseller: false,
    isSeasonal: true,
    relatedProductIds: [],
    upsellProductIds: [],
  };
}
