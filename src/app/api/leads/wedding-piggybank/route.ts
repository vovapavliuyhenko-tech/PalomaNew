import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  insertWeddingPiggybankLeadRow,
  markWeddingPiggybankTelegramSent,
} from "@/lib/leads/insertLeads";
import { sendWeddingPiggybank } from "@/lib/telegram";

const bodySchema = z.object({
  coupleName: z.string().min(3),
  weddingDate: z.string().min(8),
  phone: z.string().min(11),
  telegram: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json();
    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.flatten() }, { status: 400 });
    }

    const d = parsed.data;

    const persisted = await insertWeddingPiggybankLeadRow({
      coupleName: d.coupleName,
      weddingDate: d.weddingDate,
      phone: d.phone,
      telegram: d.telegram,
    });

    await sendWeddingPiggybank({
      coupleName: d.coupleName,
      weddingDate: d.weddingDate,
      phone: d.phone,
      telegram: d.telegram,
    });

    if (persisted.ok) await markWeddingPiggybankTelegramSent(persisted.id);

    return NextResponse.json({
      success: true,
      persistedToDb: persisted.ok,
    });
  } catch (e) {
    console.error("POST /api/leads/wedding-piggybank:", e);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}
