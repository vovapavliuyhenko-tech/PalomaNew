"use client";

import { motion } from "framer-motion";
import { Phone, Send } from "lucide-react";
import { fadeUpVariant, staggerContainer } from "@/lib/animations";
import { siteConfig } from "@/lib/siteConfig";
import { TrackOutboundAnchor } from "@/components/analytics/TrackOutboundAnchor";
import { analytics } from "@/lib/analytics";

export default function HelpChoosing() {
  return (
    <section className="py-14 lg:py-20 bg-[var(--color-bg-muted-block)]/60 border-y border-[var(--border)]">
      <div className="container mx-auto text-center lg:text-left">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="max-w-2xl lg:mx-0 mx-auto mb-10"
        >
          <motion.h2
            variants={fadeUpVariant}
            className="text-[var(--text-primary)] mb-4"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Нужна помощь с выбором?
          </motion.h2>
          <motion.p variants={fadeUpVariant} className="text-[var(--text-secondary)] text-sm leading-relaxed">
            Напишите нам — подберём букет под повод, бюджет и настроение.
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center lg:justify-start"
        >
          <motion.div variants={fadeUpVariant}>
            <TrackOutboundAnchor
              href={siteConfig.telegram}
              kind="telegram"
              source="help_choosing"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary w-full sm:w-auto justify-center border-[var(--color-coal)] text-[var(--text-primary)] hover:border-[var(--color-cherry)] inline-flex items-center gap-2"
            >
              <Send size={16} />
              Telegram
            </TrackOutboundAnchor>
          </motion.div>
          <motion.div variants={fadeUpVariant}>
            <TrackOutboundAnchor
              href={siteConfig.whatsapp}
              kind="whatsapp"
              source="help_choosing"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary w-full sm:w-auto justify-center border-[var(--color-coal)] text-[var(--text-primary)] hover:border-[var(--color-cherry)] inline-flex items-center gap-2"
            >
              WhatsApp
            </TrackOutboundAnchor>
          </motion.div>
          <motion.div variants={fadeUpVariant}>
            <a
              href={`tel:${siteConfig.phoneTel}`}
              className="btn-primary w-full sm:w-auto justify-center inline-flex items-center gap-2"
              onClick={() => analytics.clickPhone("help_choosing")}
            >
              <Phone size={16} />
              Позвонить
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
