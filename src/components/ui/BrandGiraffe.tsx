"use client";

import Image from "next/image";
import { useState } from "react";
import { GIRAFFE_IMAGE_CANDIDATES } from "@/lib/brandAssets";

type BrandGiraffeProps = {
  className?: string;
  /** text-xs для alt в decorative */
  priority?: boolean;
  withAnimation?: boolean;
};

export function BrandGiraffe({ className = "", priority = false, withAnimation = false }: BrandGiraffeProps) {
  const [i, setI] = useState(0);
  const src = GIRAFFE_IMAGE_CANDIDATES[Math.min(i, GIRAFFE_IMAGE_CANDIDATES.length - 1)];

  return (
    <div
      className={`relative h-full w-full select-none ${withAnimation ? "brand-giraffe-walk" : ""} ${className}`}
    >
      <Image
        src={src}
        alt=""
        fill
        priority={priority}
        className="object-contain object-bottom drop-shadow-[0_12px_32px_rgba(0,0,0,0.18)]"
        sizes="(max-width: 1024px) 70vw, 420px"
        onError={() => {
          if (i < GIRAFFE_IMAGE_CANDIDATES.length - 1) setI((n) => n + 1);
        }}
      />
    </div>
  );
}
