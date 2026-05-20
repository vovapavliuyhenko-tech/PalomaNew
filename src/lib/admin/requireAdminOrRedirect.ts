import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ADMIN_SESSION_COOKIE, isAdminAuthConfigured, verifyAdminSessionValue } from "./session";

/** Если задан пароль админки — проверяем cookie; иначе пропускаем (локальная разработка). */
export async function requireAdminOrRedirect() {
  if (!isAdminAuthConfigured()) return;
  const jar = await cookies();
  const raw = jar.get(ADMIN_SESSION_COOKIE)?.value;
  if (!verifyAdminSessionValue(raw)) {
    redirect("/admin/login");
  }
}
