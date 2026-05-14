import { getReadyTodayProductsForHome } from "@/lib/catalog/getReadyTodayProducts";
import ReadyTodayGrid from "./ReadyTodayGrid";

/** Блок §10 «Готовые сегодня»: Supabase или mock. */
export default async function ReadyTodaySection() {
  const products = await getReadyTodayProductsForHome();
  return <ReadyTodayGrid initialProducts={products} />;
}
