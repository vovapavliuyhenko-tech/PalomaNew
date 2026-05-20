import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  insertEventRequestRow,
  markEventRequestTelegramSent,
} from "@/lib/leads/insertLeads";
import { sendEventRequest } from "@/lib/telegram";

const bodySchema = z.object({
  eventType: z.string().min(1),
  date: z.string().min(1),
  items: z.array(z.string()).min(1),
  budget: z.string().min(1),
  name: z.string().min(2),
  phone: z.string().min(8),
  telegram: z.string().optional(),
  comment: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json();
    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.flatten() }, { status: 400 });
    }

    const d = parsed.data;
    const zones = d.items.join(", ");

    const persisted = await insertEventRequestRow({
      eventType: d.eventType,
      eventDate: d.date,
      name: d.name,
      phone: d.phone,
      zones,
      budget: d.budget,
      message: d.comment ?? null,
    });

    await sendEventRequest({
      name: d.name,
      phone: d.phone,
      telegram: d.telegram?.trim() || undefined,
      eventType: d.eventType,
      eventDate: d.date,
      items: d.items,
      budget: d.budget,
      comment: d.comment,
    });

    if (persisted.ok) await markEventRequestTelegramSent(persisted.id);

    return NextResponse.json({
      success: true,
      persistedToDb: persisted.ok,
    });
  } catch (e) {
    console.error("POST /api/leads/events:", e);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}
