import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_SEC,
  isAdminAuthConfigured,
  signAdminSessionValue,
  verifyAdminPassword,
} from "@/lib/admin/session";

export async function POST(request: NextRequest) {
  if (!isAdminAuthConfigured()) {
    return NextResponse.json(
      { error: "Пароль админки не задан (ADMIN_PANEL_PASSWORD). Раздел открыт без входа." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректное тело запроса." }, { status: 400 });
  }

  const password = typeof body === "object" && body !== null && "password" in body
    ? String((body as { password?: unknown }).password ?? "")
    : "";

  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ error: "Неверный пароль." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: signAdminSessionValue(),
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: ADMIN_SESSION_MAX_AGE_SEC,
  });
  return res;
}
