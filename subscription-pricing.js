/* PALOMA — расчёт цветочной подписки */
window.PALOMA_SUBSCRIPTION_PRICING = {
  sizes: {
    S: { label: "S", bouquetPrice: 3200 },
    M: { label: "M", bouquetPrice: 5200 },
    L: { label: "L", bouquetPrice: 7200 },
  },
  periods: {
    1: { label: "1 месяц", months: 1 },
    3: { label: "3 месяца", months: 3 },
    6: { label: "6 месяцев", months: 6 },
  },
  frequency: {
    weekly: { label: "1 раз в неделю", perMonth: 4 },
    biweekly: { label: "1 раз в 2 недели", perMonth: 2 },
    monthly: { label: "1 раз в месяц", perMonth: 1 },
  },
  fulfillment: {
    pickup: { label: "Самовывоз", feePerDelivery: 0 },
    delivery: { label: "Доставка", feePerDelivery: 0 },
  },
  defaults: {
    size: "M",
    period: "3",
    frequency: "biweekly",
    fulfillment: "pickup",
  },
};

window.PalomaSubscriptionCalc = function calcSubscription(config) {
  const P = window.PALOMA_SUBSCRIPTION_PRICING;
  const size = P.sizes[config.size] || P.sizes.M;
  const period = P.periods[config.period] || P.periods[3];
  const freq = P.frequency[config.frequency] || P.frequency.biweekly;
  const ship = P.fulfillment[config.fulfillment] || P.fulfillment.pickup;

  const deliveries = period.months * freq.perMonth;
  const bouquetsTotal = size.bouquetPrice * deliveries;
  const deliveryTotal = ship.feePerDelivery * deliveries;
  const total = bouquetsTotal + deliveryTotal;

  return {
    total,
    deliveries,
    bouquetsTotal,
    deliveryTotal,
    labels: {
      size: size.label,
      period: period.label,
      frequency: freq.label,
      fulfillment: ship.label,
    },
  };
};
