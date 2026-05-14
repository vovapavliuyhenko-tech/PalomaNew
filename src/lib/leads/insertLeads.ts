import { createSupabaseServiceClient } from "@/lib/supabase/admin";

export type EventRequestPayload = {
  eventType: string;
  eventDate: string;
  name: string;
  phone: string;
  email?: string | null;
  zones: string;
  budget: string;
  message?: string | null;
};

export async function insertEventRequestRow(
  payload: EventRequestPayload
): Promise<{ ok: true; id: string } | { ok: false }> {
  try {
    const sb = createSupabaseServiceClient();
    const { data, error } = await sb
      .from("event_requests")
      .insert({
        event_type: payload.eventType,
        event_date: payload.eventDate,
        name: payload.name,
        phone: payload.phone,
        email: payload.email ?? null,
        zones: payload.zones,
        budget: payload.budget,
        message: payload.message ?? null,
        status: "new",
        telegram_notified: false,
      })
      .select("id")
      .single();

    if (error || !data?.id) {
      console.error("insertEventRequestRow:", error?.message);
      return { ok: false };
    }

    return { ok: true, id: data.id };
  } catch {
    return { ok: false };
  }
}

export async function markEventRequestTelegramSent(id: string): Promise<void> {
  try {
    const sb = createSupabaseServiceClient();
    await sb.from("event_requests").update({ telegram_notified: true }).eq("id", id);
  } catch {
    /* noop */
  }
}

export type SubscriptionLeadPayload = {
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  frequency: number;
  composition: string;
  size: string;
  price: number;
  addVase: boolean;
  addSecateur: boolean;
  deliveryAddress?: string | null;
  message?: string | null;
};

export type WeddingPiggybankPayload = {
  coupleName: string;
  /** YYYY-MM-DD */
  weddingDate: string;
  phone: string;
  telegram?: string | null;
};

function normalizeTelegramHandle(raw: string | undefined | null): string | null {
  const t = typeof raw === "string" ? raw.trim() : "";
  if (!t) return null;
  return t.replace(/^@+/, "") || null;
}

export async function insertWeddingPiggybankLeadRow(
  payload: WeddingPiggybankPayload
): Promise<{ ok: true; id: string } | { ok: false }> {
  try {
    const sb = createSupabaseServiceClient();
    const { data, error } = await sb
      .from("wedding_piggybank_requests")
      .insert({
        couple_name: payload.coupleName.trim(),
        wedding_date: payload.weddingDate,
        phone: payload.phone.trim(),
        telegram: normalizeTelegramHandle(payload.telegram),
        status: "new",
        telegram_notified: false,
      })
      .select("id")
      .single();

    if (error || !data?.id) {
      console.error("insertWeddingPiggybankLeadRow:", error?.message);
      return { ok: false };
    }

    return { ok: true, id: data.id };
  } catch {
    return { ok: false };
  }
}

export async function markWeddingPiggybankTelegramSent(id: string): Promise<void> {
  try {
    const sb = createSupabaseServiceClient();
    await sb.from("wedding_piggybank_requests").update({ telegram_notified: true }).eq("id", id);
  } catch {
    /* noop */
  }
}

export async function insertSubscriptionLeadRow(
  payload: SubscriptionLeadPayload
): Promise<{ ok: true; id: string } | { ok: false }> {
  try {
    const sb = createSupabaseServiceClient();
    const composition = [payload.composition, payload.message].filter(Boolean).join("\n\n") || null;

    const { data, error } = await sb
      .from("subscription_orders")
      .insert({
        customer_name: payload.customerName,
        customer_phone: payload.customerPhone,
        customer_email: payload.customerEmail ?? null,
        frequency: payload.frequency,
        composition,
        size: payload.size,
        price: payload.price,
        add_vase: payload.addVase,
        add_secateur: payload.addSecateur,
        delivery_address: payload.deliveryAddress ?? null,
        status: "new",
        payment_status: "pending",
      })
      .select("id")
      .single();

    if (error || !data?.id) {
      console.error("insertSubscriptionLeadRow:", error?.message);
      return { ok: false };
    }

    return { ok: true, id: data.id };
  } catch {
    return { ok: false };
  }
}
