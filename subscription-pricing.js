/* PALOMA — расчёт цветочной подписки
   Модель: итог = количество букетов × цена выбранного размера.
   «Пробная неделя» = 1 букет со скидкой 10%. Доставка бесплатная. */
window.PALOMA_SUBSCRIPTION_PRICING = {
  sizes: {
    S: { label: "S", bouquetPrice: 2000 },
    M: { label: "M", bouquetPrice: 3500 },
    L: { label: "L", bouquetPrice: 4500 },
    XL: { label: "XL", bouquetPrice: 5500 },
    XXL: { label: "XXL", bouquetPrice: 7500 },
  },
  plans: {
    month: { label: "Подписка на месяц", trial: false },
    trial: { label: "Пробная неделя", trial: true, discount: 0.1 },
  },
  counts: { 2: 2, 4: 4 },
  composition: {
    mono: "Моно",
    author: "Авторский",
  },
  fulfillment: {
    delivery: { label: "Доставка по Новороссийску", feePerDelivery: 0 },
    pickup: { label: "Самовывоз · Энгельса, 74/82", feePerDelivery: 0 },
  },
  defaults: {
    plan: "month",
    count: "2",
    composition: "mono",
    size: "M",
    fulfillment: "delivery",
  },
};

window.PalomaSubscriptionCalc = function calcSubscription(config) {
  const P = window.PALOMA_SUBSCRIPTION_PRICING;
  const size = P.sizes[config.size] || P.sizes.M;
  const plan = P.plans[config.plan] || P.plans.month;
  const comp = P.composition[config.composition] || P.composition.mono;
  const ship = P.fulfillment[config.fulfillment] || P.fulfillment.delivery;

  const count = plan.trial ? 1 : (parseInt(config.count, 10) || 2);
  const gross = size.bouquetPrice * count;
  const discount = plan.trial ? Math.round(gross * plan.discount) : 0;
  const total = gross - discount;

  return {
    total,
    count,
    gross,
    discount,
    isTrial: plan.trial,
    labels: {
      size: size.label,
      composition: comp,
      fulfillment: ship.label,
      plan: plan.label,
    },
  };
};
