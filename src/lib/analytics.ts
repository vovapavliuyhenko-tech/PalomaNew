/**
 * Яндекс.Метрика — цели через window.ym (подключите счётчик в layout).
 */
declare global {
  interface Window {
    ym?: (id: string | number, method: string, ...args: unknown[]) => void;
  }
}

function metrikaId(): string | undefined {
  return process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;
}

export function ym(goalName: string, params?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  const id = metrikaId();
  if (!id || !window.ym) return;
  window.ym(id, "reachGoal", goalName, params);
}

export const analytics = {
  openCart: () => ym("open_cart"),
  viewCartUpsells: () => ym("view_cart_upsells"),
  cartUpsellClick: (id: string) => ym("cart_upsell_click", { id }),
  viewCatalog: () => ym("view_catalog"),
  viewProduct: (slug: string) => ym("view_product", { slug }),
  addToCart: (id: string, price: number) => ym("add_to_cart", { id, price }),
  startCheckout: () => ym("start_checkout"),
  paymentSuccess: (orderId: string, amount: number) =>
    ym("payment_success", { orderId, amount }),
  paymentFailed: () => ym("payment_failed"),
  clickWhatsapp: (source: string) => ym("click_whatsapp", { source }),
  clickTelegram: (source: string) => ym("click_telegram", { source }),
  clickPhone: (source: string) => ym("click_phone", { source }),
  submitWeddingForm: () => ym("submit_wedding_form"),
  submitEventsLead: () => ym("submit_events_lead"),
  addCoffeeToCart: (id: string) => ym("add_coffee_to_cart", { id }),
  toggleMusic: (state: "on" | "off") => ym("toggle_music", { state }),
  toggleTheme: (theme: "light" | "dark") => ym("toggle_theme", { theme }),
} as const;
