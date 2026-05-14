"use client";

import { siteConfig } from "@/lib/siteConfig";

export default function ContactMap() {
  return (
    <div className="w-full h-full min-h-[300px] bg-[var(--color-gray)] rounded-[var(--radius-small)] overflow-hidden relative border border-[var(--border)]">
      <iframe
        src="https://yandex.ru/map-widget/v1/?ll=37.768743%2C44.723855&z=16&l=map&pt=37.768743,44.723855,pm2rdl~"
        width="100%"
        height="100%"
        className="absolute inset-0 w-full h-full"
        frameBorder="0"
        allowFullScreen
        title={`${siteConfig.legalName} на карте`}
      />
    </div>
  );
}
