"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { fadeUpVariant, staggerContainer } from "@/lib/animations";

const steps = [
  { title: "Вы выбираете букет", text: "В каталоге или вместе с флористом — под палитру и повод." },
  { title: "Мы подтверждаем заказ", text: "Согласуем детали интервала, адрес и пожелания." },
  { title: "Флорист собирает букет", text: "Используем свежие сезонные цветы и фирменную эстетику PALOMA." },
  { title: "Фото перед доставкой", text: "По запросу пришлём кадр — вы увидите результат заранее." },
  { title: "Аккуратно упаковываем", text: "Чтобы дорога не утомила цветы и сохранился характер букета." },
  { title: "Доставляем день-в-день", text: "Когда возможно по городу — в оговорённое окно." },
] as const;

function StepCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex h-full w-[min(78vw,360px)] flex-shrink-0 flex-col justify-between border border-[var(--border)] bg-[var(--bg-card)] p-8 md:w-[340px] md:p-10 rounded-[var(--radius-medium)] shadow-[var(--shadow-card)]">
      <h3 className="text-xl text-[var(--text-primary)] mb-4" style={{ fontFamily: "var(--font-serif)" }}>
        {title}
      </h3>
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{text}</p>
    </div>
  );
}

export default function FulfillmentProcess() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const stRef = useRef<{ kill: () => void } | null>(null);
  const [layout, setLayout] = useState<"ssr" | "mobile" | "desktop">("ssr");

  useEffect(() => {
    const q = () => setLayout(window.innerWidth < 1024 ? "mobile" : "desktop");
    q();
    window.addEventListener("resize", q);
    return () => window.removeEventListener("resize", q);
  }, []);

  useEffect(() => {
    if (layout !== "desktop") return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;

    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    let cancelled = false;

    void (async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      gsap.set(track, { x: 0 });

      const st = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: () => {
          const dist = Math.max(track.scrollWidth - window.innerWidth, 0);
          return `+=${Math.max(dist, 1)}`;
        },
        pin: true,
        scrub: 1.15,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const dist = Math.max(track.scrollWidth - window.innerWidth, 0);
          gsap.set(track, { x: -dist * self.progress });
        },
      });
      if (cancelled) {
        st.kill();
        return;
      }
      stRef.current = st;
    })();

    return () => {
      cancelled = true;
      stRef.current?.kill();
      stRef.current = null;
      void import("gsap").then(({ gsap }) => {
        if (trackRef.current) gsap.set(trackRef.current, { clearProps: "transform" });
      });
    };
  }, [layout]);

  useEffect(() => {
    if (layout !== "desktop") return;
    const onResize = () => {
      void import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => ScrollTrigger.refresh());
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [layout]);

  if (layout === "ssr") {
    return (
      <section
        className="min-h-[200px] bg-[var(--color-bg-shell)] border-y border-[var(--border)]"
        aria-hidden
      />
    );
  }

  if (layout === "mobile") {
    return (
      <section className="relative border-y border-[var(--border)] bg-[var(--color-bg-shell)] py-16">
        <div className="container mx-auto">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-10"
          >
            <motion.h2
              variants={fadeUpVariant}
              className="text-[var(--text-primary)] mb-3"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Как мы работаем
            </motion.h2>
            <motion.p variants={fadeUpVariant} className="text-sm text-[var(--text-secondary)] max-w-xl">
              Шесть шагов — от выбора до доставки.
            </motion.p>
          </motion.div>
          <ol className="space-y-4">
            {steps.map((s, i) => (
              <motion.li
                key={s.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="border border-[var(--border)] bg-[var(--bg-card)] rounded-[var(--radius-medium)] p-5"
              >
                <span className="text-[var(--color-cherry)] text-xs font-medium">{i + 1} / {steps.length}</span>
                <h3 className="text-lg text-[var(--text-primary)] mt-2" style={{ fontFamily: "var(--font-serif)" }}>
                  {s.title}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] mt-2">{s.text}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      id="fulfillment-process"
      className="relative overflow-hidden bg-[var(--color-bg-shell)]"
      style={{ height: "100vh" }}
    >
      <div className="pointer-events-none absolute left-[var(--container-pad)] top-10 z-20 max-w-xl lg:top-12">
        <h2 className="text-[var(--text-primary)] mb-2" style={{ fontFamily: "var(--font-serif)" }}>
          Как мы работаем
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">Листайте вправо — шаг за шагом.</p>
      </div>

      <div
        ref={trackRef}
        className="absolute top-1/2 left-0 flex h-[55vh] max-h-[420px] min-h-[300px] -translate-y-40 items-stretch gap-6 px-[var(--container-pad)] lg:gap-8 lg:-translate-y-32"
        style={{ willChange: "transform" }}
      >
        {steps.map((s) => (
          <StepCard key={s.title} title={s.title} text={s.text} />
        ))}
        <div className="w-[30vw] flex-shrink-0" aria-hidden />
      </div>
    </section>
  );
}
