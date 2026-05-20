/**
 * Демо-промокоды PRD (`docs/PRD.md` §8). Разбор и сумма скидки — общие для клиента и API.
 */
export type PromoRule = {
  code: string;
  discountPercent?: number;
  discountRub?: number;
};

const PROMO_MAP: Record<string, Omit<PromoRule, "code">> = {
  PALOMA10: { discountPercent: 10 },
  WELCOME: { discountRub: 500 },
  FIRST: { discountPercent: 15 },
};

export function parsePromoCodeInput(raw: string): PromoRule | null {
  const key = raw.trim().toUpperCase();
  const body = PROMO_MAP[key];
  if (!body) return null;
  return { code: key, ...body };
}

export function promoDiscountAmount(subtotal: number, rule: PromoRule | null): number {
  if (!rule || subtotal <= 0) return 0;
  if (rule.discountRub != null) {
    return Math.min(subtotal, Math.max(0, rule.discountRub));
  }
  if (rule.discountPercent != null) {
    return Math.min(subtotal, Math.floor((subtotal * rule.discountPercent) / 100));
  }
  return 0;
}

export function promoHintsText(): string {
  return "PALOMA10 (−10%), WELCOME (−500 ₽), FIRST (−15%)";
}
