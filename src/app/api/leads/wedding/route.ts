import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  insertEventRequestRow,
  markEventRequestTelegramSent,
} from "@/lib/leads/insertLeads";
import { sendEventRequest } from "@/lib/telegram";

const bodySchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(8),
  telegram: z.string().optional(),
  weddingDate: z.string().min(1),
  venue: z.string().optional(),
  guestCount: z.string().optional(),
  services: z.array(z.string()).min(1, "Выберите хотя бы одну услугу"),
  budget: z.string().min(1),
  comment: z.string().max(2000).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json();
    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.flatten() }, { status: 400 });
    }

    const d = parsed.data;
    const zones = d.services.join(", ");
    const extra = [
      d.venue?.trim() && `Площадка: ${d.venue.trim()}`,
      d.guestCount?.trim() && `Гости (примерно): ${d.guestCount.trim()}`,
      d.comment?.trim(),
    ]
      .filter(Boolean)
      .join("\n");

    const persisted = await insertEventRequestRow({
      eventType: "Свадьба — заявка /wedding",
      eventDate: d.weddingDate,
      name: d.name,
      phone: d.phone,
      zones,
      budget: d.budget,
      message: extra || null,
    });

    await sendEventRequest({
      name: d.name,
      phone: d.phone,
      telegram: d.telegram?.trim() || undefined,
      eventType: "Свадьба (страница свадебной флористики)",
      eventDate: d.weddingDate,
      items: d.services,
      budget: d.budget,
      comment: extra || undefined,
    });

    if (persisted.ok) await markEventRequestTelegramSent(persisted.id);

    return NextResponse.json({
      success: true,
      persistedToDb: persisted.ok,
    });
  } catch (e) {
    console.error("POST /api/leads/wedding:", e);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}
