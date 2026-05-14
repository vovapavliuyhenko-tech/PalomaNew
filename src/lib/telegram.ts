import { DELIVERY_INTERVALS } from "@/lib/constants";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const MANAGER_CHAT_ID = process.env.TELEGRAM_MANAGER_CHAT_ID;

function deliveryIntervalLabel(id: string): string {
  return DELIVERY_INTERVALS.find((i) => i.id === id)?.label ?? id;
}

function paymentMethodLabel(method: string): string {
  if (method === "card") return "Карта";
  if (method === "sbp") return "СБП";
  if (method === "pending") return "После подтверждения";
  return method;
}

function contactPreferenceLabel(method?: string): string {
  const m: Record<string, string> = {
    phone: "телефон",
    telegram: "Telegram",
    whatsapp: "WhatsApp",
    email: "email",
  };
  return method ? (m[method] ?? method) : "—";
}

function escapeTelegramHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export interface OrderItem {
  title: string;
  size: string;
  qty: number;
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerTelegram?: string;
  contactMethod?: string;
  recipientName: string;
  recipientPhone: string;
  iAmRecipient?: boolean;
  addressFromRecipient?: boolean;
  isAnonymous: boolean;
  deliveryType: "delivery" | "pickup";
  address?: string;
  courierComment?: string;
  deliveryDate: string;
  deliveryInterval: string;
  deliveryUrgency?: boolean;
  deliveryExactTime?: boolean;
  cardText?: string;
  paymentMethod: string;
  items: OrderItem[];
  total: number;
  discountAmount?: number;
  promoCode?: string | null;
}

async function sendTelegramMessage(chatId: string, text: string): Promise<void> {
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn("TELEGRAM_BOT_TOKEN not set");
    return;
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Telegram API error:", error);
  }
}

export async function sendOrderToTelegram(order: Order): Promise<void> {
  const itemsList = order.items
    .map((i) => `• ${i.title} (${i.size}) × ${i.qty} — ${i.price.toLocaleString("ru-RU")} ₽`)
    .join("\n");

  const intervalHuman = deliveryIntervalLabel(order.deliveryInterval);
  const payHuman = paymentMethodLabel(order.paymentMethod);
  const contactPref = contactPreferenceLabel(order.contactMethod);

  const managerText = `
🌸 <b>Новый заказ #${order.id}</b>

👤 <b>Покупатель:</b> ${order.customerName}
📞 ${order.customerPhone}${order.customerEmail ? `\n📧 ${order.customerEmail}` : ""}
${order.customerTelegram ? `\n💬 ${order.customerTelegram.startsWith("@") ? order.customerTelegram : "@" + order.customerTelegram.replace(/^@+/, "")}` : ""}
📣 <b>Связь:</b> ${contactPref}

👥 <b>Получатель:</b> ${order.recipientName}
📞 ${order.recipientPhone}
${order.iAmRecipient ? "🙋 <i>Заказчик = получатель</i>\n" : ""}${order.addressFromRecipient ? "📌 <i>Адрес уточняем у получателя</i>\n" : ""}${order.isAnonymous ? "🎭 <i>Анонимная доставка</i>" : ""}
${order.deliveryUrgency ? "\n⚡ <i>Срочная доставка (+500 ₽)</i>" : ""}${order.deliveryExactTime ? "\n🕐 <i>Точное время (+1000 ₽)</i>" : ""}

📦 <b>Состав заказа:</b>
${itemsList}
${order.discountAmount ? `\n🏷 <b>Скидка${order.promoCode ? ` (${order.promoCode})` : ""}:</b> −${order.discountAmount.toLocaleString("ru-RU")} ₽` : ""}

💰 <b>Итого:</b> ${order.total.toLocaleString("ru-RU")} ₽
💳 <b>Оплата:</b> ${payHuman}

🚗 <b>Доставка:</b> ${order.deliveryType === "pickup" ? "Самовывоз" : "Доставка"}
${order.address ? `📍 <b>Адрес:</b> ${order.address}` : ""}
${order.courierComment ? `💬 Курьеру: ${order.courierComment}` : ""}
📅 <b>Дата:</b> ${order.deliveryDate}, ${intervalHuman}
${order.cardText ? `\n💌 <b>Текст открытки:</b> ${order.cardText}` : ""}
`.trim();

  if (MANAGER_CHAT_ID) {
    await sendTelegramMessage(MANAGER_CHAT_ID, managerText);
  }

  if (order.customerTelegram) {
    const username = order.customerTelegram.replace("@", "");
    const customerText = `
🌸 Здравствуйте, ${order.customerName}!

Мы приняли ваш заказ в <b>Paloma Flowers</b>.

📦 <b>Состав:</b>
${itemsList}
${order.discountAmount ? `\n🏷 <b>Скидка${order.promoCode ? ` (${order.promoCode})` : ""}:</b> −${order.discountAmount.toLocaleString("ru-RU")} ₽` : ""}

🚗 <b>Доставка:</b> ${order.deliveryDate}, ${deliveryIntervalLabel(order.deliveryInterval)}
${order.address ? `📍 <b>Адрес:</b> ${order.address}` : "🏪 <b>Самовывоз</b>"}
👤 <b>Получатель:</b> ${order.recipientName}, ${order.recipientPhone}

💰 <b>Сумма:</b> ${order.total.toLocaleString("ru-RU")} ₽

📸 Мы отправим фото букета перед доставкой.
Менеджер скоро подтвердит детали заказа.

С любовью, Paloma Flowers 🌹
`.trim();

    await sendTelegramMessage(`@${username}`, customerText);
  }
}

export async function sendEventRequest(data: {
  name: string;
  phone: string;
  telegram?: string;
  eventType: string;
  eventDate: string;
  items: string[];
  budget: string;
  comment?: string;
}): Promise<void> {
  if (!MANAGER_CHAT_ID) return;

  const telegramLine = data.telegram?.trim()
    ? `💬 ${data.telegram.trim().startsWith("@") ? data.telegram.trim() : `@${data.telegram.trim().replace(/^@+/, "")}`}`
    : "";

  const text = `
🎉 <b>Заявка на оформление мероприятия</b>

👤 ${data.name}
📞 ${data.phone}
${telegramLine}

🎊 <b>Тип:</b> ${data.eventType}
📅 <b>Дата:</b> ${data.eventDate}
🎭 <b>Что оформить:</b> ${data.items.join(", ")}
💰 <b>Бюджет:</b> ${data.budget}
${data.comment ? `\n💬 ${data.comment}` : ""}
`.trim();

  await sendTelegramMessage(MANAGER_CHAT_ID, text);
}

export async function sendContactPageLead(data: {
  name: string;
  phone: string;
  email?: string;
  message?: string;
}): Promise<void> {
  if (!MANAGER_CHAT_ID) return;

  const text = `
📬 <b>Сообщение со страницы контактов</b>

👤 ${escapeTelegramHtml(data.name)}
📞 ${escapeTelegramHtml(data.phone)}
${data.email ? `📧 ${escapeTelegramHtml(data.email)}` : ""}
${data.message ? `\n💬 ${escapeTelegramHtml(data.message)}` : ""}
`.trim();

  await sendTelegramMessage(MANAGER_CHAT_ID, text);
}

export async function sendSubscriptionLead(data: {
  customerName: string;
  phone: string;
  email?: string;
  planName: string;
  price: number;
  freqLabel: string;
  deliveryAddress?: string;
  addVase: boolean;
  addSecateur: boolean;
  comment?: string;
}): Promise<void> {
  if (!MANAGER_CHAT_ID) return;

  const text = `
🌷 <b>Заявка на цветочную подписку</b>

👤 ${data.customerName}
📞 ${data.phone}
${data.email ? `📧 ${data.email}` : ""}

📦 <b>Тариф:</b> ${data.planName}
💰 ${data.price.toLocaleString("ru-RU")} ₽ / ${data.freqLabel}
${data.addVase ? "🫙 + ваза\n" : ""}${data.addSecateur ? "✂️ + секатор\n" : ""}
${data.deliveryAddress ? `📍 <b>Адрес:</b> ${data.deliveryAddress}` : ""}
${data.comment ? `\n💬 ${data.comment}` : ""}
`.trim();

  await sendTelegramMessage(MANAGER_CHAT_ID, text);
}

export async function sendWeddingPiggybank(data: {
  coupleName: string;
  weddingDate: string;
  phone: string;
  telegram?: string;
}): Promise<void> {
  if (!MANAGER_CHAT_ID) return;

  const tg = data.telegram?.trim().replace(/^@+/, "");

  const text = `
💍 <b>Заявка на свадебную копилку</b>

👰 <b>Пара:</b> ${escapeTelegramHtml(data.coupleName)}
📅 <b>Дата свадьбы:</b> ${escapeTelegramHtml(data.weddingDate)}
📞 ${escapeTelegramHtml(data.phone)}
${tg ? `💬 ${escapeTelegramHtml("@" + tg)}` : ""}
`.trim();

  await sendTelegramMessage(MANAGER_CHAT_ID, text);
}
