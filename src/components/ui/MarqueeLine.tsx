"use client";

/**
 * Цикличная строка (манифест бренда без «акций» и «выгоды»).
 */
const SEGMENT =
  "свежие сезонные цветы · фото перед отправкой · доставка день-в-день · PALOMA flowers coffee you · букеты, которые выглядят как событие · ";

export default function MarqueeLine() {
  const repeated = SEGMENT.repeat(3);

  return (
    <div className="w-full overflow-hidden py-3.5" style={{ background: "var(--color-burgundy)" }}>
      <div className="marquee-track flex whitespace-nowrap">
        {[repeated, repeated, repeated].map((t, i) => (
          <span
            key={i}
            className="flex-shrink-0 px-4 text-sm font-light tracking-wide text-[var(--text-on-dark)]"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
