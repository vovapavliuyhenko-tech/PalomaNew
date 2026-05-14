"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { fadeUpVariant, staggerContainer } from "@/lib/animations";
import { siteConfig } from "@/lib/siteConfig";

const photos = [
  "https://images.unsplash.com/photo-1487530811015-780780169993?w=500&q=80",
  "https://images.unsplash.com/photo-1490750967868-88df5691cc9d?w=500&q=80",
  "https://images.unsplash.com/photo-1534687941688-651ccaafbff8?w=500&q=80",
  "https://images.unsplash.com/photo-1559181567-c3190ca9be3b?w=500&q=80",
  "https://images.unsplash.com/photo-1555217851-6141535bd771?w=500&q=80",
  "https://images.unsplash.com/photo-1531164158738-c3c60f32bcf8?w=500&q=80",
];

export default function InstagramBlock() {
  return (
    <section className="py-20 bg-[var(--bg-card)]">
      <div className="container mx-auto">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <motion.p
            variants={fadeUpVariant}
            className="text-[var(--color-cherry)] text-xs uppercase tracking-[var(--ls-widest)] mb-3"
          >
            {siteConfig.instagramHandle}
          </motion.p>
          <motion.h2
            variants={fadeUpVariant}
            className="text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            PALOMA в Instagram
          </motion.h2>
          <motion.p
            variants={fadeUpVariant}
            className="mt-3 text-sm text-[var(--text-secondary)] max-w-lg mx-auto"
          >
            Живые кадры букетов, кофейни и атмосферы — наведите на фото, чтобы заглянуть в ленту.
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-6"
        >
          {photos.map((src, i) => (
            <motion.a
              key={i}
              href={siteConfig.instagram}
              target="_blank"
              rel="noopener noreferrer"
              variants={fadeUpVariant}
              className="relative aspect-square overflow-hidden rounded-sm group"
            >
              <Image
                src={src}
                alt={`Instagram фото ${i + 1}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-[var(--color-cherry)]/0 group-hover:bg-[var(--color-cherry)]/20 transition-colors duration-300" />
            </motion.a>
          ))}
        </motion.div>

        <div className="text-center">
          <a
            href={siteConfig.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-sm"
          >
            Открыть Instagram
          </a>
        </div>
      </div>
    </section>
  );
}
