import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { sendContactPageLead } from "@/lib/telegram";

const bodySchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(8),
  email: z.union([z.literal(""), z.string().email()]).optional(),
  message: z.string().max(3000).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json();
    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.flatten() }, { status: 400 });
    }

    const d = parsed.data;
    await sendContactPageLead({
      name: d.name.trim(),
      phone: d.phone.trim(),
      email: d.email?.trim() || undefined,
      message: d.message?.trim() || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("POST /api/leads/contact:", e);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}
