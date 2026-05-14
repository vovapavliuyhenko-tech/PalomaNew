import { formatDate, formatPrice } from "./utils";

export { formatPrice, formatDate };

/** Форматирует российский номер в вид +7 (XXX) XXX-XX-XX при 11 цифрах. */
export function formatPhone(digits: string): string {
  const n = digits.replace(/\D/g, "");
  const tail = n.startsWith("8") ? n.slice(1) : n.startsWith("7") ? n.slice(1) : n;
  if (tail.length !== 10) return digits.trim();
  const a = tail.slice(0, 3);
  const b = tail.slice(3, 6);
  const c = tail.slice(6, 8);
  const d = tail.slice(8, 10);
  return `+7 (${a}) ${b}-${c}-${d}`;
}
