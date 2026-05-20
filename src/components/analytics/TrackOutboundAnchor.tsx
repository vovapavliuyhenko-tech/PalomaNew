"use client";

import type { ComponentProps } from "react";
import { analytics } from "@/lib/analytics";

type Kind = "whatsapp" | "telegram";

type Props = Omit<ComponentProps<"a">, "onClick" | "href"> & {
  href: string;
  kind: Kind;
  source: string;
  onClick?: ComponentProps<"a">["onClick"];
};

export function TrackOutboundAnchor({ kind, source, onClick, ...rest }: Props) {
  return (
    <a
      {...rest}
      onClick={(e) => {
        if (kind === "whatsapp") analytics.clickWhatsapp(source);
        else analytics.clickTelegram(source);
        onClick?.(e);
      }}
    />
  );
}
