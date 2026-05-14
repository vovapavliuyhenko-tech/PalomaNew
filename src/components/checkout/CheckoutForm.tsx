"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/lib/store/cartStore";
import {
  CITIES,
  DELIVERY_INTERVALS,
  DELIVERY_SURCHARGE_EXACT_TIME,
  DELIVERY_SURCHARGE_URGENCY,
  type DeliveryCity,
} from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import { analytics } from "@/lib/analytics";
import {
  ChevronRight,
  ChevronLeft,
  Truck,
  Store,
  CreditCard,
  Smartphone,
  Clock,
} from "lucide-react";

const deliveryCitySchema = z.enum(
  [CITIES[0], ...CITIES.slice(1)] as [DeliveryCity, ...DeliveryCity[]]
);

const checkoutIntervalIds = DELIVERY_INTERVALS.map((i) => i.id) as [
  (typeof DELIVERY_INTERVALS)[number]["id"],
  ...(typeof DELIVERY_INTERVALS)[number]["id"][],
];
const step2DeliveryIntervalSchema = z.enum(checkoutIntervalIds);

const step1Schema = z
  .object({
    customerName: z.string().min(2, "Минимум 2 символа"),
    customerPhone: z.string().min(11, "Введите корректный телефон"),
    customerEmail: z.union([z.literal(""), z.string().email("Некорректный email")]).optional(),
    customerTelegram: z.string().optional(),
    contactMethod: z.enum(["phone", "telegram", "whatsapp", "email"]),
    iAmRecipient: z.boolean(),
    recipientName: z.string().optional(),
    recipientPhone: z.string().optional(),
    isAnonymous: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.contactMethod === "email") {
      const e = data.customerEmail?.trim() ?? "";
      if (!e || !z.string().email().safeParse(e).success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Укажите email для связи",
          path: ["customerEmail"],
        });
      }
    }
    if (data.contactMethod === "telegram") {
      const t = data.customerTelegram?.trim() ?? "";
      if (t.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Укажите Telegram username",
          path: ["customerTelegram"],
        });
      }
    }
    if (!data.iAmRecipient) {
      const rn = data.recipientName?.trim() ?? "";
      const rp = data.recipientPhone?.trim() ?? "";
      if (rn.length < 2) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Минимум 2 символа", path: ["recipientName"] });
      }
      if (rp.length < 11) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Введите корректный телефон получателя",
          path: ["recipientPhone"],
        });
      }
    }
  });

const step2Schema = z
  .object({
    deliveryType: z.enum(["delivery", "pickup"]),
    deliveryCity: deliveryCitySchema.optional(),
    addressDetail: z.string().optional(),
    addressFromRecipient: z.boolean(),
    courierComment: z.string().optional(),
    deliveryDate: z.string().min(1, "Выберите дату"),
    deliveryInterval: step2DeliveryIntervalSchema,
    deliveryUrgency: z.boolean(),
    deliveryExactTime: z.boolean(),
    cardText: z.string().max(200, "Не более 200 символов").optional(),
    paymentMethod: z.enum(["card", "sbp", "pending"]),
    agreePersonalData: z.boolean().refine((v) => v, "Необходимо согласие"),
  })
  .superRefine((data, ctx) => {
    if (data.deliveryType !== "delivery") return;
    if (!data.deliveryCity) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Выберите город", path: ["deliveryCity"] });
      return;
    }
    if (!data.addressFromRecipient) {
      const ad = data.addressDetail?.trim() ?? "";
      if (ad.length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Укажите улицу, дом, квартиру",
          path: ["addressDetail"],
        });
      }
    }
  });

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;

function buildCheckoutAddress(params: {
  deliveryType: "delivery" | "pickup";
  city?: DeliveryCity;
  addressDetail?: string;
  addressFromRecipient: boolean;
}): string | undefined {
  if (params.deliveryType === "pickup") return undefined;
  const city = params.city;
  if (!city) return undefined;
  if (params.addressFromRecipient) return `${city} — адрес уточняем у получателя`;
  const d = params.addressDetail?.trim() ?? "";
  return d ? `${city}, ${d}` : city;
}

const today = new Date().toISOString().split("T")[0];

const inputClass =
  "w-full rounded-[var(--radius-medium)] border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 text-sm text-[var(--text-primary)] transition-colors placeholder:text-[var(--text-secondary)]/50 focus:border-[var(--color-cherry)] focus:outline-none";
const labelClass =
  "mb-1.5 block font-accent text-xs uppercase tracking-[var(--ls-widest)] text-[var(--text-secondary)]";
const errorClass = "text-xs text-red-500 mt-1";

export default function CheckoutForm() {
  const router = useRouter();
  const { items, total, clearCart, promo, totalAfterDiscount } = useCartStore();
  const [step, setStep] = useState(1);
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
  const [loading, setLoading] = useState(false);

  const form1 = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      customerTelegram: "",
      contactMethod: "phone",
      iAmRecipient: false,
      recipientName: "",
      recipientPhone: "",
      isAnonymous: false,
    },
  });

  const form2 = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      deliveryType: "delivery",
      deliveryCity: CITIES[0],
      addressDetail: "",
      addressFromRecipient: false,
      deliveryDate: "",
      deliveryInterval: "14-18",
      deliveryUrgency: false,
      deliveryExactTime: false,
      paymentMethod: "card",
      agreePersonalData: false,
    },
  });

  const iAmRecipientWatch = form1.watch("iAmRecipient");
  useEffect(() => {
    if (iAmRecipientWatch) {
      form1.clearErrors(["recipientName", "recipientPhone"]);
    }
  }, [iAmRecipientWatch, form1]);

  const watchDeliveryType = form2.watch("deliveryType");
  const watchDeliveryCity = form2.watch("deliveryCity");
  const watchAddressDetail = form2.watch("addressDetail");
  const watchAddressFromRecipient = form2.watch("addressFromRecipient");
  const watchDeliveryUrgency = form2.watch("deliveryUrgency");
  const watchDeliveryExactTime = form2.watch("deliveryExactTime");
  const watchPaymentMethod = form2.watch("paymentMethod");
  const watchCardText = form2.watch("cardText");

  const lineSubtotal = total();
  const afterPromo = totalAfterDiscount();

  type PreviewTotals = {
    subtotal: number;
    discountAmount: number;
    promoCode: string | null;
    deliveryCost: number;
    total: number;
    deliveryCity: string | null;
  };
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewTotals, setPreviewTotals] = useState<PreviewTotals | null>(null);

  const previewAddress =
    watchDeliveryType === "delivery"
      ? buildCheckoutAddress({
          deliveryType: "delivery",
          city: watchDeliveryCity,
          addressDetail: typeof watchAddressDetail === "string" ? watchAddressDetail : "",
          addressFromRecipient: Boolean(watchAddressFromRecipient),
        })
      : undefined;

  const cartLinesFingerprint = `${watchDeliveryType}|${previewAddress ?? ""}|${watchDeliveryUrgency}|${watchDeliveryExactTime}|${promo?.code ?? ""}|${items
    .map((i) => `${i.slug}:${i.id}:${i.size}:${i.quantity}:${i.price}`)
    .join(";")}`;

  useEffect(() => {
    if (step !== 2 || items.length === 0) {
      setPreviewTotals(null);
      setPreviewError(null);
      setPreviewLoading(false);
      return undefined;
    }

    if (watchDeliveryType === "delivery" && !previewAddress) {
      setPreviewTotals(null);
      setPreviewError(null);
      setPreviewLoading(false);
      return undefined;
    }

    const delayMs = watchDeliveryType === "delivery" ? 320 : 0;
    let cancelled = false;

    const run = async () => {
      setPreviewLoading(true);
      setPreviewError(null);

      try {
        const res = await fetch("/api/orders/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            deliveryType: watchDeliveryType,
            address: watchDeliveryType === "delivery" ? previewAddress : undefined,
            deliveryUrgency: watchDeliveryType === "delivery" && watchDeliveryUrgency,
            deliveryExactTime: watchDeliveryType === "delivery" && watchDeliveryExactTime,
            promoCode: promo?.code,
            items: items.map((i) => ({
              slug: i.slug,
              productId: i.id,
              title: i.title,
              unitPrice: i.price,
              qty: i.quantity,
              size: i.size,
            })),
          }),
        });
        const data = (await res.json()) as {
          success?: boolean;
          errors?: string[];
          subtotal?: number;
          discountAmount?: number;
          promoCode?: string | null;
          deliveryCost?: number;
          total?: number;
          deliveryCity?: string | null;
        };

        if (cancelled) return;

        if (!res.ok || !data.success) {
          const msg =
            data.errors?.join("\n") ??
            (!res.ok && res.status !== 422 ? "Не удалось рассчитать доставку. Попробуйте ещё раз." : "");
          setPreviewTotals(null);
          setPreviewError(
            msg || "Не удалось рассчитать стоимость. Откройте корзину или обновите страницу."
          );
          return;
        }

        const subtotal = typeof data.subtotal === "number" ? data.subtotal : 0;
        const discountAmount = typeof data.discountAmount === "number" ? data.discountAmount : 0;
        const promoCode = typeof data.promoCode === "string" ? data.promoCode : null;
        const deliveryCost = typeof data.deliveryCost === "number" ? data.deliveryCost : 0;
        const totalNum = typeof data.total === "number" ? data.total : subtotal - discountAmount + deliveryCost;

        setPreviewTotals({
          subtotal,
          discountAmount,
          promoCode,
          deliveryCost,
          total: totalNum,
          deliveryCity: data.deliveryCity ?? null,
        });
      } catch {
        if (!cancelled) {
          setPreviewTotals(null);
          setPreviewError("Нет связи с сервером. Проверьте соединение.");
        }
      } finally {
        if (!cancelled) setPreviewLoading(false);
      }
    };

    const t = setTimeout(run, delayMs);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [step, cartLinesFingerprint]);

  useEffect(() => {
    if (items.length > 0) analytics.startCheckout();
  }, [items.length]);

  const onStep1Submit = (data: Step1Data) => {
    setStep1Data(data);
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onStep2Submit = async (data: Step2Data) => {
    if (!step1Data) return;
    setLoading(true);

    const { deliveryCity, addressDetail, ...deliveryRest } = data;
    const address = buildCheckoutAddress({
      deliveryType: data.deliveryType,
      city: deliveryCity,
      addressDetail,
      addressFromRecipient: data.addressFromRecipient,
    });

    const order = {
      customerName: step1Data.customerName,
      customerPhone: step1Data.customerPhone,
      customerEmail: step1Data.customerEmail?.trim() || undefined,
      customerTelegram: step1Data.customerTelegram,
      contactMethod: step1Data.contactMethod,
      iAmRecipient: step1Data.iAmRecipient,
      isAnonymous: step1Data.isAnonymous,
      recipientName: step1Data.iAmRecipient
        ? step1Data.customerName
        : (step1Data.recipientName ?? "").trim(),
      recipientPhone: step1Data.iAmRecipient
        ? step1Data.customerPhone
        : (step1Data.recipientPhone ?? "").trim(),
      ...deliveryRest,
      address,
      items: items.map((i) => ({
        slug: i.slug,
        productId: i.id,
        title: i.title,
        unitPrice: i.price,
        qty: i.quantity,
        size: i.size,
      })),
      promoCode: promo?.code,
      total: afterPromo,
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order }),
      });

      const result = await res.json();
      if (result.success) {
        const paidTotal =
          typeof result.total === "number" && Number.isFinite(result.total) ? result.total : previewTotals?.total ?? afterPromo;
        sessionStorage.setItem(
          "paloma_pending_order",
          JSON.stringify({
            orderId: result.orderId,
            total: paidTotal,
            paymentId: result.paymentId,
          })
        );
        clearCart();
        if (result.confirmationUrl) {
          window.location.href = result.confirmationUrl;
        } else {
          router.push(`/checkout/thank-you?orderId=${result.orderId}`);
        }
      } else {
        analytics.paymentFailed();
        const apiErr =
          typeof result.error === "string"
            ? result.error
            : Array.isArray(result.errors)
              ? result.errors.join("\n")
              : "Не удалось оформить заказ. Обновите корзину или попробуйте позже.";
        window.alert(apiErr);
      }
    } catch (e) {
      console.error(e);
      analytics.paymentFailed();
    } finally {
      setLoading(false);
    }
  };

  const payAmount = previewTotals?.total ?? afterPromo;
  const awaitingDeliveryQuote =
    watchDeliveryType === "delivery" && Boolean(previewAddress) && previewLoading && !previewTotals;
  const submitHeld = loading || awaitingDeliveryQuote;
  const submitCta =
    loading
      ? "Обработка..."
      : awaitingDeliveryQuote
        ? "Считаем доставку…"
        : watchPaymentMethod === "pending"
          ? `Оформить заказ — ${formatPrice(payAmount)}`
          : `Оплатить ${formatPrice(payAmount)}`;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-primary)] px-8 py-14 text-center shadow-[var(--shadow-soft)]">
        <p
          className="mb-2 text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", fontWeight: 400 }}
        >
          Корзина пуста
        </p>
        <p className="font-accent mb-8 text-sm leading-relaxed text-[var(--text-secondary)]">
          Добавьте букет или кофе в корзину, чтобы перейти к оформлению.
        </p>
        <Link href="/catalog" className="btn-primary inline-flex justify-center">
          В каталог
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl">
      <div className="mb-10 flex flex-wrap items-center gap-x-3 gap-y-2">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-3">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors ${
                s === step
                  ? "bg-[var(--color-cherry)] text-[var(--text-on-dark)]"
                  : s < step
                    ? "bg-[var(--color-cherry)]/20 text-[var(--color-cherry)]"
                    : "bg-[var(--color-gray)] text-[var(--text-secondary)]"
              }`}
            >
              {s}
            </div>
            <span className="font-accent text-xs text-[var(--text-secondary)]">
              {s === 1 ? "Контакты" : "Доставка и оплата"}
            </span>
            {s < 2 && <ChevronRight size={14} className="text-[var(--border)]" />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <form onSubmit={form1.handleSubmit(onStep1Submit)} className="space-y-6">
          <h2
            className="mb-6 text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", fontWeight: 400, letterSpacing: "-0.02em" }}
          >
            Ваши контакты
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Ваше имя *</label>
              <input {...form1.register("customerName")} className={inputClass} placeholder="Анна" />
              {form1.formState.errors.customerName && (
                <p className={errorClass}>{form1.formState.errors.customerName.message}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Ваш телефон *</label>
              <input
                {...form1.register("customerPhone")}
                className={inputClass}
                placeholder="+7 (999) 000-00-00"
                type="tel"
              />
              {form1.formState.errors.customerPhone && (
                <p className={errorClass}>{form1.formState.errors.customerPhone.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className={labelClass}>Email</label>
            <input
              {...form1.register("customerEmail")}
              className={inputClass}
              placeholder="Укажите, если выбрали связь по email"
              type="email"
              autoComplete="email"
            />
            {form1.formState.errors.customerEmail && (
              <p className={errorClass}>{form1.formState.errors.customerEmail.message}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>Удобный способ связи *</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(
                [
                  { value: "phone" as const, label: "Телефон" },
                  { value: "telegram" as const, label: "Telegram" },
                  { value: "whatsapp" as const, label: "WhatsApp" },
                  { value: "email" as const, label: "Email" },
                ] as const
              ).map(({ value, label }) => (
                <label
                  key={value}
                  className={`flex cursor-pointer items-center justify-center rounded-[var(--radius-medium)] border px-2 py-2.5 text-center text-xs transition-all sm:text-sm ${
                    form1.watch("contactMethod") === value
                      ? "border-[var(--color-cherry)] bg-[color-mix(in_srgb,var(--paloma-orange)_14%,var(--paloma-white))] text-[var(--text-primary)]"
                      : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--color-cherry)]/40"
                  }`}
                >
                  <input type="radio" value={value} {...form1.register("contactMethod")} className="sr-only" />
                  <span className="font-accent leading-tight">{label}</span>
                </label>
              ))}
            </div>
            {form1.formState.errors.contactMethod && (
              <p className={errorClass}>{form1.formState.errors.contactMethod.message}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>Telegram username</label>
            <input
              {...form1.register("customerTelegram")}
              className={inputClass}
              placeholder="@username (если выбрали Telegram)"
            />
            {form1.formState.errors.customerTelegram && (
              <p className={errorClass}>{form1.formState.errors.customerTelegram.message}</p>
            )}
          </div>

          <div className="border-t border-[var(--border)] pt-6">
            <h3
              className="mb-4 text-[var(--text-primary)]"
              style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontWeight: 400, letterSpacing: "-0.02em" }}
            >
              Получатель
            </h3>

            <div className="mb-5 flex items-center gap-3">
              <input
                type="checkbox"
                id="iamrecipient"
                {...form1.register("iAmRecipient")}
                className="h-4 w-4 accent-[var(--color-cherry)]"
              />
              <label htmlFor="iamrecipient" className="font-accent cursor-pointer text-sm text-[var(--text-secondary)]">
                Я получатель
              </label>
            </div>

            <div className="mb-5 flex items-center gap-3">
              <input
                type="checkbox"
                id="anonymous"
                {...form1.register("isAnonymous")}
                className="h-4 w-4 accent-[var(--color-cherry)]"
              />
              <label htmlFor="anonymous" className="font-accent cursor-pointer text-sm text-[var(--text-secondary)]">
                Анонимная доставка (получатель не узнает отправителя)
              </label>
            </div>

            {!iAmRecipientWatch ? (
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Имя получателя *</label>
                  <input {...form1.register("recipientName")} className={inputClass} placeholder="Мария" />
                  {form1.formState.errors.recipientName && (
                    <p className={errorClass}>{form1.formState.errors.recipientName.message}</p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Телефон получателя *</label>
                  <input
                    {...form1.register("recipientPhone")}
                    className={inputClass}
                    placeholder="+7 (999) 000-99-99"
                    type="tel"
                  />
                  {form1.formState.errors.recipientPhone && (
                    <p className={errorClass}>{form1.formState.errors.recipientPhone.message}</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="font-accent text-sm text-[var(--text-secondary)]">
                Имя и телефон получателя совпадают с вашими контактами.
              </p>
            )}
          </div>

          <button type="submit" className="btn-primary w-full justify-center">
            Далее: доставка и оплата
            <ChevronRight size={16} />
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={form2.handleSubmit(onStep2Submit)} className="space-y-6">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-1 text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--paloma-orange)]"
            >
              <ChevronLeft size={16} />
              <span className="font-accent">Назад</span>
            </button>
            <h2
              className="text-[var(--text-primary)]"
              style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", fontWeight: 400, letterSpacing: "-0.02em" }}
            >
              Доставка и оплата
            </h2>
          </div>

          <div>
            <label className={labelClass}>Способ получения</label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {(
                [
                  { value: "delivery" as const, label: "Доставка", Icon: Truck },
                  { value: "pickup" as const, label: "Самовывоз", Icon: Store },
                ] as const
              ).map(({ value, label, Icon: IconComp }) => (
                <label
                  key={value}
                  className={`flex cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-medium)] border py-3 text-sm transition-all ${
                    watchDeliveryType === value
                      ? "border-[var(--color-cherry)] bg-[color-mix(in_srgb,var(--paloma-orange)_14%,var(--paloma-white))] text-[var(--text-primary)]"
                      : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--color-cherry)]/40"
                  }`}
                >
                  <input type="radio" value={value} {...form2.register("deliveryType")} className="sr-only" />
                  <IconComp size={17} className="shrink-0 opacity-85" strokeWidth={1.75} aria-hidden />
                  <span className="font-accent">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {watchDeliveryType === "delivery" && (
            <>
              <div>
                <label className={labelClass}>Город *</label>
                <select {...form2.register("deliveryCity")} className={inputClass}>
                  {CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                {form2.formState.errors.deliveryCity && (
                  <p className={errorClass}>{form2.formState.errors.deliveryCity.message}</p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="addrFromRecipient"
                  {...form2.register("addressFromRecipient")}
                  className="h-4 w-4 accent-[var(--color-cherry)]"
                />
                <label htmlFor="addrFromRecipient" className="font-accent cursor-pointer text-sm text-[var(--text-secondary)]">
                  Узнать адрес у получателя (уточним по телефону)
                </label>
              </div>

              {!watchAddressFromRecipient ? (
                <div>
                  <label className={labelClass}>Адрес *</label>
                  <textarea
                    {...form2.register("addressDetail")}
                    className={`${inputClass} resize-none`}
                    rows={2}
                    placeholder="Улица, дом, квартиру, подъезд, домофон"
                  />
                  {form2.formState.errors.addressDetail && (
                    <p className={errorClass}>{form2.formState.errors.addressDetail.message}</p>
                  )}
                </div>
              ) : null}

              <div>
                <label className={labelClass}>Комментарий курьеру</label>
                <textarea
                  {...form2.register("courierComment")}
                  className={`${inputClass} resize-none`}
                  rows={2}
                  placeholder="Дополнительные пожелания"
                />
              </div>
            </>
          )}

          {watchDeliveryType === "pickup" && (
            <p className="font-accent text-sm leading-relaxed text-[var(--text-secondary)]">
              Самовывоз по адресу бутика — мы подтвердим время в сообщении.
            </p>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Дата {watchDeliveryType === "delivery" ? "доставки" : "получения"} *</label>
              <input type="date" {...form2.register("deliveryDate")} className={inputClass} min={today} />
              {form2.formState.errors.deliveryDate && (
                <p className={errorClass}>{form2.formState.errors.deliveryDate.message}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Интервал</label>
              <select {...form2.register("deliveryInterval")} className={inputClass}>
                {DELIVERY_INTERVALS.map((int) => (
                  <option key={int.id} value={int.id}>
                    {int.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {watchDeliveryType === "delivery" && (
            <div className="space-y-3 rounded-[var(--radius-medium)] border border-[var(--border)] bg-[var(--bg-secondary)]/60 p-4">
              <p className="font-accent text-xs uppercase tracking-[var(--ls-widest)] text-[var(--text-secondary)]">
                Доплаты к доставке
              </p>
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  {...form2.register("deliveryUrgency")}
                  className="mt-1 h-4 w-4 accent-[var(--color-cherry)]"
                />
                <span className="font-accent text-sm text-[var(--text-primary)]">
                  Срочная доставка <span className="text-[var(--text-secondary)]">(+{DELIVERY_SURCHARGE_URGENCY} ₽)</span>
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  {...form2.register("deliveryExactTime")}
                  className="mt-1 h-4 w-4 accent-[var(--color-cherry)]"
                />
                <span className="font-accent text-sm text-[var(--text-primary)]">
                  Точное время <span className="text-[var(--text-secondary)]">(+{DELIVERY_SURCHARGE_EXACT_TIME} ₽)</span>
                </span>
              </label>
            </div>
          )}

          <div>
            <label className={labelClass}>Текст для открытки (до 200 символов)</label>
            <textarea
              {...form2.register("cardText")}
              className={`${inputClass} resize-none`}
              rows={3}
              maxLength={200}
              placeholder="Пожелание на открытке — по желанию"
            />
            <p className="mt-1 font-accent text-[11px] text-[var(--text-secondary)] tabular-nums">
              {(watchCardText?.length ?? 0)}/200
            </p>
            {form2.formState.errors.cardText && (
              <p className={errorClass}>{form2.formState.errors.cardText.message}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>Способ оплаты</label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {(
                [
                  { value: "card" as const, label: "Карта", Icon: CreditCard },
                  { value: "sbp" as const, label: "СБП", Icon: Smartphone },
                  { value: "pending" as const, label: "После подтверждения", Icon: Clock },
                ] as const
              ).map((method) => {
                const selected = watchPaymentMethod === method.value;
                const IconComp = method.Icon;
                return (
                  <label
                    key={method.value}
                    className={`flex cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-medium)] border py-3 text-sm transition-all ${
                      selected
                        ? "border-[var(--color-cherry)] bg-[color-mix(in_srgb,var(--paloma-orange)_14%,var(--paloma-white))] text-[var(--text-primary)]"
                        : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--color-cherry)]/40"
                    }`}
                  >
                    <input
                      type="radio"
                      value={method.value}
                      {...form2.register("paymentMethod")}
                      className="sr-only"
                    />
                    <IconComp size={17} className="shrink-0 opacity-85" strokeWidth={1.75} aria-hidden />
                    <span className="font-accent text-center leading-tight">{method.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="rounded-[var(--radius-medium)] border border-[var(--border)] bg-[var(--bg-secondary)] p-5 md:p-6">
            <h4
              className="mb-4 text-[var(--text-primary)]"
              style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-lg)", fontWeight: 400, letterSpacing: "-0.02em" }}
            >
              Ваш заказ
            </h4>
            <div className="mb-4 space-y-2">
              {items.map((item) => (
                <div key={`${item.id}-${item.size}`} className="flex justify-between text-sm">
                  <span className="font-accent text-[var(--text-secondary)]">
                    {item.title} ({item.size}) × {item.quantity}
                  </span>
                  <span className="font-medium text-[var(--text-primary)] tabular-nums">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {previewError ? (
              <p className="mb-4 whitespace-pre-wrap text-xs text-red-600">{previewError}</p>
            ) : null}

            <div className="space-y-2 border-t border-[var(--color-cherry)]/20 pt-3 text-sm">
              <div className="flex justify-between">
                <span className="font-accent text-[var(--text-secondary)]">Товары</span>
                <span className="font-medium tabular-nums text-[var(--text-primary)]">
                  {formatPrice(previewTotals?.subtotal ?? lineSubtotal)}
                </span>
              </div>
              {previewTotals && previewTotals.discountAmount > 0 ? (
                <div className="flex justify-between">
                  <span className="font-accent text-[var(--text-secondary)]">
                    Скидка{previewTotals.promoCode ? ` (${previewTotals.promoCode})` : ""}
                  </span>
                  <span className="font-medium tabular-nums text-[var(--color-cherry)]">
                    −{formatPrice(previewTotals.discountAmount)}
                  </span>
                </div>
              ) : null}
              {watchDeliveryType === "pickup" ? (
                <div className="flex justify-between">
                  <span className="font-accent text-[var(--text-secondary)]">Получение</span>
                  <span className="font-medium text-[var(--text-primary)]">Самовывоз · бесплатно</span>
                </div>
              ) : previewTotals ? (
                <>
                  <div className="flex justify-between">
                    <span className="max-w-[60%] font-accent text-[var(--text-secondary)]">
                      Доставка
                      {previewTotals.deliveryCity ? ` · ${previewTotals.deliveryCity}` : ""}
                    </span>
                    <span className="shrink-0 font-medium tabular-nums text-[var(--text-primary)]">
                      {previewTotals.deliveryCost === 0 ? "Бесплатно" : formatPrice(previewTotals.deliveryCost)}
                    </span>
                  </div>
                  {(watchDeliveryUrgency || watchDeliveryExactTime) && (
                    <p className="font-accent text-[11px] leading-snug text-[var(--text-secondary)]">
                      {watchDeliveryUrgency ? `Срочность +${DELIVERY_SURCHARGE_URGENCY} ₽` : null}
                      {watchDeliveryUrgency && watchDeliveryExactTime ? " · " : null}
                      {watchDeliveryExactTime ? `Точное время +${DELIVERY_SURCHARGE_EXACT_TIME} ₽` : null}
                      {watchDeliveryUrgency || watchDeliveryExactTime ? " — уже в сумме доставки выше." : null}
                    </p>
                  )}
                </>
              ) : previewLoading ? (
                <div className="font-accent text-xs text-[var(--text-secondary)]">Считаем доставку…</div>
              ) : (
                <div className="font-accent text-xs text-[var(--text-secondary)]">
                  {previewAddress
                    ? "Доставка не посчитана — проверьте адрес и соединение."
                    : "Заполните город и адрес, чтобы увидеть стоимость доставки."}
                </div>
              )}
            </div>

            <div className="flex justify-between border-t border-[var(--color-cherry)]/20 pt-3">
              <span className="font-accent text-sm font-medium text-[var(--text-primary)]">Итого к оплате</span>
              <span
                className="tabular-nums text-[var(--text-primary)]"
                style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", letterSpacing: "-0.02em" }}
              >
                {previewLoading && watchDeliveryType === "delivery" && previewAddress && !previewTotals
                  ? "…"
                  : formatPrice(payAmount)}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="agree"
              {...form2.register("agreePersonalData")}
              className="mt-0.5 h-4 w-4 accent-[var(--color-cherry)]"
            />
            <label htmlFor="agree" className="font-accent cursor-pointer text-xs text-[var(--text-secondary)]">
              Я соглашаюсь на{" "}
              <a
                href="/consent"
                className="text-[var(--color-cherry)] underline underline-offset-[3px] transition-colors hover:text-[var(--paloma-burgundy)]"
              >
                обработку персональных данных
              </a>{" "}
              и принимаю условия{" "}
              <a
                href="/offer"
                className="text-[var(--color-cherry)] underline underline-offset-[3px] transition-colors hover:text-[var(--paloma-burgundy)]"
              >
                публичной оферты
              </a>
            </label>
          </div>
          {form2.formState.errors.agreePersonalData && (
            <p className={errorClass}>{form2.formState.errors.agreePersonalData.message}</p>
          )}

          <button type="submit" disabled={submitHeld} className="btn-primary w-full justify-center disabled:opacity-60">
            {submitCta}
          </button>
        </form>
      )}
    </div>
  );
}
