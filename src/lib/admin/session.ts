import { createHmac, timingSafeEqual } from "node:crypto";

/** HttpOnly cookie set after successful login (этап: защита админки без Supabase Auth). */
export const ADMIN_SESSION_COOKIE = "paloma_admin_session";

const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export function adminPanelPassword(): string {
  return (process.env.ADMIN_PANEL_PASSWORD ?? process.env.ADMIN_DASHBOARD_PASSWORD ?? "").trim();
}

export function isAdminAuthConfigured(): boolean {
  return adminPanelPassword().length > 0;
}

function signingSecret(): string {
  const explicit = (process.env.ADMIN_SESSION_SECRET ?? "").trim();
  if (explicit.length > 0) return explicit;
  const pwd = adminPanelPassword();
  if (pwd.length > 0) return `paloma-admin-hmac|${pwd}`;
  return "";
}

/** Constant-time string compare (длина учитывается в diff). */
function ctEqual(a: string, b: string): boolean {
  const max = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < max; i++) {
    const ca = i < a.length ? a.charCodeAt(i) : 0;
    const cb = i < b.length ? b.charCodeAt(i) : 0;
    diff |= ca ^ cb;
  }
  return diff === 0;
}

export function verifyAdminPassword(candidate: string): boolean {
  const expected = adminPanelPassword();
  if (!expected) return false;
  return ctEqual(candidate, expected);
}

export function signAdminSessionValue(): string {
  const secret = signingSecret();
  const issued = String(Date.now());
  const sig = createHmac("sha256", secret).update(issued).digest("hex");
  return `${issued}.${sig}`;
}

export function verifyAdminSessionValue(raw: string | undefined): boolean {
  if (!raw || !isAdminAuthConfigured()) return false;
  const secret = signingSecret();
  if (!secret) return false;
  const parts = raw.split(".");
  if (parts.length !== 2) return false;
  const [issued, sig] = parts;
  if (!/^\d+$/.test(issued)) return false;
  const expectedSig = createHmac("sha256", secret).update(issued).digest("hex");
  if (sig.length !== expectedSig.length) return false;
  try {
    if (!timingSafeEqual(Buffer.from(sig, "utf8"), Buffer.from(expectedSig, "utf8"))) return false;
  } catch {
    return false;
  }
  const age = Date.now() - Number(issued);
  if (!Number.isFinite(age) || age < 0 || age > MAX_AGE_MS) return false;
  return true;
}

export const ADMIN_SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7;
