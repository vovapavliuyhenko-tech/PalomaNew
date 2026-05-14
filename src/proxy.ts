import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { ADMIN_SESSION_COOKIE, isAdminAuthConfigured, verifyAdminSessionValue } from "@/lib/admin/session";

/** Пароль + httpOnly-сессия. Если ADMIN_PANEL_PASSWORD не задан — маршруты /admin доступны всем (dev). */
export function proxy(request: NextRequest) {
  if (!isAdminAuthConfigured()) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) {
    return NextResponse.next();
  }

  const cookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (verifyAdminSessionValue(cookie)) {
    return NextResponse.next();
  }

  const login = new URL("/admin/login", request.url);
  const nextTarget = pathname + request.nextUrl.search;
  if (nextTarget.startsWith("/admin")) {
    login.searchParams.set("next", nextTarget);
  }

  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/admin/:path*"],
};
