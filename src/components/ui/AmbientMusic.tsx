"use client";

import { useEffect, useRef } from "react";
import { useUIStore } from "@/lib/store/uiStore";

const SRC = "/audio/paloma-ambient.mp3";

/**
 * Фоновый loop только после явного включения пользователем (uiStore, без автоплея).
 * При prefers-reduced-motion воспроизведение не стартует даже если в storage было «вкл».
 */
export default function AmbientMusic() {
  const isMusicPlaying = useUIStore((s) => s.isMusicPlaying);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const el = new Audio(SRC);
    el.loop = true;
    el.volume = 0.22;
    el.preload = "none";
    const onErr = () => {
      /* optional file — ignore */
    };
    el.addEventListener("error", onErr);
    audioRef.current = el;
    return () => {
      el.removeEventListener("error", onErr);
      el.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (isMusicPlaying && !reduce) {
      void el.play().catch(() => {
        /* autoplay policies / missing file */
      });
    } else {
      el.pause();
    }
  }, [isMusicPlaying]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => {
      const el = audioRef.current;
      if (!el) return;
      if (mq.matches) {
        el.pause();
      } else if (useUIStore.getState().isMusicPlaying) {
        void el.play().catch(() => {});
      }
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return null;
}
