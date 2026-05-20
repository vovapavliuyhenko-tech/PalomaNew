import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { insertSubscriptionLeadRow } from "@/lib/leads/insertLeads";
import { sendSubscriptionLead } from "@/lib/telegram";

const bodySchema = z.object({
  planName: z.string().min(1),
  price: z.number().positive(),
  freqWeeks: z.union([z.literal(1), z.literal(2)]),
  freqLabel: z.string().min(1),
  customerName: z.string().min(2),
  phone: z.string().min(8),
  email: z.union([z.string().email(), z.literal("")]).optional(),
  deliveryAddress: z.string().optional(),
  addVase: z.boolean().optional(),
  addSecateur: z.boolean().optional(),
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
    const email = d.email?.trim() || undefined;

    const persisted = await insertSubscriptionLeadRow({
      customerName: d.customerName,
      customerPhone: d.phone,
      customerEmail: email ?? null,
      frequency: d.freqWeeks,
      composition: `Тариф PALOMA · ${d.planName}`,
      size: d.planName,
      price: d.price,
      addVase: Boolean(d.addVase),
      addSecateur: Boolean(d.addSecateur),
      deliveryAddress: d.deliveryAddress?.trim() || null,
      message: d.comment ?? null,
    });

    await sendSubscriptionLead({
      customerName: d.customerName,
      phone: d.phone,
      email,
      planName: d.planName,
      price: d.price,
      freqLabel: d.freqLabel,
      deliveryAddress: d.deliveryAddress,
      addVase: Boolean(d.addVase),
      addSecateur: Boolean(d.addSecateur),
      comment: d.comment,
    });

    return NextResponse.json({
      success: true,
      persistedToDb: persisted.ok,
    });
  } catch (e) {
    console.error("POST /api/leads/subscription:", e);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}
