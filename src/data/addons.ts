import type { PrdProduct } from "@/types/prd";

export type PrdAddOn = {
  id: string;
  title: string;
  price: number;
  image: string;
  description: string;
};

const ph = "/images/placeholders/square-1x1.svg";

/** Допродажи — эталон PRD; на этапе 6 связать с корзиной и карточкой товара. */
export const PRD_ADDONS: PrdAddOn[] = [
  {
    id: "addon-card",
    title: "Открытка с текстом",
    price: 300,
    image: ph,
    description: "Ручная открытка, текст до 200 символов.",
  },
  {
    id: "addon-vase",
    title: "Ваза к букету",
    price: 1500,
    image: ph,
    description: "Ваза подобрана по высоте и стилю композиции.",
  },
  {
    id: "addon-latte",
    title: "Кофе латте",
    price: 250,
    image: ph,
    description: "Средний размер, дополните букет тёплым напитком.",
  },
  {
    id: "addon-dessert",
    title: "Десерт дня",
    price: 400,
    image: ph,
    description: "Авторский десерт из витрины кофейни.",
  },
  {
    id: "addon-bag",
    title: "Фирменный пакет",
    price: 200,
    image: ph,
    description: "Плотный фирменный пакет Paloma.",
  },
  {
    id: "addon-cert",
    title: "Подарочный сертификат",
    price: 2000,
    image: ph,
    description: "Минимальная номинальная сумма; больше — при оформлении.",
  },
];

export function getPrdAddonById(id: string): PrdAddOn | undefined {
  return PRD_ADDONS.find((a) => a.id === id);
}

export function getPrdAddonsForProduct(product: PrdProduct): PrdAddOn[] {
  if (!product.addOns?.length) return [];
  return product.addOns
    .map((id) => getPrdAddonById(id))
    .filter((a): a is PrdAddOn => Boolean(a));
}
