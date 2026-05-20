import { NextRequest, NextResponse } from "next/server";

import {
  insertWeddingPiggybankLeadRow,
  markWeddingPiggybankTelegramSent,
} from "@/lib/leads/insertLeads";
import { sendEventRequest, sendWeddingPiggybank } from "@/lib/telegram";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, ...data } = body;

    if (type === "event") {
      await sendEventRequest(data);
    } else if (type === "wedding-piggybank") {
      const persisted = await insertWeddingPiggybankLeadRow({
        coupleName: String(data.coupleName ?? ""),
        weddingDate: String(data.weddingDate ?? ""),
        phone: String(data.phone ?? ""),
        telegram: data.telegram,
      });
      await sendWeddingPiggybank({
        coupleName: String(data.coupleName ?? ""),
        weddingDate: String(data.weddingDate ?? ""),
        phone: String(data.phone ?? ""),
        telegram: data.telegram,
      });
      if (persisted.ok) await markWeddingPiggybankTelegramSent(persisted.id);
    } else {
      return NextResponse.json({ error: "Unknown type" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Telegram API error:", error);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
